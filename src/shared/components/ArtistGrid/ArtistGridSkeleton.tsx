import { Skeleton } from "@alishenriques/atlas-design-system";

import { Loading } from "@/shared/components/Loading";

import { skeletonStyles, styles } from "./styles/index.styles";

/** The search box and the artists' cards while they load, in the grid they will land in. */
export function ArtistGridSkeleton() {
  return (
    <Loading className={skeletonStyles.list}>
      <Skeleton height={60} className={skeletonStyles.search} />
      <span className={styles.grid}>
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} className={skeletonStyles.card}>
            <span className={skeletonStyles.cardText}>
              <Skeleton height={22} width="70%" />
              <Skeleton shape="text" width="50%" />
            </span>
            <Skeleton shape="circle" width={52} />
          </span>
        ))}
      </span>
    </Loading>
  );
}
