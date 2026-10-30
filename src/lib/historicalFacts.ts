import { z } from "zod";

import type { FuzzyDate } from "./schemas";

/**
 * Historical facts for the Camada Histórica: events of the period picked from
 * Wikidata by `scripts/build-historical-facts.mts`, each told by the opening of
 * its Wikipedia article and linked to it. The selection is the platform's, not
 * a researcher's, so the screen labels them inferred.
 */

export const HISTORICAL_FACTS_URL = "/historical/facts.json";

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** A Wikidata date as precise as Wikidata gives it (day, month or year). */
export const factDateSchema = z.object({
  iso: isoDay,
  precision: z.enum(["day", "month", "year"]),
});

const factTextSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  url: z.url().startsWith("https://"),
});

export const historicalFactSchema = z.object({
  /** The Wikidata item, e.g. "Q361". */
  id: z.string().regex(/^Q\d+$/),
  start: factDateSchema,
  end: factDateSchema.nullable(),
  /** Wikipedia editions with an article on the event; orders the facts of a year. */
  weight: z.number().int().nonnegative(),
  pt: factTextSchema,
  en: factTextSchema.nullable(),
});

export const historicalFactsFileSchema = z.object({
  meta: z.object({
    generatedAt: z.string(),
    fromYear: z.number().int(),
    toYear: z.number().int(),
  }),
  facts: z.array(historicalFactSchema),
});

export type FactDate = z.infer<typeof factDateSchema>;
export type HistoricalFact = z.infer<typeof historicalFactSchema>;
export type HistoricalFactsFile = z.infer<typeof historicalFactsFileSchema>;
export type FactText = z.infer<typeof factTextSchema>;

const yearOf = (date: FactDate) => Number(date.iso.slice(0, 4));

/** Most facts listed for a year, and most of the longer events still under way. */
export const FACTS_PER_YEAR = 6;
export const ONGOING_PER_YEAR = 3;

const byWeight = (a: HistoricalFact, b: HistoricalFact) => b.weight - a.weight || a.start.iso.localeCompare(b.start.iso);

/**
 * The facts of a year: what began or happened in it (in date order, the most
 * known first when there are too many), and the events that began in an
 * earlier year and were still going on (a war, an occupation).
 */
export function factsOfYear(facts: HistoricalFact[], year: number): { inYear: HistoricalFact[]; ongoing: HistoricalFact[] } {
  const inYear = facts
    .filter((fact) => yearOf(fact.start) === year)
    .sort(byWeight)
    .slice(0, FACTS_PER_YEAR)
    .sort((a, b) => a.start.iso.localeCompare(b.start.iso));
  const ongoing = facts
    .filter((fact) => fact.end !== null && yearOf(fact.start) < year && yearOf(fact.end) >= year)
    .sort(byWeight)
    .slice(0, ONGOING_PER_YEAR);
  return { inYear, ongoing };
}

/** The fact's text in the app's language, Portuguese when there is no English article. */
export const factText = (fact: HistoricalFact, locale: string): FactText => (locale === "en" && fact.en) || fact.pt;

/** A fact date in the shape `formatFuzzyDate` reads. */
export const asFuzzyDate = (date: FactDate): FuzzyDate => ({
  raw: null,
  year: yearOf(date),
  endYear: null,
  iso: date.iso,
  precision: date.precision,
});

/** "1939–1945" for an event that spans years, the single year otherwise. */
export function factSpan(fact: HistoricalFact): string {
  const start = yearOf(fact.start);
  const end = fact.end ? yearOf(fact.end) : start;
  return end === start ? String(start) : `${start}–${end}`;
}
