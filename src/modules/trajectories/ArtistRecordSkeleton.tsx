import { Skeleton } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Loading } from "@/shared/components/Loading";

import { styles as connections } from "./components/ConnectionsCard/styles/index.styles";
import { styles as institutions } from "./components/InstitutionsCard/styles/index.styles";
import { styles as card } from "./components/ProfileCard/styles/index.styles";
import { skeletonStyles, styles } from "./styles/index.styles";

/** An artist's record while it loads: the artist's block, the map with the folded sections, and the connections and institutions in skeleton. */
export function ArtistRecordSkeleton() {
  const t = useTranslations("TRAJECTORIES");

  return (
    <main className={styles.record}>
      <Loading className={skeletonStyles.record}>
        <div className={styles.top}>
          <div className={`${card.card} ${styles.profile}`}>
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
          <div className={styles.center}>
            <Skeleton className={`${skeletonStyles.map} ${styles.map}`} height="100%" />
            <Skeleton height={44} />
            <div className={styles.sections}>
              {[t("TRAJECTORY"), t("WORKS_TITLE"), t("EXHIBITIONS_TITLE"), t("PUBLICATIONS_TITLE")].map((title) => (
                <div key={title} className={skeletonStyles.section}>
                  <span className={skeletonStyles.sectionTitle}>{title}</span>
                  <Skeleton height={20} width={110} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.aside}>
            <div className={connections.card}>
              <h2 className={connections.title}>{t("CONNECTIONS")}</h2>
              <Skeleton className={skeletonStyles.connections} height="100%" />
            </div>
            <div className={institutions.card}>
              <h2 className={institutions.title}>{t("INSTITUTIONS")}</h2>
              <Skeleton shape="text" lines={5} />
            </div>
          </div>
        </div>
      </Loading>
    </main>
  );
}
