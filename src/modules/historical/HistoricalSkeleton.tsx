import { MapScreenSkeleton } from "@/shared/components/MapScreen";

import { styles } from "./styles/index.styles";

/** Camada Histórica while the artists load. */
export function HistoricalSkeleton() {
  return (
    <main className={styles.page}>
      <MapScreenSkeleton />
    </main>
  );
}
