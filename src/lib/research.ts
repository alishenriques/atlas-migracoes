import type { Finding, FindingProperty } from "./schemas";

/** The properties in the order the screen lists them: life first, then career. */
export const PROPERTY_ORDER: Exclude<FindingProperty, "summary">[] = [
  "birthDate",
  "birthPlace",
  "deathDate",
  "deathPlace",
  "citizenship",
  "occupation",
  "movement",
  "educatedAt",
  "memberOf",
  "notableWork",
];

/** A finding with its number: its position in the research's findings, counting from 1, as the AI summary cites it. */
export type NumberedFinding = Finding & { n: number };

const numbered = (findings: Finding[]): NumberedFinding[] => findings.map((finding, index) => ({ ...finding, n: index + 1 }));

export type FindingGroup = { property: Exclude<FindingProperty, "summary">; findings: NumberedFinding[] };

/** The statements grouped by property, in `PROPERTY_ORDER`, leaving out properties with nothing found and the summaries. */
export function groupFindings(findings: Finding[]): FindingGroup[] {
  const all = numbered(findings);
  return PROPERTY_ORDER.map((property) => ({
    property,
    findings: all.filter((finding) => finding.property === property),
  })).filter((group) => group.findings.length > 0);
}

/** The encyclopedia summaries, shown apart from the statements. */
export const summariesOf = (findings: Finding[]) => numbered(findings).filter((finding) => finding.property === "summary");

/** The anchor of a finding on the page, so a citation can point to it. */
export const findingAnchor = (n: number) => `achado-${n}`;

export type SummaryPart = { text: string } | { cite: number };

/**
 * Splits the AI summary into text and citations. Only [n] that point to one of
 * the `count` findings become citations; anything else stays text.
 */
export function summaryParts(text: string, count: number): SummaryPart[] {
  return text.split(/(\[\d+\])/).flatMap((piece): SummaryPart[] => {
    const cite = /^\[(\d+)\]$/.exec(piece);
    const n = Number(cite?.[1]);
    if (cite && n >= 1 && n <= count) return [{ cite: n }];
    return piece ? [{ text: piece }] : [];
  });
}

export const isDateProperty = (property: FindingProperty) => property === "birthDate" || property === "deathDate";

/**
 * Renders a source date ("1891", "1891-07" or "1891-07-21") no more exactly
 * than the source gives it. Anything else is shown as the source wrote it.
 */
export function formatSourceDate(value: string, locale: string): string {
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  if (!month) return String(Number(year));
  const options: Intl.DateTimeFormatOptions = day
    ? { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }
    : { month: "short", year: "numeric", timeZone: "UTC" };
  return new Intl.DateTimeFormat(locale, options).format(Date.UTC(Number(year), Number(month) - 1, day ? Number(day) : 1));
}
