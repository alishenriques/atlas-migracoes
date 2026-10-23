import { Suspense } from "react";

import { Eyebrow } from "@alishenriques/atlas-design-system";
import { getTranslations } from "next-intl/server";

import type { ArtistList } from "@/lib/schemas";
import { DemoNotice } from "@/shared/components/DemoNotice";

import { ArtistPicker } from "./components/ArtistPicker";
import { ResearchLoader } from "./components/ResearchLoader";
import { ResearchResultsSkeleton } from "./components/ResearchResultsSkeleton";
import { PendingResults, ResearchTransition } from "./components/ResearchTransition";
import { styles } from "./styles/index.styles";

export type ResearchProps = {
  /** The artists to choose from; null when the list could not be loaded. */
  list: ArtistList | null;
  /** The artist asked for in `?artista=`, if any. */
  slug: string | null;
};

/** The IA Relacional screen: an artist of the collection beside what open sources say about them. */
export async function Research({ list, slug }: ResearchProps) {
  const t = await getTranslations("RESEARCH");

  return (
    <main className={styles.page}>
      <ResearchTransition>
        {list?.meta.source === "demo" && <DemoNotice />}

        <div className={styles.top}>
          <header className={styles.header}>
            <Eyebrow>{t("EYEBROW")}</Eyebrow>
            <h1 className={styles.title}>{t("TITLE")}</h1>
            <p className={styles.intro}>{t("INTRO")}</p>
          </header>

          {list ? (
            <div className={styles.picker}>
              <ArtistPicker artists={list.artists} selected={slug} />
            </div>
          ) : (
            <p className={styles.muted}>{t("LIST_UNAVAILABLE")}</p>
          )}
        </div>

        {/* Choosing another artist shows the skeleton at once (PendingResults), and it stays while
            the findings stream in their own boundary, keyed by the artist so it starts afresh. */}
        <PendingResults>
          {!slug && list && <p className={styles.muted}>{t("PICK_HINT")}</p>}
          {slug && (
            <Suspense key={slug} fallback={<ResearchResultsSkeleton />}>
              <ResearchLoader slug={slug} />
            </Suspense>
          )}
        </PendingResults>
      </ResearchTransition>
    </main>
  );
}
