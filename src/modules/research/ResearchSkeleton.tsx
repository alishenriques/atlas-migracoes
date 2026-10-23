import { Eyebrow, Skeleton } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Loading } from "@/shared/components/Loading";

import { skeletonStyles, styles } from "./styles/index.styles";

/** IA Relacional while the artist list loads: the presentation already, and the picker in skeleton. */
export function ResearchSkeleton() {
  const t = useTranslations("RESEARCH");

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <header className={styles.header}>
          <Eyebrow>{t("EYEBROW")}</Eyebrow>
          <h1 className={styles.title}>{t("TITLE")}</h1>
          <p className={styles.intro}>{t("INTRO")}</p>
        </header>
        {/* The picker's label over its field. */}
        <Loading className={skeletonStyles.picker}>
          <Skeleton shape="text" width="25%" />
          <Skeleton height={38} />
        </Loading>
      </div>
    </main>
  );
}
