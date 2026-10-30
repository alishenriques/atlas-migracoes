/**
 * Builds the historical facts of the Camada Histórica: for each year, the best
 * known events in Europe and in Brazil from Wikidata, each told by the opening
 * of its Wikipedia article (Portuguese, and English when there is one).
 *
 *   yarn build:historical-facts [--from 1910] [--to 1989]
 *
 * Needs network access to query.wikidata.org and *.wikipedia.org. The review
 * list, scripts/historical-facts-review.json, leaves events out (`exclude`) or
 * adds them (`include`) by Wikidata id. The output is
 * public/historical/facts.json. See src/lib/historicalFactsBuild.ts.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";

import { historicalFactsFileSchema, type FactText, type HistoricalFact } from "../src/lib/historicalFacts.ts";
import {
  candidatesFrom,
  itemsQuery,
  reviewSchema,
  selectCandidates,
  summaryUrl,
  textFromSummary,
  toFact,
  yearQuery,
  type Candidate,
} from "../src/lib/historicalFactsBuild.ts";

const ROOT = join(import.meta.dirname, "..");
const OUT_FILE = join(ROOT, "public", "historical", "facts.json");
const REVIEW_FILE = join(ROOT, "scripts", "historical-facts-review.json");
// Wikimedia asks every client to name itself and give a contact.
const HEADERS = { "User-Agent": "AtlasMigracoesLesteSul/0.1 (https://github.com/alishenriques/atlas-migracoes)" };
const PAUSE_MS = 1500;

const { values } = parseArgs({ options: { from: { type: "string", default: "1910" }, to: { type: "string", default: "1989" } } });
const [from, to] = [Number(values.from), Number(values.to)];

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/** GETs JSON, waiting and trying again on 429 and 5xx (the query service throttles). */
async function getJson(url: string, tries = 4): Promise<unknown> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { ...HEADERS, Accept: "application/json" } });
    if (response.ok) return response.json();
    if (response.status === 404) return null;
    if (attempt >= tries || (response.status !== 429 && response.status < 500)) throw new Error(`${url}: HTTP ${response.status}`);
    await sleep(PAUSE_MS * 2 ** attempt);
  }
}

const sparql = (query: string) => getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`);

async function text(edition: "pt" | "en", title: string | null): Promise<FactText | null> {
  if (!title) return null;
  const summary = await getJson(summaryUrl(edition, title));
  return summary === null ? null : textFromSummary(summary);
}

const review = reviewSchema.parse(JSON.parse(await readFile(REVIEW_FILE, "utf8")));

const candidates: Candidate[] = [];
for (let year = from; year <= to; year++) {
  const found = candidatesFrom(await sparql(yearQuery(year)));
  console.log(`${year}: ${found.length} candidatos`);
  candidates.push(...found);
  await sleep(PAUSE_MS);
}
if (review.include.length > 0) candidates.push(...candidatesFrom(await sparql(itemsQuery(review.include))));

const selected = selectCandidates(candidates, review);
const facts: HistoricalFact[] = [];
for (const candidate of selected) {
  const fact = toFact(candidate, await text("pt", candidate.ptTitle), await text("en", candidate.enTitle));
  if (fact) facts.push(fact);
  else console.warn(`sem texto em português: ${candidate.id} (${candidate.ptTitle})`);
  await sleep(200);
}

const file = historicalFactsFileSchema.parse({ meta: { generatedAt: new Date().toISOString(), fromYear: from, toYear: to }, facts });
await mkdir(dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(file, null, 2)}\n`);
console.log(`\n${facts.length} fatos gravados em ${OUT_FILE}`);
