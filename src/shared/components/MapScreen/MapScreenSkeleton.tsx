import { Panel, Skeleton } from "@alishenriques/atlas-design-system";

import { Loading } from "../Loading";
import { MapScreen } from "./MapScreen";
import { skeletonStyles as styles } from "./styles/index.styles";

export type MapScreenSkeletonProps = {
  /** Draws the bar along the bottom of the map, as the screens that have one (Explorar's counters). */
  footer?: boolean;
};

/** A map screen while its data loads: the same floating blocks over the map, in skeleton. */
export function MapScreenSkeleton({ footer = false }: MapScreenSkeletonProps) {
  return (
    <Loading className={styles.root}>
      <MapScreen
        map={<Skeleton height="100%" className={styles.map} />}
        intro={
          <Panel>
            <div className={styles.intro}>
              <Skeleton shape="text" width="40%" />
              <Skeleton height={32} width="85%" />
              <Skeleton shape="text" lines={3} />
            </div>
          </Panel>
        }
        footer={
          footer && (
            <Panel>
              <div className={styles.stats}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} height={44} />
                ))}
              </div>
            </Panel>
          )
        }
      >
        <div className={styles.controls}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} height={52} />
          ))}
          <Skeleton shape="text" lines={4} />
        </div>
      </MapScreen>
    </Loading>
  );
}
