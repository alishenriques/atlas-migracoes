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

export type FindingGroup = { property: Exclude<FindingProperty, "summary">; findings: Finding[] };

/** The statements grouped by property, in `PROPERTY_ORDER`, leaving out properties with nothing found and the summaries. */
export function groupFindings(findings: Finding[]): FindingGroup[] {
  return PROPERTY_ORDER.map((property) => ({
    property,
    findings: findings.filter((finding) => finding.property === property),
  })).filter((group) => group.findings.length > 0);
}

/** The encyclopedia summaries, shown apart from the statements. */
export const summariesOf = (findings: Finding[]) => findings.filter((finding) => finding.property === "summary");

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
