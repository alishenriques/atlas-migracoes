import { Panel, Skeleton } from "@alishenriques/atlas-design-system";

import { Loading } from "@/shared/components/Loading";

import { styles } from "../ResearchResults/styles/index.styles";

/**
 * The findings on an artist while they load, in the columns of ResearchResults: the collection's
 * record, the reading, the findings and, beside them, the period, the sources and the method.
 */
export function ResearchResultsSkeleton() {
  return (
    <Loading className={styles.columns}>
      <Panel className={styles.collection}>
        <Skeleton shape="text" lines={4} />
      </Panel>

      <div className={styles.main}>
        <div className={styles.reading}>
          <Panel>
            <Skeleton height={28} width="60%" />
            <Skeleton shape="text" lines={3} />
          </Panel>
          <Panel>
            <Skeleton shape="text" lines={6} />
          </Panel>
        </div>
        <Panel className={styles.findingsPanel}>
          <Skeleton shape="text" lines={8} height={18} />
        </Panel>
      </div>

      <div className={styles.aside}>
        <Skeleton height={220} />
        <Panel>
          <Skeleton shape="text" lines={3} />
        </Panel>
      </div>
    </Loading>
  );
}
