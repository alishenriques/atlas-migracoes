import { describe, expect, it } from "vitest";

import {
  candidatesFrom,
  itemsQuery,
  MAX_TEXT,
  NOT_EVENT_TITLE,
  NOT_EVENTS,
  reviewSchema,
  selectCandidates,
  shortText,
  summaryUrl,
  textFromSummary,
  toFact,
  yearQuery,
  type Candidate,
} from "./historicalFactsBuild";

const row = (id: string, start: string, precision: number, extra: Record<string, string> = {}) => {
  const binding: Record<string, { value: string }> = {
    item: { value: `http://www.wikidata.org/entity/${id}` },
    sitelinks: { value: extra.sitelinks ?? "40" },
    start: { value: start },
    startPrecision: { value: String(precision) },
    ptTitle: { value: extra.ptTitle ?? `Título ${id}` },
  };
  if (extra.end) binding.end = { value: extra.end };
  if (extra.endPrecision) binding.endPrecision = { value: extra.endPrecision };
  if (extra.enTitle) binding.enTitle = { value: extra.enTitle };
  return binding;
};
const answer = (...bindings: ReturnType<typeof row>[]) => ({ results: { bindings } });

describe("yearQuery and itemsQuery", () => {
  it("asks for the year's events in Europe or in Brazil with a Portuguese article", () => {
    const query = yearQuery(1914);
    expect(query).toContain('"1914-01-01T00:00:00Z"^^xsd:dateTime');
    expect(query).toContain('"1915-01-01T00:00:00Z"^^xsd:dateTime');
    expect(query).toContain("wd:Q46");
    expect(query).toContain("wd:Q155");
    expect(query).toContain("<https://pt.wikipedia.org/>");
    expect(query).toContain("FILTER(?sitelinks >= 15)");
    expect(yearQuery(1914, 30)).toContain("FILTER(?sitelinks >= 30)");
  });

  it("leaves out things with a start date that are not events, such as currencies and newspapers", () => {
    expect(yearQuery(1914)).toContain("wdt:P31/wdt:P279* ?notEvent");
    expect(NOT_EVENTS).toContain("wd:Q8142");
    expect(NOT_EVENTS).toContain("wd:Q11032");
  });

  it("asks for the reviewer's events by id", () => {
    expect(itemsQuery(["Q1", "Q2"])).toContain("VALUES ?item { wd:Q1 wd:Q2 }");
  });
});

