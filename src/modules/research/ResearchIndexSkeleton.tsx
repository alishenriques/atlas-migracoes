import { ArtistGridSkeleton } from "@/shared/components/ArtistGrid";

import { ResearchHeader } from "./components/ResearchHeader";
import { styles } from "./styles/index.styles";

/** IA Relacional while the artists load: the presentation already, and the cards in skeleton. */
export function ResearchIndexSkeleton() {
  return (
    <main className={styles.page}>
      <ResearchHeader />
      <ArtistGridSkeleton />
    </main>
  );
}
