import { Eyebrow } from "@alishenriques/atlas-design-system";
import { getLocale, getTranslations } from "next-intl/server";

import type { ArtistIndex } from "@/lib/schemas";

import { ArtistGrid } from "./components/ArtistGrid";
import { styles } from "./styles/index.styles";
import { lifeSpan } from "./utils/life";

/** Every artist in the collection, alphabetically, each linking to their record. */
export async function TrajectoryIndex({ data }: { data: ArtistIndex | null }) {
  const [t, tStop, locale] = await Promise.all([
    getTranslations("TRAJECTORIES"),
    getTranslations("TRAJECTORY"),
    getLocale(),
  ]);

  return (
    <main className={styles.index}>
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
          artists={data.artists.map((artist) => ({
            slug: artist.slug,
            name: artist.name,
            photo: artist.photo?.url ?? null,
            meta: [artist.birthPlace?.country, lifeSpan(artist.birthDate, artist.deathDate, locale, tStop("UNKNOWN_DATE"))]
              .filter(Boolean)
              .join(" · "),
          }))}
        />
      ) : (
        <p className={styles.muted}>{t("LIST_UNAVAILABLE")}</p>
      )}
    </main>
  );
}
