import { Eyebrow, Skeleton } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Loading } from "@/shared/components/Loading";

import { skeletonStyles, styles } from "./styles/index.styles";

/** An artist's record while it loads: the artist's block, the map and the folded sections in skeleton. */
export function ArtistRecordSkeleton() {
  const t = useTranslations("TRAJECTORIES");

  return (
    <main className={styles.record}>
      <Loading className={skeletonStyles.record}>
        <Skeleton shape="text" width={120} />

        <div className={styles.top}>
          <div className={styles.profile}>
            <div className={styles.identity}>
              <Skeleton className={`${styles.portrait} ${skeletonStyles.portrait}`} />
              <div className={styles.naming}>
                <Eyebrow>{t("EYEBROW")}</Eyebrow>
                <Skeleton height={40} width="12rem" />
              </div>
            </div>
            <div className={styles.life}>
              <Skeleton height={36} width={200} />
              <Skeleton height={36} width={200} />
            </div>
            <Skeleton height={42} />
          </div>
          <Skeleton className={`${skeletonStyles.map} ${styles.map}`} height="100%" />
        </div>

        <Skeleton height={44} />

        <div className={styles.sections}>
          {[t("TRAJECTORY"), t("WORKS_TITLE"), t("EXHIBITIONS_TITLE"), t("PUBLICATIONS_TITLE")].map((title) => (
            <div key={title} className={skeletonStyles.section}>
              <span className={skeletonStyles.sectionTitle}>{title}</span>
              <Skeleton height={20} width={110} />
            </div>
          ))}
        </div>
      </Loading>
    </main>
  );
}
