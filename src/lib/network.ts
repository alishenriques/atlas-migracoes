import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from "d3-force";

import { FULL_PERIOD, placeName, type Period } from "./trajectory";

import type { FuzzyDate, NetworkArtist, NetworkData, NetworkExhibition, NetworkPublication, Place } from "./schemas";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export type NodeKind = "artist" | "work" | "exhibition" | "publication" | "institution" | "place";

/** The kinds in the order the legend lists them. */
export const NODE_KINDS: NodeKind[] = ["artist", "work", "exhibition", "publication", "institution", "place"];

export type NetworkNode = {
  /** Prefixed by kind (`artist:`, `work:`…), so ids from different tables never collide. */
  id: string;
  kind: NodeKind;
  label: string;
  /** Artists only: the slug of their record. */
  slug: string | null;
  /** Works, exhibitions and publications: their date as the source gives it. */
  date: FuzzyDate | null;
};

export type EdgeKind =
  | "created"
  | "shown_in"
  | "published_in"
  | "held_by"
  | "held_in"
  | "born_in"
  | "died_in"
  | "exhibited_at";

export type NetworkEdge = {
  source: string;
  target: string;
  kind: EdgeKind;
  /** How many distinct records (exhibitions, works) back the link. */
  weight: number;
};

export type Graph = { nodes: NetworkNode[]; edges: NetworkEdge[] };

/** Which dated records enter the graph. Records with no year enter only when `includeUndated` is set. */
export type PeriodFilter = { period: Period; includeUndated: boolean };

/** Case-, accent- and spacing-insensitive key, so "MAC  USP" and "Mac Usp" are one institution. */
export const normalizeName = (name: string) =>
  name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

export const nodeIds = {
  artist: (slug: string) => `artist:${slug}`,
  work: (id: string) => `work:${id}`,
  exhibition: (id: string) => `exhibition:${id}`,
  publication: (id: string) => `publication:${id}`,
  institution: (name: string) => `institution:${normalizeName(name)}`,
  place: (id: string) => `place:${id}`,
};

const span = (date: FuzzyDate): Period | null => (date.year === null ? null : [date.year, date.endYear ?? date.year]);

/** Whether a date falls in the period; a date with no year only passes when undated records are included. */
export function inPeriod(date: FuzzyDate, { period: [from, to], includeUndated }: PeriodFilter): boolean {
  const years = span(date);
  if (!years) return includeUndated;
  return years[0] <= to && years[1] >= from;
}

const exhibitionsOf = (artist: NetworkArtist) => uniqueById(artist.works.flatMap((work) => work.exhibitions));
const publicationsOf = (artist: NetworkArtist) => uniqueById(artist.works.flatMap((work) => work.publications));

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

/**
 * First and last year of the exhibitions and publications in the base, so the
 * period filter covers every dated record. Falls back to 1918–1989 when nothing is dated.
 */
export function networkExtent(data: NetworkData): Period {
  const years = data.artists
    .flatMap((artist) => [
      ...exhibitionsOf(artist).map((exhibition) => exhibition.startDate),
      ...publicationsOf(artist).map((publication) => publication.date),
    ])
    .flatMap((date) => span(date) ?? []);
  if (years.length === 0) return FULL_PERIOD;
  return [Math.min(...years), Math.max(...years)];
}

class GraphBuilder {
  private nodes = new Map<string, NetworkNode>();
  private edges = new Map<string, { edge: NetworkEdge; refs: Set<string> }>();

  node(id: string, kind: NodeKind, label: string, extra: Partial<Pick<NetworkNode, "slug" | "date">> = {}): string {
    if (!this.nodes.has(id)) this.nodes.set(id, { id, kind, label, slug: extra.slug ?? null, date: extra.date ?? null });
    return id;
  }

  artist(artist: NetworkArtist) {
    return this.node(nodeIds.artist(artist.slug), "artist", artist.name, { slug: artist.slug });
  }

  place(place: Place) {
    return this.node(nodeIds.place(place.id), "place", placeName(place));
  }

  institution(name: string) {
    return this.node(nodeIds.institution(name), "institution", name.trim());
  }

  exhibition(exhibition: NetworkExhibition) {
    return this.node(nodeIds.exhibition(exhibition.id), "exhibition", exhibition.title, { date: exhibition.startDate });
  }

  publication(publication: NetworkPublication) {
    return this.node(nodeIds.publication(publication.id), "publication", publication.title, { date: publication.date });
  }

  /** Links two nodes; `ref` names the record behind the link, so the weight counts distinct records. */
  edge(source: string, target: string, kind: EdgeKind, ref = `${source}|${target}`) {
    const key = `${source}|${target}|${kind}`;
    const entry = this.edges.get(key) ?? { edge: { source, target, kind, weight: 0 }, refs: new Set<string>() };
    entry.refs.add(ref);
    entry.edge.weight = entry.refs.size;
    this.edges.set(key, entry);
  }

  build(): Graph {
    return { nodes: [...this.nodes.values()], edges: [...this.edges.values()].map(({ edge }) => edge) };
  }
}

/** Where an exhibition happened, as a node: the institution when the source names one, else the place. */
function venueOf(builder: GraphBuilder, exhibition: NetworkExhibition): string | null {
  if (exhibition.institution?.trim()) return builder.institution(exhibition.institution);
  return exhibition.place ? builder.place(exhibition.place) : null;
}

/**
 * The whole base at a glance: every artist linked to their birthplace and to
 * the institutions (or, when none is named, the places) that showed their
 * works in the period, weighted by the number of exhibitions.
 */
