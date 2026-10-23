import { Skeleton } from "@alishenriques/atlas-design-system";
import { getTranslations } from "next-intl/server";

import { getOverview } from "@/lib/atlas";
import { CollectionStats } from "@/shared/components/CollectionStats";
import { DemoNotice } from "@/shared/components/DemoNotice";
import { Loading } from "@/shared/components/Loading";

import { styles } from "./styles/index.styles";

/** The collection counters, read from the API; the rest of the home page does not wait for them. */
export async function HomeCounters() {
  const overview = await getOverview().catch((error: unknown) => {
    console.error("Failed to load the collection overview:", error instanceof Error ? error.message : error);
    return null;
  });
  if (!overview) {
    const t = await getTranslations("HOME.COUNTERS");
    return <p className={styles.muted}>{t("UNAVAILABLE")}</p>;
  }
  return (
    <>
      {overview.meta.source === "demo" && <DemoNotice />}
      <CollectionStats stats={overview.stats} />
    </>
  );
}

/** The counters' place while they load. */
export function HomeCountersSkeleton() {
  return (
    <Loading className={styles.skeleton}>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} height={44} />
      ))}
    </Loading>
  );
}
