import { z } from "zod";

import type { FactDate, FactText, HistoricalFact } from "./historicalFacts";

/**
 * The pure steps of `scripts/build-historical-facts.mts`, kept here so they are
 * tested: the Wikidata query for a year's events, reading its answer, picking
 * the facts and cutting the opening of a Wikipedia article down to a short text.
 * Nothing here is written by hand or by a model: dates come from Wikidata and
 * texts from Wikipedia, each with its link.
 */

export const WIKIDATA_ENTITY = "http://www.wikidata.org/entity/";

/** Least Wikipedia editions an event needs to be a candidate: keeps out minor local events. */
export const MIN_SITELINKS = 15;
/** Facts kept per year in the file (the screen shows fewer; the rest give the review room). */
export const STORED_PER_YEAR = 8;

// Wikidata time precision: 9 year, 10 month, 11 day. Anything vaguer is left out.
const PRECISION: Record<number, FactDate["precision"]> = { 9: "year", 10: "month", 11: "day" };

/**
 * The fields every candidate query selects. Events are items with a point in
 * time (P585) or a start time (P580); people (Q5) and sports events (P641) are
 * left out, and a Portuguese Wikipedia article is required, since its opening is
 * the fact's text.
 *
 * Things that also carry a start date but are not events are left out by
 * their class (P31, or any subclass of it, P279): currencies (Q8142),
 * newspapers (Q11032), magazines (Q41298), awards (Q618779), organizations
 * (Q43229), administrative areas (Q56061), structures (Q811979), squares
 * (Q174782), airports (Q1248784), art movements (Q968159) and sporting events
 * (Q16510064). The first run of the script listed them
 * among the best known "events" of their years.
 */
export const NOT_EVENTS = ["Q8142", "Q11032", "Q41298", "Q618779", "Q43229", "Q56061", "Q811979", "Q174782", "Q1248784", "Q968159", "Q16510064"]
  .map((id) => `wd:${id}`)
  .join(" ");
/** Articles that are lists of results, not events ("Quadro de medalhas dos Jogos Olímpicos…"). */
const NOT_EVENT_TITLE = /^Quadro de medalhas/;

const SELECT = `SELECT ?item ?sitelinks ?start ?startPrecision ?end ?endPrecision ?ptTitle ?enTitle WHERE {`;
const DATES_AND_ARTICLES = `
  { ?item p:P585/psv:P585 ?time . } UNION { ?item p:P580/psv:P580 ?time . }
  ?time wikibase:timeValue ?start ; wikibase:timePrecision ?startPrecision .
  FILTER(?startPrecision >= 9)
  ?item wikibase:sitelinks ?sitelinks .
  FILTER NOT EXISTS { ?item wdt:P31 wd:Q5 . }
  FILTER NOT EXISTS { ?item wdt:P641 ?sport . }
  FILTER NOT EXISTS { ?item wdt:P31/wdt:P279* ?notEvent . VALUES ?notEvent { ${NOT_EVENTS} } }
  ?ptArticle schema:about ?item ; schema:isPartOf <https://pt.wikipedia.org/> ; schema:name ?ptTitle .
  OPTIONAL { ?enArticle schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?enTitle . }
  OPTIONAL { ?item p:P582/psv:P582 ?endTime . ?endTime wikibase:timeValue ?end ; wikibase:timePrecision ?endPrecision . }`;

/**
 * The query for the events of one year in Europe or in Brazil (where the
 * artists came to): held in a European country (P17 whose continent, P30, is
 * Europe, Q46), at a place in one, on the continent itself, or in Brazil (Q155).
 */
export function yearQuery(year: number, minSitelinks = MIN_SITELINKS): string {
  return `${SELECT}
  { ?item wdt:P17 ?country . ?country wdt:P30 wd:Q46 . }
  UNION { ?item wdt:P17 wd:Q155 . }
  UNION { ?item wdt:P276 ?place . ?place wdt:P17 ?placeCountry . ?placeCountry wdt:P30 wd:Q46 . }
  UNION { ?item wdt:P30 wd:Q46 . }
  UNION { ?item wdt:P276 wd:Q46 . }
  ${DATES_AND_ARTICLES}
  FILTER(?sitelinks >= ${minSitelinks})
  FILTER(?start >= "${year}-01-01T00:00:00Z"^^xsd:dateTime && ?start < "${year + 1}-01-01T00:00:00Z"^^xsd:dateTime)
}`;
}

/** The query for events a reviewer asked for by id, whatever their place or fame. */
export function itemsQuery(ids: string[]): string {
  return `${SELECT}
  VALUES ?item { ${ids.map((id) => `wd:${id}`).join(" ")} }
  ${DATES_AND_ARTICLES}
}`;
}

const value = z.object({ value: z.string() });
export const sparqlAnswerSchema = z.object({
  results: z.object({
    bindings: z.array(
      z.object({
        item: value,
        sitelinks: value,
        start: value,
        startPrecision: value,
        end: value.optional(),
        endPrecision: value.optional(),
        ptTitle: value,
        enTitle: value.optional(),
      }),
    ),
  }),
});

/** An event as Wikidata gives it, before its texts are read from Wikipedia. */
export type Candidate = {
  id: string;
  start: FactDate;
  end: FactDate | null;
  weight: number;
  ptTitle: string;
  enTitle: string | null;
};

function factDate(time: string | undefined, precision: string | undefined): FactDate | null {
  const kind = PRECISION[Number(precision)];
  const day = time?.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  if (!kind || !day) return null;
  const [, year, month, date] = day;
  // Below day precision Wikidata pads with 01 (or 00): keep only what is known.
  const iso = kind === "day" ? `${year}-${month}-${date}` : kind === "month" ? `${year}-${month}-01` : `${year}-01-01`;
  return { iso, precision: kind };
}

