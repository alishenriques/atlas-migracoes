// A stand-in for atlas-migracoes-api in the smoke tests. Every record is
// simulated (meta.source = demo); real collection data never goes in the repo.
// Run with `node --experimental-strip-types e2e/mock-api.mts` (port from MOCK_API_PORT).
import { createServer } from "node:http";

import type { FuzzyDate, Place, Research } from "../src/lib/schemas";

const year = (value: number | null): FuzzyDate => ({
  raw: value === null ? null : String(value),
  year: value,
  endYear: value,
  iso: null,
  precision: value === null ? "unknown" : "year",
});

const place = (id: string, label: string, country: string, lat: number, lng: number): Place => ({
  id,
  label,
  country,
  currentName: null,
  lat,
  lng,
});

const varsovia = place("varsovia", "Varsóvia", "Polônia", 52.23, 21.01);
const viena = place("viena", "Viena", "Áustria", 48.2, 16.37);
const paris = place("paris", "Paris", "França", 48.86, 2.35);
const saoPaulo = place("sao-paulo", "São Paulo", "Brasil", -23.55, -46.63);
const rio = place("rio", "Rio de Janeiro", "Brasil", -22.9, -43.2);

const exhibition = (id: string, title: string, at: number, where: Place) => ({
  id,
  title,
  startDate: year(at),
  endDate: year(null),
  institution: `Instituição ${id} (simulada)`,
  venue: null,
  place: where,
});

const salao = exhibition("e1", "Salão simulado", 1934, saoPaulo);
const bienal = exhibition("e2", "Bienal simulada", 1951, saoPaulo);
const mostra = exhibition("e3", "Mostra simulada", 1928, paris);
const revista = { id: "p1", authors: null, title: "Revista simulada", city: "São Paulo", publisher: null, date: year(1952), category: null, periodical: "Periódico simulado" };

const work = (id: string, title: string, at: number, exhibitions: (typeof salao)[], publications: (typeof revista)[]) => ({
  id,
  title,
  date: year(at),
  technique: "óleo sobre tela",
  dimensions: null,
  acquisition: null,
  acquisitionDate: year(null),
  exhibitions,
  publications,
});

// One superset per artist: each query's Zod schema in the app keeps only the fields it asked for.
const artists = [
  {
    slug: "artista-a",
    name: "Artista A (simulado)",
    birthPlace: varsovia,
    birthDate: year(1900),
    deathPlace: saoPaulo,
    deathDate: year(1975),
    exhibitions: [mostra, salao, bienal],
    works: [work("w1", "Obra simulada 1", 1930, [salao], []), work("w2", "Obra simulada 2", 1950, [bienal], [revista])],
    publications: [revista],
  },
  {
    slug: "artista-b",
    name: "Artista B (simulado)",
    birthPlace: viena,
    birthDate: year(1910),
    deathPlace: rio,
    deathDate: year(1980),
    exhibitions: [bienal],
    works: [work("w3", "Obra simulada 3", 1951, [bienal], [])],
    publications: [],
  },
];

const wikidata = "https://www.wikidata.org/wiki/Q1"; // only rendered as a link, never fetched
const finding = (property: Research["findings"][number]["property"], value: string, references = 0) => ({
  source: "wikidata" as const,
  sourceUrl: wikidata,
  sourceTitle: "Wikidata: Artista A (simulado) (Q1)",
  property,
  propertyId: "P1",
  value,
  references,
  reliability: references > 0 ? ("documented" as const) : ("undetermined" as const),
  reviews: [],
});

const research = (slug: string): Research | null => {
  const artist = artists.find((item) => item.slug === slug);
  if (!artist) return null;
  return {
    artist,
    searchedNames: [artist.name],
    match: { id: "Q1", label: artist.name, description: "pintor (registro simulado)", url: wikidata, basis: "birth_year", note: null },
    candidates: [],
    findings: [finding("birthDate", "1900", 1), finding("birthPlace", "Varsóvia"), finding("occupation", "pintor", 1)],
    sources: [
      { source: "wikidata", status: "ok", detail: null },
      { source: "wikipedia", status: "no_match", detail: null },
    ],
    period: { day: "1900-07-01", approximate: false, birthState: "Império Russo", states: ["Alemanha", "Império Russo"] },
    summary: {
      status: "ok",
      text: `${artist.name} nasceu em 1900 [1] em Varsóvia, então no Império Russo [2], e foi pintor [3].`,
      citations: [1, 2, 3],
      prompt: "# Instruções\n\n(simulado)\n\n# Dados\n\n[1] data de nascimento: 1900",
      model: "simulado",
      detail: null,
    },
    retrievedAt: "2026-10-20T12:00:00.000Z",
  };
};

const meta = { source: "demo" };
const stats = { artists: artists.length, works: 3, exhibitions: 3, publications: 1, places: 5, originCountries: 2 };

function answer(operation: string, variables: Record<string, unknown>): unknown {
  const slug = typeof variables.slug === "string" ? variables.slug : "";
  switch (operation) {
    case "Overview":
      return { meta, stats };
    case "ArtistRecord":
      return { meta, artist: artists.find((item) => item.slug === slug) ?? null };
    case "Research":
      return { research: research(slug) };
    default:
      return { meta, artists };
  }
}

const port = Number(process.env.MOCK_API_PORT ?? 4000);

createServer((request, response) => {
  let body = "";
  request.on("data", (chunk: Buffer) => (body += chunk.toString()));
  request.on("end", () => {
    response.setHeader("content-type", "application/json");
    if (request.method !== "POST") {
      response.end(JSON.stringify({ data: { health: "ok" } }));
      return;
    }
    const { query = "", variables = {} } = JSON.parse(body) as { query?: string; variables?: Record<string, unknown> };
    const operation = /query\s+(\w+)/.exec(query)?.[1] ?? "";
    response.end(JSON.stringify({ data: answer(operation, variables) }));
  });
}).listen(port, () => console.log(`mock API on http://localhost:${port}/graphql`));
