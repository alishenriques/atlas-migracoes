import { Panel, ReliabilityTag } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatFuzzyDate } from "@/lib/dates";
import { formatSourceDate, groupFindings, isDateProperty, summariesOf } from "@/lib/research";
import type { Finding, FuzzyDate, Place, Research } from "@/lib/schemas";
import { placeName } from "@/lib/trajectory";

import { styles } from "./styles/index.styles";

export type ResearchResultsProps = { research: Research };

// Message keys for the API's enum values.
const STATUS = { ok: "OK", no_match: "NO_MATCH", error: "ERROR" } as const;
const BASIS = { birth_year: "BIRTH_YEAR", name: "NAME" } as const;
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
  const { artist, match, findings, sources } = research;
  const groups = groupFindings(findings);
  const summaries = summariesOf(findings);
  // With no match, an error on Wikidata means the search never ran, not that nobody matched.
  const searchFailed = sources.some(({ source, status }) => source === "wikidata" && status === "error");

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

      <div className={styles.main}>
        {match ? (
          <Panel title={t("MATCH")}>
            <p className={styles.matchTitle}>{match.label}</p>
            {match.description && <p className={styles.text}>{match.description}</p>}
            <p className={styles.note}>{t(`BASIS.${BASIS[match.basis]}`)}</p>
            <a href={match.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {t("SOURCE_LINK")}: Wikidata {match.id}
            </a>
          </Panel>
        ) : (
          <Panel title={t("MATCH")}>
            <p className={styles.text}>{t(searchFailed ? "SOURCE_ERROR" : "NO_MATCH")}</p>
          </Panel>
        )}

        {summaries.map((summary) => (
          <Panel key={summary.sourceUrl} title={t("SUMMARY")}>
            <p className={styles.text}>{summary.value}</p>
            <FindingMeta finding={summary} />
          </Panel>
        ))}

        {match && (
          <Panel title={t("FINDINGS")}>
            {groups.length === 0 ? (
              <p className={styles.text}>{t("NO_FINDINGS")}</p>
            ) : (
              <div className={styles.groups}>
                {groups.map(({ property, findings: items }) => (
                  <section key={property} className={styles.group} aria-label={t(`PROPERTY.${PROPERTY[property]}`)}>
                    <h3 className={styles.groupTitle}>{t(`PROPERTY.${PROPERTY[property]}`)}</h3>
                    <ul className={styles.findings}>
                      {items.map((finding, index) => (
                        <li key={`${finding.value}-${index}`} className={styles.finding}>
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
          </div>
        </Panel>
      </aside>
    </div>
  );
}

/** Reliability, references and the link to the page the finding was read from. */
function FindingMeta({ finding }: { finding: Finding }) {
  const t = useTranslations("RESEARCH");
  return (
    <span className={styles.findingMeta}>
      <ReliabilityTag level={finding.reliability} label={t(`RELIABILITY.${RELIABILITY[finding.reliability]}`)} />
      {finding.source === "wikidata" && <span>{t("REFERENCES", { count: finding.references })}</span>}
      <a href={finding.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
        {finding.sourceTitle}
      </a>
    </span>
  );
}
