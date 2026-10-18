import { describe, expect, it } from "vitest";

import {
  countByKind,
  egoGraph,
  inPeriod,
  layoutGraph,
  neighborsOf,
  networkExtent,
  nodeIds,
  normalizeName,
  overviewGraph,
  type Graph,
  type PeriodFilter,
} from "./network";

import type { FuzzyDate, NetworkArtist, NetworkData, NetworkExhibition, Place } from "./schemas";

const year = (value: number, endYear = value): FuzzyDate => ({
  raw: String(value),
  year: value,
  endYear,
  iso: null,
  precision: endYear === value ? "year" : "range",
});
const unknown: FuzzyDate = { raw: null, year: null, endYear: null, iso: null, precision: "unknown" };
const place = (id: string, label: string, currentName: string | null = null): Place => ({
  id,
  label,
  country: "Brasil",
  currentName,
  lat: null,
  lng: null,
});

const vilna = place("vilna", "Vilna", "Vilnius, Lituânia");
const saoPaulo = place("sp", "São Paulo");

const bienal: NetworkExhibition = { id: "EX.1", title: "Bienal", startDate: year(1951), institution: "MAC USP", place: saoPaulo };
const salao: NetworkExhibition = { id: "EX.2", title: "Salão", startDate: year(1965), institution: " Mac  Usp ", place: saoPaulo };
const semData: NetworkExhibition = { id: "EX.3", title: "Sem data", startDate: unknown, institution: null, place: saoPaulo };
const semLugar: NetworkExhibition = { id: "EX.4", title: "Sem lugar", startDate: year(1970), institution: null, place: null };

const segall: NetworkArtist = {
  slug: "lasar-segall",
  name: "Lasar Segall",
  birthPlace: vilna,
  birthDate: year(1889),
  deathPlace: saoPaulo,
  works: [
    {
      id: "W1",
      title: "Paisagem",
      date: year(1930),
      exhibitions: [bienal, semData],
      publications: [{ id: "PB.1", title: "Catálogo", date: year(1951), periodical: null }],
    },
    { id: "W2", title: "Retrato", date: unknown, exhibitions: [bienal, salao, semLugar], publications: [] },
    { id: "W3", title: "Estudo", date: unknown, exhibitions: [], publications: [] },
  ],
};

const gruber: NetworkArtist = {
  slug: "mario-gruber",
  name: "Mario Gruber",
  birthPlace: null,
  birthDate: unknown,
  deathPlace: null,
  works: [{ id: "W9", title: "Gravura", date: year(1960), exhibitions: [bienal], publications: [] }],
};

const data: NetworkData = { meta: { source: "demo" }, artists: [segall, gruber] };

const all: PeriodFilter = { period: [1951, 1970], includeUndated: true };
const fifties: PeriodFilter = { period: [1950, 1959], includeUndated: false };

const ids = (graph: Graph) => graph.nodes.map((node) => node.id).sort();
const edge = (graph: Graph, source: string, target: string) =>
  graph.edges.find((item) => item.source === source && item.target === target);

describe("normalizeName", () => {
  it("ignores case, accents and spacing", () => {
    expect(normalizeName("  Museu  de Arte ")).toBe(normalizeName("museu de arte"));
    expect(normalizeName("Pinacoteca do Estado de São Paulo")).toBe("pinacoteca do estado de sao paulo");
  });
});

describe("inPeriod", () => {
  it("keeps a date whose span touches the period", () => {
    expect(inPeriod(year(1945, 1952), fifties)).toBe(true);
    expect(inPeriod(year(1960), fifties)).toBe(false);
    expect(inPeriod(year(1940, 1949), fifties)).toBe(false);
  });

  it("keeps an undated record only when asked to", () => {
    expect(inPeriod(unknown, fifties)).toBe(false);
    expect(inPeriod(unknown, all)).toBe(true);
  });

  it("reads a date without endYear as a single year", () => {
    expect(inPeriod({ ...year(1955), endYear: null }, fifties)).toBe(true);
  });
});

describe("networkExtent", () => {
  it("spans the dated exhibitions and publications", () => {
    expect(networkExtent(data)).toEqual([1951, 1970]);
  });

  it("falls back to 1918–1989 when nothing is dated", () => {
    expect(networkExtent({ meta: { source: "demo" }, artists: [] })).toEqual([1918, 1989]);
  });
});

