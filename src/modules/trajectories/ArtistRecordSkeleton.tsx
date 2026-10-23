import { Eyebrow, Panel, Skeleton } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Loading } from "@/shared/components/Loading";

import { skeletonStyles, styles } from "./styles/index.styles";

/** An artist's record while it loads: the name, the map, the trajectory and the lists in skeleton. */
export function ArtistRecordSkeleton() {
  const t = useTranslations("TRAJECTORIES");

  return (
    <main className={styles.record}>
      <Loading className={skeletonStyles.record}>
        <Skeleton shape="text" width={120} />

        <div className={styles.header}>
          <Eyebrow>{t("EYEBROW")}</Eyebrow>
          <Skeleton height={48} width="min(28rem, 90%)" />
          <div className={styles.life}>
            <Skeleton height={36} width={200} />
            <Skeleton height={36} width={200} />
          </div>
        </div>

        <Skeleton className={skeletonStyles.map} height="100%" />

        <div className={styles.columns}>
          <Panel title={t("TRAJECTORY")} className={styles.aside}>
            <Skeleton shape="text" lines={6} />
          </Panel>
          <div className={styles.sections}>
            {Array.from({ length: 3 }, (_, index) => (
              <Panel key={index}>
                <Skeleton shape="text" lines={4} height={18} />
              </Panel>
            ))}
          </div>
        </div>
      </Loading>
    </main>
  );
}
