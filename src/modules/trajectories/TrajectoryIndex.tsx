import { Avatar, Eyebrow } from "@alishenriques/atlas-design-system";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { MapData } from "@/lib/schemas";

import { styles } from "./styles/index.styles";
import { lifeSpan } from "./utils/life";

/** Every artist in the collection, alphabetically, each linking to their record. */
export async function TrajectoryIndex({ data }: { data: MapData | null }) {
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
        <ul className={styles.grid}>
          {data.artists.map((artist) => (
            <li key={artist.slug}>
              <Link href={{ pathname: "/trajetorias/[slug]", params: { slug: artist.slug } }} className={styles.card}>
                <span className={styles.cardText}>
                  <span className={styles.cardName}>{artist.name}</span>
                  <span className={styles.itemMeta}>
                    {[artist.birthPlace?.country, lifeSpan(artist.birthDate, artist.deathDate, locale, tStop("UNKNOWN_DATE"))]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {/* No artist photos in the collection yet: the avatar marks the empty slot. */}
                <Avatar label={t("NO_PHOTO")} title={t("NO_PHOTO")} size={52} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.muted}>{t("LIST_UNAVAILABLE")}</p>
      )}
    </main>
  );
}
