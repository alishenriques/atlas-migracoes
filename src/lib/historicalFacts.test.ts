import { describe, expect, it } from "vitest";

import {
  asFuzzyDate,
  factSpan,
  factsOfYear,
  factText,
  historicalFactsFileSchema,
  type FactDate,
  type HistoricalFact,
} from "./historicalFacts";

const day = (iso: string): FactDate => ({ iso, precision: "day" });

const fact = (id: string, start: FactDate, weight: number, end: FactDate | null = null): HistoricalFact => ({
  id,
  start,
  end,
  weight,
  pt: { title: `Fato ${id}`, text: "Texto.", url: `https://pt.wikipedia.org/wiki/${id}` },
  en: null,
});

describe("factsOfYear", () => {
  it("lists what happened in the year in date order and what was still going on", () => {
    const facts = [
      fact("Q2", day("1939-09-01"), 200, day("1945-09-02")),
      fact("Q3", day("1939-03-15"), 50),
      fact("Q4", day("1938-03-12"), 80),
      fact("Q5", day("1914-07-28"), 300, day("1918-11-11")),
    ];
    expect(factsOfYear(facts, 1939).inYear.map((f) => f.id)).toEqual(["Q3", "Q2"]);
    expect(factsOfYear(facts, 1939).ongoing).toEqual([]);
    const in1942 = factsOfYear(facts, 1942);
    expect(in1942.inYear).toEqual([]);
    expect(in1942.ongoing.map((f) => f.id)).toEqual(["Q2"]);
    expect(factsOfYear(facts, 1945).ongoing.map((f) => f.id)).toEqual(["Q2"]);
    expect(factsOfYear(facts, 1946).ongoing).toEqual([]);
  });

  it("keeps the best known facts of a crowded year", () => {
    const facts = Array.from({ length: 9 }, (_, i) => fact(`Q${i + 1}`, day(`1920-0${i + 1}-01`), i));
    const { inYear } = factsOfYear(facts, 1920);
    expect(inYear.map((f) => f.id)).toEqual(["Q4", "Q5", "Q6", "Q7", "Q8", "Q9"]);
  });

  it("orders equally known facts by date", () => {
    const facts = [fact("Q1", day("1920-05-01"), 10), fact("Q2", day("1920-02-01"), 10)];
    expect(factsOfYear(facts, 1920).inYear.map((f) => f.id)).toEqual(["Q2", "Q1"]);
    const long = [fact("Q3", day("1915-05-01"), 10, day("1925-01-01")), fact("Q4", day("1912-02-01"), 10, day("1925-01-01"))];
    expect(factsOfYear(long, 1920).ongoing.map((f) => f.id)).toEqual(["Q4", "Q3"]);
  });
});

describe("factText", () => {
  it("speaks the app's language, Portuguese when there is no English article", () => {
    const english = { title: "Fact", text: "Text.", url: "https://en.wikipedia.org/wiki/Fact" };
    const withEnglish = { ...fact("Q1", day("1920-01-01"), 1), en: english };
    expect(factText(withEnglish, "en")).toBe(english);
    expect(factText(withEnglish, "pt").title).toBe("Fato Q1");
    expect(factText(fact("Q2", day("1920-01-01"), 1), "en").title).toBe("Fato Q2");
  });
});

describe("asFuzzyDate and factSpan", () => {
  it("keeps the date's precision", () => {
    expect(asFuzzyDate({ iso: "1918-11-01", precision: "month" })).toEqual({
      raw: null,
      year: 1918,
      endYear: null,
      iso: "1918-11-01",
      precision: "month",
    });
  });

  it("spans years only when the event does", () => {
    expect(factSpan(fact("Q1", day("1939-09-01"), 1, day("1945-09-02")))).toBe("1939–1945");
    expect(factSpan(fact("Q1", day("1939-09-01"), 1, day("1939-10-06")))).toBe("1939");
    expect(factSpan(fact("Q1", day("1939-09-01"), 1))).toBe("1939");
  });
});

describe("historicalFactsFileSchema", () => {
  const file = { meta: { generatedAt: "2026-10-30T00:00:00Z", fromYear: 1910, toYear: 1989 }, facts: [fact("Q1", day("1920-01-01"), 1)] };

  it("accepts a file the script writes", () => {
    expect(historicalFactsFileSchema.parse(file).facts).toHaveLength(1);
  });

  it("refuses links that are not https and ids that are not Wikidata's", () => {
    const http = { ...file, facts: [{ ...file.facts[0], pt: { ...file.facts[0]!.pt, url: "http://pt.wikipedia.org/wiki/X" } }] };
    expect(() => historicalFactsFileSchema.parse(http)).toThrow();
    expect(() => historicalFactsFileSchema.parse({ ...file, facts: [{ ...file.facts[0], id: "361" }] })).toThrow();
  });
});