describe("candidatesFrom", () => {
  it("reads one candidate per item with dates as precise as Wikidata gives them", () => {
    const candidates = candidatesFrom(
      answer(
        row("Q361", "1914-07-28T00:00:00Z", 11, { sitelinks: "250", end: "1918-11-11T00:00:00Z", endPrecision: "11", enTitle: "World War I" }),
        row("Q1", "1920-03-05T00:00:00Z", 10),
        row("Q2", "1921-00-00T00:00:00Z", 9),
      ),
    );
    expect(candidates).toEqual([
      {
        id: "Q361",
        start: { iso: "1914-07-28", precision: "day" },
        end: { iso: "1918-11-11", precision: "day" },
        weight: 250,
        ptTitle: "Título Q361",
        enTitle: "World War I",
      },
      { id: "Q1", start: { iso: "1920-03-01", precision: "month" }, end: null, weight: 40, ptTitle: "Título Q1", enTitle: null },
      { id: "Q2", start: { iso: "1921-01-01", precision: "year" }, end: null, weight: 40, ptTitle: "Título Q2", enTitle: null },
    ]);
  });

  it("drops dates vaguer than a year and items that are not Wikidata's", () => {
    const bad = row("Q3", "1920-01-01T00:00:00Z", 11);
    bad.item = { value: "http://example.org/Q3" };
    expect(candidatesFrom(answer(row("Q1", "1900-01-01T00:00:00Z", 8), row("Q2", "nonsense", 11), bad))).toEqual([]);
  });

  it("merges the answers of one item: earliest start, the more precise of equal ones, latest end", () => {
    const [merged] = candidatesFrom(
      answer(
        row("Q5", "1939-09-01T00:00:00Z", 11, { end: "1945-05-08T00:00:00Z", endPrecision: "11" }),
        row("Q5", "1939-01-01T00:00:00Z", 9, { enTitle: "War" }),
        row("Q5", "1939-01-01T00:00:00Z", 11, { end: "1945-09-02T00:00:00Z", endPrecision: "11" }),
        row("Q5", "1940-01-01T00:00:00Z", 11, { end: "1944-01-01T00:00:00Z", endPrecision: "9" }),
        row("Q5", "1939-01-01T00:00:00Z", 10),
      ),
    );
    expect(merged).toMatchObject({
      start: { iso: "1939-01-01", precision: "day" },
      end: { iso: "1945-09-02", precision: "day" },
      enTitle: "War",
    });
  });

  it("keeps an end found only in a later answer", () => {
    const [merged] = candidatesFrom(
      answer(row("Q6", "1939-09-01T00:00:00Z", 11), row("Q6", "1939-09-01T00:00:00Z", 11, { end: "1945-01-01T00:00:00Z", endPrecision: "9" })),
    );
    expect(merged?.end).toEqual({ iso: "1945-01-01", precision: "year" });
  });

  it("drops medal tables, which are lists of results", () => {
    expect(candidatesFrom(answer(row("Q7", "1936-01-01T00:00:00Z", 9, { ptTitle: "Quadro de medalhas dos Jogos Olímpicos de Verão de 1936" })))).toEqual([]);
  });

  it("drops festivals, beauty contests, fashion weeks, tours and air crashes", () => {
    for (const title of [
      "Festival Eurovisão da Canção 1956",
      "Áustria no Festival Eurovisão da Canção",
      "Festival Internacional de Cinema de Berlim 1951",
      "Miss Mundo 1951",
      "Paris Fashion Week",
      "Semana da Moda de Milão",
      "Magic Tour",
      "Voo LOT Polish Airlines 5055",
      "Lista de filmes de James Bond",
    ])
      expect(NOT_EVENT_TITLE.test(title)).toBe(true);
    for (const title of ["Bienal Internacional de Arte de São Paulo", "Primeira Guerra Mundial", "Revolução Húngara de 1956"])
      expect(NOT_EVENT_TITLE.test(title)).toBe(false);
  });

  it("refuses an answer that is not the query service's", () => {
    expect(() => candidatesFrom({ head: {} })).toThrow();
  });
});

const candidate = (id: string, year: number, weight: number): Candidate => ({
  id,
  start: { iso: `${year}-01-01`, precision: "year" },
  end: null,
  weight,
  ptTitle: id,
  enTitle: null,
});

describe("selectCandidates", () => {
  const candidates = [candidate("Q1", 1920, 10), candidate("Q2", 1920, 30), candidate("Q3", 1920, 20), candidate("Q4", 1921, 5), candidate("Q2", 1920, 30)];

  it("keeps the best known per year, in date order", () => {
    expect(selectCandidates(candidates, { perYear: 2 }).map((c) => c.id)).toEqual(["Q2", "Q3", "Q4"]);
    expect(selectCandidates(candidates).map((c) => c.id)).toEqual(["Q2", "Q3", "Q1", "Q4"]);
  });

  it("leaves out what the reviewer excluded and keeps what they included", () => {
    expect(selectCandidates(candidates, { perYear: 2, exclude: ["Q2"] }).map((c) => c.id)).toEqual(["Q3", "Q1", "Q4"]);
    expect(selectCandidates(candidates, { perYear: 1, include: ["Q1"] }).map((c) => c.id)).toEqual(["Q2", "Q1", "Q4"]);
  });

  it("counts an event found in several years once, from its start", () => {
    const ended = { ...candidate("Q361", 1918, 265), start: { iso: "1918-11-11", precision: "day" as const } };
    const began = { ...candidate("Q361", 1914, 265), start: { iso: "1914-07-28", precision: "day" as const }, enTitle: "World War I" };
    expect(selectCandidates([ended, began])).toEqual([{ ...began, end: null }]);
  });

  it("breaks ties in fame by id", () => {
    expect(selectCandidates([candidate("Q9", 1920, 1), candidate("Q8", 1920, 1)], { perYear: 1 }).map((c) => c.id)).toEqual(["Q8"]);
  });
});

