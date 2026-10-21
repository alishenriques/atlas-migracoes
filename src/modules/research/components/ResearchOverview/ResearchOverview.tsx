import { Panel } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { formatFuzzyDate } from "@/lib/dates";
import type { Research, ResearchCandidate } from "@/lib/schemas";

import { styles } from "./styles/index.styles";

export type ResearchOverviewProps = { research: Research };

// Message keys for the API's enum values.
const REASON = {
  birth_year_differs: "BIRTH_YEAR_DIFFERS",
  no_birth_year: "NO_BIRTH_YEAR",
  ambiguous: "AMBIGUOUS",
  shorter_name: "SHORTER_NAME",
  name_differs: "NAME_DIFFERS",
} as const;
const PLATFORM = { wikidata: "Wikidata", wikipedia: "Wikipedia" } as const;

/**
 * Where the research looked, when, and what came of it: what was found and who
 * wrote the summary, or why nothing was linked, with the people Wikidata
 * returned as leads for a researcher to check.
 */
export function ResearchOverview({ research }: ResearchOverviewProps) {
  const t = useTranslations("RESEARCH.OVERVIEW");
  const tResearch = useTranslations("RESEARCH");
  const locale = useLocale();
  const { artist, searchedNames, match, candidates, sources, summary } = research;
  const list = (items: string[]) => new Intl.ListFormat(locale, { type: "conjunction" }).format(items);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(
    new Date(research.retrievedAt),
  );
  const platforms = list(sources.map(({ source }) => PLATFORM[source]));
  const pending = !match && sources.some(({ source, status }) => source === "wikidata" && status === "error");
  const names = list(searchedNames.map((name) => `“${name}”`));

  return (
    <Panel title={t("TITLE")}>
      <div className={styles.body}>
        {match ? (
          <>
            <p className={styles.text}>{t("FOUND", { date, platforms })}</p>
            {summary.status === "ok" && summary.model && <p className={styles.text}>{t("FOUND_AI", { model: summary.model })}</p>}
          </>
        ) : pending ? (
          <p className={styles.text}>{t("PENDING", { date })}</p>
        ) : (
          <>
            <p className={styles.text}>{t("NOT_FOUND", { date, platforms })}</p>
            {searchedNames.length > 0 && <p className={styles.note}>{t("SEARCHED", { names })}</p>}
            {candidates.length === 0 ? (
              <p className={styles.text}>{t("NONE_FOUND")}</p>
            ) : (
              <section aria-label={t("CANDIDATES")} className={styles.body}>
                <h3 className={styles.heading}>{t("CANDIDATES")}</h3>
                <ul className={styles.candidates}>
                  {candidates.map((candidate) => (
                    <li key={candidate.id} className={styles.candidate}>
                      <span className={styles.candidateName}>{candidate.label}</span>
                      {candidate.description && <span className={styles.note}>{candidate.description}</span>}
                      <span className={styles.reason}>
                        {reasonText(candidate, (key, values) => t(key, values), formatFuzzyDate(artist.birthDate, locale, tResearch("UNKNOWN_DATE")))}
                      </span>
                      <a href={candidate.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Wikidata {candidate.id}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className={styles.note}>{t("CANDIDATES_NOTE")}</p>
              </section>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

type Translate = (key: string, values: Record<string, string>) => string;

/** Why this person was not linked, in the researcher's terms. */
function reasonText(candidate: ResearchCandidate, t: Translate, collectionBirth: string): string {
  return t(`REASON.${REASON[candidate.reason]}`, {
    wikidata: candidate.birthYear === null ? "" : String(candidate.birthYear),
    collection: collectionBirth,
    foundBy: candidate.foundBy,
  });
}
