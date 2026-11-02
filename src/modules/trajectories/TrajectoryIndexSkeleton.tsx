import { Eyebrow } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { ArtistGridSkeleton } from "@/shared/components/ArtistGrid";

import { styles } from "./styles/index.styles";

/** Trajetórias while the artists load: the presentation already, and the cards in skeleton. */
export function TrajectoryIndexSkeleton() {
  const t = useTranslations("TRAJECTORIES");

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

      <ArtistGridSkeleton />
    </main>
  );
}