describe("shortText", () => {
  it("keeps the first sentence without the language notes", () => {
    expect(
      shortText(
        "A Anschluss (em alemão: Anschluss, 'conexão') foi a anexação da Áustria pela Alemanha Nazista em 12 de março de 1938. Foi celebrada em Viena.",
      ),
    ).toBe("A Anschluss foi a anexação da Áustria pela Alemanha Nazista em 12 de março de 1938.");
  });

  it("does not end a sentence at an abbreviation", () => {
    expect(shortText("O Tratado de Riga foi assinado em 1921 pela Polônia e a Rússia Soviética c. Riga, na Letônia, encerrando a guerra entre os dois Estados. Outra frase.")).toBe(
      "O Tratado de Riga foi assinado em 1921 pela Polônia e a Rússia Soviética c. Riga, na Letônia, encerrando a guerra entre os dois Estados.",
    );
  });

  it("takes the next sentence when the first is very short", () => {
    expect(shortText("A guerra começou. Ela durou de 1914 a 1918 e envolveu a maior parte das potências da Europa. Terceira.")).toBe(
      "A guerra começou. Ela durou de 1914 a 1918 e envolveu a maior parte das potências da Europa.",
    );
  });

  it("keeps a text with no sentence end whole, and cuts a long one at a word", () => {
    expect(shortText("Sem ponto final")).toBe("Sem ponto final");
    const long = shortText(`${"palavra, ".repeat(60)}fim.`);
    expect(long.length).toBeLessThanOrEqual(MAX_TEXT);
    expect(long).toMatch(/palavra…$/);
  });
});

describe("textFromSummary and summaryUrl", () => {
  const summary = {
    type: "standard",
    title: "Primeira Guerra Mundial",
    extract: "A Primeira Guerra Mundial foi um conflito global centrado na Europa, que começou em 28 de julho de 1914 e durou até 11 de novembro de 1918.",
    content_urls: { desktop: { page: "https://pt.wikipedia.org/wiki/Primeira_Guerra_Mundial" } },
  };

  it("reads the title, a short text and the article's link", () => {
    expect(textFromSummary(summary)).toEqual({
      title: "Primeira Guerra Mundial",
      text: summary.extract,
      url: "https://pt.wikipedia.org/wiki/Primeira_Guerra_Mundial",
    });
  });

  it("gives nothing for a disambiguation page or an empty opening", () => {
    expect(textFromSummary({ ...summary, type: "disambiguation" })).toBeNull();
    expect(textFromSummary({ ...summary, extract: " " })).toBeNull();
  });

  it("addresses an article by its title", () => {
    expect(summaryUrl("pt", "Tratado de Versalhes (1919)")).toBe(
      "https://pt.wikipedia.org/api/rest_v1/page/summary/Tratado_de_Versalhes_(1919)",
    );
  });
});

describe("toFact", () => {
  const text = { title: "T", text: "X.", url: "https://pt.wikipedia.org/wiki/T" };

  it("joins a candidate and its texts, and drops one with no Portuguese text", () => {
    expect(toFact(candidate("Q1", 1920, 3), text, null)).toEqual({
      id: "Q1",
      start: { iso: "1920-01-01", precision: "year" },
      end: null,
      weight: 3,
      pt: text,
      en: null,
    });
    expect(toFact(candidate("Q1", 1920, 3), null, text)).toBeNull();
  });
});

describe("reviewSchema", () => {
  it("defaults to no changes and refuses ids that are not Wikidata's", () => {
    expect(reviewSchema.parse({})).toEqual({ exclude: [], include: [] });
    expect(() => reviewSchema.parse({ exclude: ["361"] })).toThrow();
  });
});
