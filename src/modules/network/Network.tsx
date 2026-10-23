import { Eyebrow } from "@alishenriques/atlas-design-system";
import { getTranslations } from "next-intl/server";

import type { NetworkData } from "@/lib/schemas";
import { DemoNotice } from "@/shared/components/DemoNotice";

import { NetworkExplorer } from "./components/NetworkExplorer";
import { styles } from "./styles/index.styles";

export type NetworkProps = {
  data: NetworkData | null;
  /** Artist to center the network on when the screen opens, from `?artista=`. */
  initialSlug: string | null;
};

/** The Rede Relacional screen: the links between artists, works, exhibitions, publications, institutions and places. */
export async function Network({ data, initialSlug }: NetworkProps) {
  const t = await getTranslations("NETWORK");

  const header = (
    <>
      {data?.meta.source === "demo" && <DemoNotice />}
      <header className={styles.header}>
        <Eyebrow>{t("EYEBROW")}</Eyebrow>
        <h1 className={styles.title}>{t("TITLE")}</h1>
        <p className={styles.intro}>{t("INTRO")}</p>
      </header>
    </>
  );
  const credit = <p className={styles.credit}>{t("SOURCE")}</p>;

  return (
    <main className={styles.page}>
      {data ? (
        <NetworkExplorer data={data} initialSlug={initialSlug} intro={header} footer={credit} />
      ) : (
        <div className={styles.fallback}>
          {header}
          <p className={styles.muted}>{t("DATA_UNAVAILABLE")}</p>
          {credit}
        </div>
      )}
    </main>
  );
}
