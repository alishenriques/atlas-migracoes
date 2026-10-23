import { MapScreenSkeleton } from "@/shared/components/MapScreen";

import { styles } from "./styles/index.styles";

/** Explorar while the map and the counters load. */
export function HomeSkeleton() {
  return (
    <main className={styles.page}>
      <MapScreenSkeleton footer />
    </main>
  );
}
