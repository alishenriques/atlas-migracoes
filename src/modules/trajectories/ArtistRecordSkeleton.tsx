import { Skeleton } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Loading } from "@/shared/components/Loading";

import { styles as card } from "./components/ProfileCard/styles/index.styles";
import { skeletonStyles, styles } from "./styles/index.styles";

/** An artist's record while it loads: the artist's block, the map and the folded sections in skeleton. */
export function ArtistRecordSkeleton() {
  const t = useTranslations("TRAJECTORIES");

  return (
    <main className={styles.record}>
      <Loading className={skeletonStyles.record}>
        <div className={styles.top}>
          <div className={card.card}>
            <Skeleton shape="text" width={80} />
            <div className={card.identity}>
              <Skeleton className={`${card.portrait} ${skeletonStyles.portrait}`} />
              <div className={card.naming}>
                <Skeleton height={40} width="10rem" />
                <Skeleton shape="text" width="6rem" />
              </div>
            </div>
            <Skeleton shape="text" lines={4} />
            <Skeleton shape="text" lines={6} />
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