const later = (a: FactDate | null, b: FactDate | null) => (!a ? b : !b ? a : a.iso >= b.iso ? a : b);

const rank = (date: FactDate) => ["year", "month", "day"].indexOf(date.precision);

/**
 * One candidate per Wikidata item. An item answers once per matching place
 * and per date, in the query of every year it has a date in, so its earliest
 * start is kept (the most precise of equal ones) and its latest end.
 */
export function mergeCandidates(candidates: Candidate[]): Candidate[] {
  const byId = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const known = byId.get(candidate.id);
    if (!known) {
      byId.set(candidate.id, candidate);
      continue;
    }
    const earlier = candidate.start.iso < known.start.iso;
    const preciser = candidate.start.iso === known.start.iso && rank(candidate.start) > rank(known.start);
    byId.set(candidate.id, {
      ...known,
      start: earlier || preciser ? candidate.start : known.start,
      end: later(known.end, candidate.end),
      enTitle: known.enTitle ?? candidate.enTitle,
    });
  }
  return [...byId.values()];
}

/** The candidates in a query answer, merged per item. Dates vaguer than a year and list articles are dropped. */
export function candidatesFrom(answer: unknown): Candidate[] {
  const candidates: Candidate[] = [];
  for (const row of sparqlAnswerSchema.parse(answer).results.bindings) {
    const start = factDate(row.start.value, row.startPrecision.value);
    if (!start || !row.item.value.startsWith(WIKIDATA_ENTITY) || NOT_EVENT_TITLE.test(row.ptTitle.value)) continue;
    candidates.push({
      id: row.item.value.slice(WIKIDATA_ENTITY.length),
      start,
      end: factDate(row.end?.value, row.endPrecision?.value),
      weight: Number(row.sitelinks.value),
      ptTitle: row.ptTitle.value,
      enTitle: row.enTitle?.value ?? null,
    });
  }
  return mergeCandidates(candidates);
}

const yearOf = (date: FactDate) => Number(date.iso.slice(0, 4));

/**
 * The facts kept for the file: per start year, the best known (most Wikipedia
 * editions) up to `perYear`, without the ones a reviewer excluded; the ones a
 * reviewer included are always kept.
 */
export function selectCandidates(
  candidates: Candidate[],
  { exclude = [], include = [], perYear = STORED_PER_YEAR }: { exclude?: string[]; include?: string[]; perYear?: number } = {},
): Candidate[] {
  const kept: Candidate[] = [];
  const perStartYear = new Map<number, number>();
  // An event found in the query of each year it has a date in counts once, from its start.
  const ordered = mergeCandidates(candidates).sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
  for (const candidate of ordered) {
    if (exclude.includes(candidate.id)) continue;
    const year = yearOf(candidate.start);
    const count = perStartYear.get(year) ?? 0;
    if (count >= perYear && !include.includes(candidate.id)) continue;
    perStartYear.set(year, count + 1);
    kept.push(candidate);
  }
  return kept.sort((a, b) => a.start.iso.localeCompare(b.start.iso) || b.weight - a.weight);
}

/** Longest text kept from an article's opening. */
export const MAX_TEXT = 320;
/** An opening sentence shorter than this takes the next one along. */
const MIN_TEXT = 90;

/**
 * The first sentence of a Wikipedia article's opening (two when the first is
 * very short), without the language and pronunciation notes in parentheses,
 * and cut at a word when still too long.
 */
export function shortText(extract: string, max = MAX_TEXT): string {
  const clean = extract
    .replace(/\s*\([^()]*:[^()]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  // A sentence ends at a full stop after a word of three letters or more or a number, before a capital.
  const ends = [...clean.matchAll(/(?:\p{L}{3,}|\d)[.!?](?=\s+\p{Lu})/gu)].map((match) => match.index + match[0].length);
  let text = clean;
  const [first, second] = ends;
  if (first !== undefined) text = clean.slice(0, first < MIN_TEXT && second !== undefined ? second : first);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}

export const wikipediaSummarySchema = z.object({
  type: z.string(),
  title: z.string(),
  extract: z.string(),
  content_urls: z.object({ desktop: z.object({ page: z.url() }) }),
});

/** The fact's text from a Wikipedia summary; null for a disambiguation page or an empty opening. */
export function textFromSummary(summary: unknown): FactText | null {
  const parsed = wikipediaSummarySchema.parse(summary);
  if (parsed.type !== "standard" || !parsed.extract.trim()) return null;
  return { title: parsed.title, text: shortText(parsed.extract), url: parsed.content_urls.desktop.page };
}

/** The REST address of an article's summary on a Wikipedia edition ("pt" or "en"). */
export const summaryUrl = (edition: "pt" | "en", title: string) =>
  `https://${edition}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(" ", "_"))}`;

/** A candidate with its texts read; null when it has no usable Portuguese text. */
export function toFact(candidate: Candidate, pt: FactText | null, en: FactText | null): HistoricalFact | null {
  if (!pt) return null;
  return { id: candidate.id, start: candidate.start, end: candidate.end, weight: candidate.weight, pt, en };
}

export const reviewSchema = z.object({
  /** Wikidata ids left out of the file whatever their fame. */
  exclude: z.array(z.string().regex(/^Q\d+$/)).default([]),
  /** Wikidata ids always in the file, even outside Europe or below the fame threshold. */
  include: z.array(z.string().regex(/^Q\d+$/)).default([]),
});
export type Review = z.infer<typeof reviewSchema>;
