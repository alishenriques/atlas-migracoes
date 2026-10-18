import { formatFuzzyDate } from "@/lib/dates";
import type { FuzzyDate, Place } from "@/lib/schemas";
import { placeName } from "@/lib/trajectory";

/** "Vilna (Vilnius, Lituânia), 1889": place and date as the source gives them; null when both are unknown. */
export function lifeEvent(place: Place | null, date: FuzzyDate, locale: string, unknownLabel: string): string | null {
  if (!place && date.year === null) return null;
  const when = formatFuzzyDate(date, locale, unknownLabel);
  return place ? `${placeName(place)}, ${when}` : when;
}

/** "1889–1957", with the unknown label for a missing end; null when both are unknown. */
export function lifeSpan(birth: FuzzyDate, death: FuzzyDate, locale: string, unknownLabel: string): string | null {
  if (birth.year === null && death.year === null) return null;
  return `${formatFuzzyDate(birth, locale, unknownLabel)}–${formatFuzzyDate(death, locale, unknownLabel)}`;
}
