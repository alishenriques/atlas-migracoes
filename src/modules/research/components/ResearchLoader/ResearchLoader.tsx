import { getTranslations } from "next-intl/server";

import { getResearch } from "@/lib/atlas";

import { ResearchResults } from "../ResearchResults";
import { styles } from "./styles/index.styles";

export type ResearchLoaderProps = {
  /** The artist asked for in `?artista=`. */
  slug: string;
};

/**
 * Loads what the open sources say about one artist and shows it, or says why it can't: an unknown
 * artist or the sources unreachable. It streams in its own Suspense boundary (see Research), so the
 * screen and the picker show while it loads.
 */
export async function ResearchLoader({ slug }: ResearchLoaderProps) {
  const [t, research] = await Promise.all([
    getTranslations("RESEARCH"),
    getResearch(slug).catch((error: unknown) => {
      console.error("Failed to load the research:", error instanceof Error ? error.message : error);
      return "unavailable" as const;
    }),
  ]);
  if (research === "unavailable") return <p className={styles.muted}>{t("UNAVAILABLE")}</p>;
  return research ? <ResearchResults research={research} /> : <p className={styles.muted}>{t("NOT_FOUND")}</p>;
}
