import { getLocale, getTranslations } from "next-intl/server";

import type { ArtistIndex } from "@/lib/schemas";
import { ArtistGrid, artistCards } from "@/shared/components/ArtistGrid";
import { DemoNotice } from "@/shared/components/DemoNotice";

import { ResearchHeader } from "./components/ResearchHeader";
import { styles } from "./styles/index.styles";

/** IA Relacional's first screen: the artists of the collection, as on Trajetórias, each opening their research. */
export async function ResearchIndex({ data }: { data: ArtistIndex | null }) {
  const [t, locale] = await Promise.all([getTranslations("RESEARCH"), getLocale()]);

  return (
    <main className={styles.page}>
      {data?.meta.source === "demo" && <DemoNotice />}
      <ResearchHeader />

      {data ? (
        <ArtistGrid artists={artistCards(data.artists, locale, t("UNKNOWN_DATE"))} route="/ia-relacional/[slug]" label={t("TITLE_NOTE")} />
      ) : (
        <p className={styles.muted}>{t("LIST_UNAVAILABLE")}</p>
      )}
    </main>
  );
}
