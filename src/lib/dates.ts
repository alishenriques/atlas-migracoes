import type { FuzzyDate } from "./schemas";

/**
 * Renders a collection date no more exactly than the source gives it:
 * "12 de mar. de 1949", "mar. de 1949", "1949", "c. 1949", "1940–1945", or
 * `unknownLabel` ("s.d.") when there is no year.
 */
export function formatFuzzyDate(date: FuzzyDate, locale: string, unknownLabel: string): string {
  if (date.year === null) return unknownLabel;

  switch (date.precision) {
    case "day":
    case "month": {
      if (!date.iso) return String(date.year);
      const [year, month, day] = date.iso.split("-").map(Number);
      const options: Intl.DateTimeFormatOptions =
        date.precision === "day"
          ? { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }
          : { month: "short", year: "numeric", timeZone: "UTC" };
      return new Intl.DateTimeFormat(locale, options).format(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
    }
    case "circa":
      return `c. ${date.year}`;
    case "range":
      return date.endYear !== null && date.endYear !== date.year ? `${date.year}–${date.endYear}` : String(date.year);
    case "year":
      return String(date.year);
    case "unknown":
      return unknownLabel;
  }
}

/** "1889–1957", with the unknown label for a missing end; null when both are unknown. */
export function lifeSpan(birth: FuzzyDate, death: FuzzyDate, locale: string, unknownLabel: string): string | null {
  if (birth.year === null && death.year === null) return null;
  return `${formatFuzzyDate(birth, locale, unknownLabel)}–${formatFuzzyDate(death, locale, unknownLabel)}`;
}
