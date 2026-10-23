import { Eyebrow } from "@alishenriques/atlas-design-system";
import { getTranslations } from "next-intl/server";

import type { ArtistList, Research as ResearchData } from "@/lib/schemas";
import { DemoNotice } from "@/shared/components/DemoNotice";

import { ArtistPicker } from "./components/ArtistPicker";
import { ResearchResults } from "./components/ResearchResults";
import { styles } from "./styles/index.styles";

/** Where the search stands: nothing asked yet, an unknown artist, the sources unreachable, or the findings. */
export type ResearchState =
  | { status: "idle" }
  | { status: "not_found" }
  | { status: "unavailable" }
  | { status: "found"; research: ResearchData };

export type ResearchProps = {
  /** The artists to choose from; null when the list could not be loaded. */
  list: ArtistList | null;
  /** The artist asked for in `?artista=`, if any. */
  slug: string | null;
  state: ResearchState;
};

/** The IA Relacional screen: an artist of the collection beside what open sources say about them. */
export async function Research({ list, slug, state }: ResearchProps) {
  const t = await getTranslations("RESEARCH");

  return (
    <main className={styles.page}>
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

      {state.status === "idle" && list && <p className={styles.muted}>{t("PICK_HINT")}</p>}
      {state.status === "not_found" && <p className={styles.muted}>{t("NOT_FOUND")}</p>}
      {state.status === "unavailable" && <p className={styles.muted}>{t("UNAVAILABLE")}</p>}
      {state.status === "found" && <ResearchResults research={state.research} />}
    </main>
  );
}
