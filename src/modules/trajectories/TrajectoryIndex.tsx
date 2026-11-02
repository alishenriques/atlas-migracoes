import { Eyebrow } from "@alishenriques/atlas-design-system";
import { getLocale, getTranslations } from "next-intl/server";

import type { ArtistIndex } from "@/lib/schemas";
import { ArtistGrid, artistCards } from "@/shared/components/ArtistGrid";
import { DemoNotice } from "@/shared/components/DemoNotice";

import { styles } from "./styles/index.styles";

/** Every artist in the collection, alphabetically, each linking to their record. */
export async function TrajectoryIndex({ data }: { data: ArtistIndex | null }) {
  const [t, tStop, locale] = await Promise.all([
    getTranslations("TRAJECTORIES"),
    getTranslations("TRAJECTORY"),
    getLocale(),
  ]);

  return (
    <main className={styles.index}>
      {data?.meta.source === "demo" && <DemoNotice />}
      <header className={styles.header}>
        <Eyebrow>{t("EYEBROW")}</Eyebrow>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t("TITLE")}</h1>
          <span aria-hidden="true" className={styles.titleSeparator} />
          <p className={styles.titleNote}>{t("TITLE_NOTE")}</p>
        </div>
        <p className={styles.intro}>{t("INTRO")}</p>
      </header>

      {data ? (
        <ArtistGrid
          artists={artistCards(data.artists, locale, tStop("UNKNOWN_DATE"))}
          route="/trajetorias/[slug]"
          label={t("TITLE_NOTE")}
        />
      ) : (
        <p className={styles.muted}>{t("LIST_UNAVAILABLE")}</p>
      )}
    </main>
  );
}