export function overviewGraph(data: NetworkData, filter: PeriodFilter): Graph {
  const builder = new GraphBuilder();
  const heldIn = new Set<string>();

  for (const artist of data.artists) {
    const artistId = builder.artist(artist);
    if (artist.birthPlace) builder.edge(artistId, builder.place(artist.birthPlace), "born_in");

    for (const exhibition of exhibitionsOf(artist).filter((item) => inPeriod(item.startDate, filter))) {
      const venue = venueOf(builder, exhibition);
      if (!venue) continue;
      builder.edge(artistId, venue, "exhibited_at", exhibition.id);
      if (exhibition.institution?.trim() && exhibition.place && !heldIn.has(exhibition.id)) {
        heldIn.add(exhibition.id);
        builder.edge(venue, builder.place(exhibition.place), "held_in", exhibition.id);
      }
    }
  }

  return builder.build();
}

/**
 * One artist's network: their works, where each work was shown or published in
 * the period, the institutions and places of those exhibitions, their birth and
 * death places, and the other artists of the collection shown in the same exhibitions.
 * Returns null for an unknown slug.
 */
export function egoGraph(data: NetworkData, slug: string, filter: PeriodFilter): Graph | null {
  const artist = data.artists.find((item) => item.slug === slug);
  if (!artist) return null;

  const builder = new GraphBuilder();
  const artistId = builder.artist(artist);
  if (artist.birthPlace) builder.edge(artistId, builder.place(artist.birthPlace), "born_in");
  if (artist.deathPlace) builder.edge(artistId, builder.place(artist.deathPlace), "died_in");

  const shown = new Set<string>();
  for (const work of artist.works) {
    const exhibitions = work.exhibitions.filter((item) => inPeriod(item.startDate, filter));
    const publications = work.publications.filter((item) => inPeriod(item.date, filter));
    if (exhibitions.length === 0 && publications.length === 0 && !inPeriod(work.date, filter)) continue;

    const workId = builder.node(nodeIds.work(work.id), "work", work.title, { date: work.date });
    builder.edge(artistId, workId, "created");

    for (const exhibition of exhibitions) {
      const exhibitionId = builder.exhibition(exhibition);
      builder.edge(workId, exhibitionId, "shown_in");
      if (exhibition.institution?.trim()) builder.edge(exhibitionId, builder.institution(exhibition.institution), "held_by");
      if (exhibition.place) builder.edge(exhibitionId, builder.place(exhibition.place), "held_in");
      shown.add(exhibition.id);
    }
    for (const publication of publications) builder.edge(workId, builder.publication(publication), "published_in");
  }

  for (const other of data.artists) {
    if (other.slug === slug) continue;
    for (const exhibition of exhibitionsOf(other).filter((item) => shown.has(item.id))) {
      builder.edge(builder.artist(other), nodeIds.exhibition(exhibition.id), "exhibited_at");
    }
  }

  return builder.build();
}

/** How many nodes of each kind the graph has. */
export function countByKind(graph: Graph): Record<NodeKind, number> {
  const counts = Object.fromEntries(NODE_KINDS.map((kind) => [kind, 0])) as Record<NodeKind, number>;
  for (const node of graph.nodes) counts[node.kind] += 1;
  return counts;
}

/** The nodes linked to `id`, each once. */
export function neighborsOf(graph: Graph, id: string): NetworkNode[] {
  const ids = new Set(
    graph.edges.flatMap((edge) => (edge.source === id ? [edge.target] : edge.target === id ? [edge.source] : [])),
  );
  return graph.nodes.filter((node) => ids.has(node.id));
}

export type PositionedNode = NetworkNode & { x: number; y: number };
export type Layout = {
  nodes: PositionedNode[];
  edges: NetworkEdge[];
  /** [minX, minY, width, height], ready for an SVG viewBox. */
  viewBox: [number, number, number, number];
};

type SimNode = SimulationNodeDatum & { id: string };

const MARGIN = 40;
const labelRoom = (width: number) => Math.max(120, width * 0.2);

/**
 * Places the nodes with a force simulation run to rest before drawing. d3-force
 * seeds its own random source, so the same graph always gets the same picture.
 * The `center` node, when given, is pinned at the origin.
 */
export function layoutGraph(graph: Graph, { center, ticks = 300 }: { center?: string; ticks?: number } = {}): Layout {
  const simNodes: SimNode[] = graph.nodes.map(({ id }) => (id === center ? { id, fx: 0, fy: 0 } : { id }));
  const links: SimulationLinkDatum<SimNode>[] = graph.edges.map(({ source, target }) => ({ source, target }));

  forceSimulation(simNodes)
    .force("link", forceLink(links).id((node) => (node as SimNode).id).distance(48))
    .force("charge", forceManyBody().strength(-90))
    .force("collide", forceCollide(10))
    .force("x", forceX(0).strength(0.05))
    .force("y", forceY(0).strength(0.05))
    .stop()
    .tick(ticks);

  const nodes = graph.nodes.map((node, index) => {
    const { x = 0, y = 0 } = simNodes[index] as SimNode;
    return { ...node, x, y };
  });
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const [minX, maxX] = xs.length ? [Math.min(...xs), Math.max(...xs)] : [0, 0];
  const [minY, maxY] = ys.length ? [Math.min(...ys), Math.max(...ys)] : [0, 0];

  return {
    nodes,
    edges: graph.edges,
    // Labels sit to the right of their node, so that side gets room for them.
    viewBox: [minX - MARGIN, minY - MARGIN, maxX - minX + 2 * MARGIN + labelRoom(maxX - minX), maxY - minY + 2 * MARGIN],
  };
}
