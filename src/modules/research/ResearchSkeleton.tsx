import { ResearchHeader } from "./components/ResearchHeader";
import { ResearchResultsSkeleton } from "./components/ResearchResultsSkeleton";
import { styles } from "./styles/index.styles";

/** An artist's page in IA Relacional while the research loads: the presentation already, and the findings in skeleton. */
export function ResearchSkeleton() {
  return (
    <main className={styles.artistPage}>
      <ResearchHeader />
      <ResearchResultsSkeleton />
    </main>
  );
}