describe("overviewGraph", () => {
  const graph = overviewGraph(data, all);
  const segallId = nodeIds.artist("lasar-segall");
  const macUsp = nodeIds.institution("MAC USP");

  it("links artists to their birthplace and to where their works were shown", () => {
    expect(ids(graph)).toEqual(
      [segallId, nodeIds.artist("mario-gruber"), nodeIds.place("vilna"), nodeIds.place("sp"), macUsp].sort(),
    );
    expect(edge(graph, segallId, nodeIds.place("vilna"))?.kind).toBe("born_in");
  });

  it("counts distinct exhibitions per institution, merging spellings", () => {
    expect(edge(graph, segallId, macUsp)).toEqual({ source: segallId, target: macUsp, kind: "exhibited_at", weight: 2 });
    expect(graph.nodes.find((node) => node.id === macUsp)?.label).toBe("MAC USP");
  });

  it("falls back to the place when the source names no institution, and skips exhibitions with neither", () => {
    expect(edge(graph, segallId, nodeIds.place("sp"))).toMatchObject({ kind: "exhibited_at", weight: 1 });
  });

  it("links each institution to its place once per exhibition", () => {
    expect(edge(graph, macUsp, nodeIds.place("sp"))).toMatchObject({ kind: "held_in", weight: 2 });
  });

  it("keeps only the exhibitions of the period", () => {
    const filtered = overviewGraph(data, fifties);
    expect(edge(filtered, segallId, macUsp)?.weight).toBe(1);
    expect(edge(filtered, segallId, nodeIds.place("sp"))).toBeUndefined();
  });

  it("shows place names with their present-day name", () => {
    expect(graph.nodes.find((node) => node.id === nodeIds.place("vilna"))?.label).toBe("Vilna (Vilnius, Lituânia)");
  });
});

describe("egoGraph", () => {
  const segallId = nodeIds.artist("lasar-segall");

  it("returns null for an unknown artist", () => {
    expect(egoGraph(data, "nobody", all)).toBeNull();
  });

  it("links the artist to works, their exhibitions and publications, venues and life places", () => {
    const graph = egoGraph(data, "lasar-segall", all);
    expect(graph && countByKind(graph)).toEqual({
      artist: 2,
      work: 3,
      exhibition: 4,
      publication: 1,
      institution: 1,
      place: 2,
    });
    expect(graph && edge(graph, segallId, nodeIds.place("sp"))?.kind).toBe("died_in");
    expect(graph && edge(graph, nodeIds.work("W1"), nodeIds.publication("PB.1"))?.kind).toBe("published_in");
    expect(graph && edge(graph, nodeIds.exhibition("EX.2"), nodeIds.institution("MAC USP"))?.kind).toBe("held_by");
    expect(graph && edge(graph, nodeIds.exhibition("EX.1"), nodeIds.place("sp"))?.kind).toBe("held_in");
  });

  it("links the other artists shown in the same exhibitions", () => {
    const graph = egoGraph(data, "lasar-segall", all);
    expect(graph && edge(graph, nodeIds.artist("mario-gruber"), nodeIds.exhibition("EX.1"))?.kind).toBe("exhibited_at");
  });

  it("keeps a work only when it or one of its records falls in the period", () => {
    const graph = egoGraph(data, "lasar-segall", fifties);
    expect(graph && ids(graph)).toEqual(
      [
        segallId,
        nodeIds.artist("mario-gruber"),
        nodeIds.work("W1"),
        nodeIds.work("W2"),
        nodeIds.exhibition("EX.1"),
        nodeIds.publication("PB.1"),
        nodeIds.institution("MAC USP"),
        nodeIds.place("vilna"),
        nodeIds.place("sp"),
      ].sort(),
    );
  });

  it("draws an artist with no places or works as a single node", () => {
    const graph = egoGraph({ meta: { source: "demo" }, artists: [{ ...gruber, works: [] }] }, "mario-gruber", all);
    expect(graph?.nodes).toHaveLength(1);
    expect(graph?.edges).toHaveLength(0);
  });
});

describe("neighborsOf", () => {
  it("lists the nodes linked either way, once", () => {
    const graph = overviewGraph(data, all);
    const neighbors = neighborsOf(graph, nodeIds.place("sp")).map((node) => node.id);
    expect(neighbors.sort()).toEqual([nodeIds.artist("lasar-segall"), nodeIds.institution("MAC USP")].sort());
  });
});

describe("layoutGraph", () => {
  const graph = egoGraph(data, "lasar-segall", all) as Graph;

  it("places every node and frames them all", () => {
    const layout = layoutGraph(graph, { center: nodeIds.artist("lasar-segall") });
    expect(layout.nodes).toHaveLength(graph.nodes.length);
    expect(layout.nodes.find((node) => node.kind === "artist" && node.slug === "lasar-segall")).toMatchObject({ x: 0, y: 0 });
    const [minX, minY, width, height] = layout.viewBox;
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThan(minX);
      expect(node.x).toBeLessThan(minX + width);
      expect(node.y).toBeGreaterThan(minY);
      expect(node.y).toBeLessThan(minY + height);
    }
  });

  it("gives the same picture every time", () => {
    expect(layoutGraph(graph, { ticks: 50 })).toEqual(layoutGraph(graph, { ticks: 50 }));
  });

  it("frames an empty graph around the origin", () => {
    expect(layoutGraph({ nodes: [], edges: [] }).viewBox).toEqual([-40, -40, 200, 80]);
  });
});
