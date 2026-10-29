import { Panel, ReliabilityTag } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatFuzzyDate } from "@/lib/dates";
import { findingAnchor, formatSourceDate, groupFindings, isDateProperty, summariesOf, type NumberedFinding } from "@/lib/research";
import type { FuzzyDate, Place, Research } from "@/lib/schemas";
import { placeName } from "@/lib/trajectory";

import { AiSummary } from "../AiSummary";
import { PeriodMap } from "../PeriodMap";
import { ResearchOverview } from "../ResearchOverview";
import { styles } from "./styles/index.styles";

export type ResearchResultsProps = { research: Research };

// Message keys for the API's enum values.
const STATUS = { ok: "OK", no_match: "NO_MATCH", error: "ERROR" } as const;
const BASIS = { birth_year: "BIRTH_YEAR", name: "NAME", reviewed: "REVIEWED" } as const;
const RELIABILITY = { documented: "DOCUMENTED", undetermined: "UNDETERMINED" } as const;
const REVIEW = { present_day_name: "PRESENT_DAY_NAME", conflicts_with_collection: "CONFLICTS_WITH_COLLECTION" } as const;
const PROPERTY = {
  birthDate: "BIRTH_DATE",
  birthPlace: "BIRTH_PLACE",
  deathDate: "DEATH_DATE",
  deathPlace: "DEATH_PLACE",
  citizenship: "CITIZENSHIP",
  occupation: "OCCUPATION",
  movement: "MOVEMENT",
  educatedAt: "EDUCATED_AT",
  memberOf: "MEMBER_OF",
  notableWork: "NOTABLE_WORK",
} as const;

/** What the open sources say about one artist, beside what the collection records, each finding with its source. */
export function ResearchResults({ research }: ResearchResultsProps) {
  const t = useTranslations("RESEARCH");
  const locale = useLocale();
  const { artist, match, findings, sources, period, summary } = research;
  const groups = groupFindings(findings);
  const summaries = summariesOf(findings);

  const life = (date: FuzzyDate, place: Place | null) =>
    `${formatFuzzyDate(date, locale, t("UNKNOWN_DATE"))}, ${place ? placeName(place) : t("UNKNOWN_PLACE")}`;
  const retrieved = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(research.retrievedAt));

  return (
    <div className={styles.columns}>
      <Panel title={t("COLLECTION")} className={styles.collection}>
        <dl className={styles.facts}>
          <div>
            <dt className={styles.factLabel}>{t("BORN")}</dt>
            <dd>{life(artist.birthDate, artist.birthPlace)}</dd>
          </div>
          <div>
            <dt className={styles.factLabel}>{t("DIED")}</dt>
            <dd>{life(artist.deathDate, artist.deathPlace)}</dd>
          </div>
        </dl>
        <Link href={{ pathname: "/trajetorias/[slug]", params: { slug: artist.slug } }} className={styles.link}>
          {t("OPEN_RECORD")}
        </Link>
      </Panel>

      {/* The reading column; from xl up the findings leave it for a column of their own,
          beside the summaries that cite them. */}
      <div className={styles.main}>
        <div className={match ? styles.reading : styles.readingWide}>
          <ResearchOverview research={research} />

          {match && (
            <Panel title={t("MATCH")}>
              <p className={styles.matchTitle}>{match.label}</p>
              {match.description && <p className={styles.text}>{match.description}</p>}
              <p className={styles.note}>{t(`BASIS.${BASIS[match.basis]}`)}</p>
              {match.note && <p className={styles.note}>{t("REVIEW_NOTE", { note: match.note })}</p>}
              <a href={match.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {t("SOURCE_LINK")}: Wikidata {match.id}
              </a>
            </Panel>
          )}

          <AiSummary summary={summary} findingCount={findings.length} />

          {summaries.map((item) => (
            <Panel key={item.sourceUrl} title={t("SUMMARY")}>
              <div id={findingAnchor(item.n)} className={styles.anchored}>
                <p className={styles.text}>{item.value}</p>
                <FindingMeta finding={item} />
              </div>
            </Panel>
          ))}
        </div>

        {match && (
          <Panel title={t("FINDINGS")} className={styles.findingsPanel}>
            {groups.length === 0 ? (
              <p className={styles.text}>{t("NO_FINDINGS")}</p>
            ) : (
              <div className={styles.groups}>
                {groups.map(({ property, findings: items }) => (
                  <section key={property} className={styles.group} aria-label={t(`PROPERTY.${PROPERTY[property]}`)}>
                    <h3 className={styles.groupTitle}>{t(`PROPERTY.${PROPERTY[property]}`)}</h3>
                    <ul className={styles.findings}>
                      {items.map((finding) => (
                        <li key={finding.n} id={findingAnchor(finding.n)} className={styles.finding}>
                          <span className={styles.findingValue}>
                            {isDateProperty(finding.property) ? formatSourceDate(finding.value, locale) : finding.value}
                          </span>
                          <FindingMeta finding={finding} />
                          {finding.reviews.map((review) => (
                            <span key={review} className={styles.review}>
                              {t(`REVIEW.${REVIEW[review]}`)}
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>

      <aside className={styles.aside}>
        <PeriodMap period={period} />

        <Panel title={t("SOURCES")}>
          <ul className={styles.sources}>
            {sources.map(({ source, status }) => (
              <li key={source}>
                {source === "wikidata" ? "Wikidata" : "Wikipedia"}: {t(`STATUS.${STATUS[status]}`)}
              </li>
            ))}
          </ul>
          <p className={styles.note}>{t("RETRIEVED", { date: retrieved })}</p>
        </Panel>

        <Panel title={t("METHOD")}>
          <div className={styles.method}>
            <p>
              <strong className={styles.factLabel}>{t("QUERY")}</strong>
              <br />
              {t("QUERY_TEXT", { name: artist.name })}
            </p>
            <p>{t("METHOD_RELIABILITY")}</p>
            <p>{t("METHOD_PERIOD")}</p>
            <p>{t("METHOD_AI")}</p>
            {summary.prompt && (
              <details>
                <summary className={styles.promptToggle}>{t("PROMPT")}</summary>
                <pre className={styles.prompt}>{summary.prompt}</pre>
              </details>
            )}
          </div>
        </Panel>
      </aside>
    </div>
  );
}

/** Number, reliability, references and the link to the page the finding was read from. */
function FindingMeta({ finding }: { finding: NumberedFinding }) {
  const t = useTranslations("RESEARCH");
  return (
    <span className={styles.findingMeta}>
      <span className={styles.findingNumber} aria-label={t("FINDING_NUMBER", { n: finding.n })}>
        [{finding.n}]
      </span>
      <ReliabilityTag level={finding.reliability} label={t(`RELIABILITY.${RELIABILITY[finding.reliability]}`)} />
      {finding.source === "wikidata" && <span>{t("REFERENCES", { count: finding.references })}</span>}
      <a href={finding.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
        {finding.sourceTitle}
      </a>
    </span>
  );
}
