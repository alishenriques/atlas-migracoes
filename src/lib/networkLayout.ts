import { NODE_KINDS, normalizeName, type Graph, type NetworkEdge, type NetworkNode, type NodeKind } from "./network";

/** Which side of its node a label is written on, so labels point away from the drawing (the center's sits below it). */
export type LabelSide = "left" | "right" | "below";

export type PositionedNode = NetworkNode & {
  x: number;
  y: number;
  side: LabelSide;
  /** How many links the node has, which sets its size. */
  degree: number;
  /** Drawing units free for the label on its side, before the next column or the edge of the picture. */
  room: number;
};

/** [minX, minY, width, height], ready for an SVG viewBox. */
export type ViewBox = [number, number, number, number];

/** The columns of the overview, left to right: where artists came from, who they are, where they showed. */
export type ColumnKey = "origin" | "artist" | "institution" | "city";

export type Layout = {
  /** `radial` puts one artist in the middle; `columns` reads the whole base left to right. */
  shape: "radial" | "columns";
  nodes: PositionedNode[];
  edges: NetworkEdge[];
  viewBox: ViewBox;
  /** Radial only: the radius of each ring, innermost first. */
  rings: number[];
  /** Columns only: where each non-empty column stands. */
  columns: { key: ColumnKey; x: number }[];
};

const MARGIN = 40;
/** Room between rings, and between neighbours on a ring, in drawing units. */
const RING_GAP = 90;
const RING_SPACING = 18;
/** Space kept between the circles of neighbours on a ring, beyond their own size. */
const RING_PADDING = 6;
/** Room between rows and between columns of the overview. */
const ROW = 28;
const COLUMN_GAP = 300;
/** Labels longer than this are cut with an ellipsis in the drawing (the panel shows them whole). */
export const LABEL_MAX = 34;
/** Rough width of a label character and height of a label line at 11px, in on-screen pixels. */
const CHAR_WIDTH = 6.8;
const LINE_HEIGHT = 14;

const RADIUS: Record<NodeKind, number> = {
  artist: 8,
  work: 4.5,
  exhibition: 4.5,
  publication: 4.5,
  institution: 6.5,
  place: 6,
};

/** On-screen radius of a node: by kind, a little larger the more links it has; the center is largest. */
export function nodeRadius(node: Pick<PositionedNode, "kind" | "degree">, isCenter = false): number {
  if (isCenter) return 11;
  return RADIUS[node.kind] + Math.min(3, 0.75 * Math.log2(Math.max(1, node.degree)));
}

function adjacency(graph: Graph): Map<string, string[]> {
  const links = new Map<string, string[]>(graph.nodes.map((node) => [node.id, []]));
  for (const { source, target } of graph.edges) {
    links.get(source)?.push(target);
    links.get(target)?.push(source);
  }
  return links;
}

/**
 * Orders labels the same on the server and in the browser (their ICU data can sort
 * accents differently, which would make the drawing change on hydration).
 */
const byLabel = (a: string, b: string) => {
  const [x, y] = [normalizeName(a), normalizeName(b)];
  return x < y ? -1 : x > y ? 1 : 0;
};

const byKindThenLabel = (a: NetworkNode, b: NetworkNode) =>
  NODE_KINDS.indexOf(a.kind) - NODE_KINDS.indexOf(b.kind) ||
  (a.date?.year ?? Infinity) - (b.date?.year ?? Infinity) ||
  byLabel(a.label, b.label);

/** Room for the labels on one side, from the longest label there. */
const labelRoom = (nodes: NetworkNode[]) =>
  Math.min(LABEL_MAX, Math.max(8, ...nodes.map((node) => node.label.length))) * CHAR_WIDTH + 16;

/** The mean of some angles, read on the circle (so 350° and 10° average to 0°). */
const meanAngle = (angles: number[]) =>
  Math.atan2(
    angles.reduce((sum, angle) => sum + Math.sin(angle), 0),
    angles.reduce((sum, angle) => sum + Math.cos(angle), 0),
  );

/**
 * Rounds a coordinate to a hundredth: the server and the browser can differ in the
 * last digit of a sine, which would make the drawing change on hydration.
 */
const round = (value: number) => Math.round(value * 100) / 100 || 0;

const TOP = -Math.PI / 2;
const TURN = 2 * Math.PI;
/** An angle brought into one turn read clockwise from the top, so angles sort in reading order. */
const fromTop = (angle: number) => (((angle - TOP) % TURN) + TURN) % TURN + TOP;

/**
 * Spreads a ring's nodes over the circle in the order given. Each tries to sit at its
 * wanted angle (next to the nodes it links to on the inner ring), keeping `gap` from
 * its neighbour; a ring too full for that is spaced evenly instead.
 */
export function spreadOnRing(wanted: number[], gap: number): number[] {
  const count = wanted.length;
  const start = wanted[0] as number;
  if (count * gap >= TURN) return wanted.map((_, index) => start + (TURN * index) / count);

  const angles: number[] = [];
  for (const [index, angle] of wanted.entries()) {
    const previous = angles[index - 1];
    angles.push(previous === undefined ? angle : Math.max(angle, previous + gap));
  }
  // The pass above only pushes forward; pull the ring back by the average push so it stays centred.
  const drift = angles.reduce((sum, angle, index) => sum + angle - (wanted[index] as number), 0) / count;
  const settled = angles.map((angle) => angle - drift);
  const overflow = (settled.at(-1) as number) - (settled[0] as number) - (TURN - gap);
  return overflow > 0 ? wanted.map((_, index) => start + (TURN * index) / count) : settled;
}

/**
 * One artist's network in rings: the artist in the middle, then each ring one link
 * further out (works and life places, then exhibitions and publications, then
 * venues and the other artists of those exhibitions). Each ring is ordered so its
 * nodes sit beside the inner nodes they link to.
 */
export function radialLayout(graph: Graph, centerId: string): Layout {
  const links = adjacency(graph);
  const linksOf = (id: string) => links.get(id) as string[];

  const depth = new Map<string, number>([[centerId, 0]]);
  const queue = links.has(centerId) ? [centerId] : [];
  for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
    for (const next of linksOf(id)) {
      if (depth.has(next)) continue;
      depth.set(next, (depth.get(id) as number) + 1);
      queue.push(next);
    }
  }
  const outermost = Math.max(0, ...depth.values());
  // Nodes the center can't reach (none in an ego network, but kept safe) go on one more ring.
  for (const node of graph.nodes) if (!depth.has(node.id)) depth.set(node.id, outermost + 1);

  const rings: NetworkNode[][] = [];
  for (const node of graph.nodes) {
    const level = depth.get(node.id) as number;
    if (level > 0) (rings[level - 1] ??= []).push(node);
  }

  const angle = new Map<string, number>([[centerId, 0]]);
  const radii: number[] = [];
  const placed = new Map<string, { x: number; y: number }>([[centerId, { x: 0, y: 0 }]]);

  rings.forEach((ring, index) => {
    // Rings of large nodes (other artists, busy venues) need more room per node.
    const spacing = Math.max(
      RING_SPACING,
      ...ring.map((node) => 2 * nodeRadius({ kind: node.kind, degree: linksOf(node.id).length }) + RING_PADDING),
    );
    const radius = Math.max((radii[index - 1] ?? 0) + RING_GAP, (ring.length * spacing) / TURN);
    radii.push(radius);
    const wanted = new Map(
      ring.map((node) => {
        const inner = linksOf(node.id).filter((id) => depth.get(id) === index && id !== centerId);
        return [node.id, inner.length > 0 ? meanAngle(inner.map((id) => angle.get(id) as number)) : null] as const;
      }),
    );
    // Nodes that share their busiest outer link (the exhibitions of one institution) are kept together,
    // around the mean angle of the group, so the outer ring's links fan out instead of crossing the circle.
    const hubOf = (id: string) =>
      linksOf(id)
        .filter((other) => depth.get(other) === index + 2)
        .sort((a, b) => linksOf(b).length - linksOf(a).length || byLabel(a, b))[0] ?? id;
    const hubs = new Map(ring.map((node) => [node.id, hubOf(node.id)]));
    const hubAngle = new Map(
      [...new Set(hubs.values())].map((hub) => {
        const members = ring.filter((node) => hubs.get(node.id) === hub).map((node) => wanted.get(node.id) ?? TOP);
        return [hub, fromTop(meanAngle(members))] as const;
      }),
    );
    const key = (id: string) => hubAngle.get(hubs.get(id) as string) as number;
    // The first ring has nothing inside to follow: it is read clockwise from the top, by kind, date and name.
    const ordered =
      index === 0
        ? [...ring].sort(byKindThenLabel)
        : [...ring].sort(
            (a, b) =>
              key(a.id) - key(b.id) ||
              byLabel(hubs.get(a.id) as string, hubs.get(b.id) as string) ||
              fromTop(wanted.get(a.id) ?? TOP) - fromTop(wanted.get(b.id) ?? TOP) ||
              byKindThenLabel(a, b),
          );
    const angles =
      index === 0
        ? ordered.map((_, position) => TOP + (TURN * position) / ordered.length)
        : spreadOnRing(ordered.map((node) => key(node.id)), spacing / radius);

    ordered.forEach((node, position) => {
      const theta = angles[position] as number;
      angle.set(node.id, theta);
      placed.set(node.id, { x: round(radius * Math.cos(theta)), y: round(radius * Math.sin(theta)) });
    });
  });

  const nodes = graph.nodes.map((node) => {
    const { x, y } = placed.get(node.id) as { x: number; y: number };
    const side: LabelSide = node.id === centerId ? "below" : x < -1e-6 ? "left" : "right";
    return { ...node, x, y, side, degree: linksOf(node.id).length };
  });
  const outer = radii.at(-1) ?? 0;
  const left = labelRoom(nodes.filter((node) => node.side === "left"));
  const right = labelRoom(nodes.filter((node) => node.side === "right"));
  const viewBox: ViewBox = [-outer - MARGIN - left, -outer - MARGIN, 2 * (outer + MARGIN) + left + right, 2 * (outer + MARGIN)];

  return {
    shape: "radial",
    nodes: withRoom(nodes, viewBox),
    edges: graph.edges,
    viewBox,
    rings: radii,
    columns: [],
  };
}

/** Gives each node the room its label has, up to the edge of the picture (and `limit`, when given). */
function withRoom(nodes: Omit<PositionedNode, "room">[], [minX, , width]: ViewBox, limit = Infinity): PositionedNode[] {
  return nodes.map((node) => ({
    ...node,
    room:
      node.side === "below"
        ? width
        : Math.min(node.side === "right" ? minX + width - node.x : node.x - minX, node.side === "right" ? limit : Infinity),
  }));
}

const COLUMN_ORDER: ColumnKey[] = ["origin", "artist", "institution", "city"];

/** Which column a node of the overview stands in, read from its kind and its links. */
function columnOf(node: NetworkNode, edges: NetworkEdge[]): ColumnKey {
  if (node.kind === "artist") return "artist";
  if (node.kind !== "place") return "institution";
  // A place is an origin only when nobody showed there; a city of exhibitions wins over a birthplace.
  const venue = edges.some((edge) => edge.target === node.id && edge.kind !== "born_in");
  return venue ? "city" : "origin";
}

/**
 * The whole base in columns, read left to right as the migration: birthplaces,
 * artists, the institutions that showed them and the cities of those exhibitions.
 * Rows are ordered to keep links short and crossings few (a few barycenter sweeps).
 */
export function columnsLayout(graph: Graph): Layout {
  const links = adjacency(graph);
  const linksOf = (id: string) => links.get(id) as string[];
  const columns = new Map<ColumnKey, NetworkNode[]>(COLUMN_ORDER.map((key) => [key, []]));
  for (const node of graph.nodes) (columns.get(columnOf(node, graph.edges)) as NetworkNode[]).push(node);
  for (const nodes of columns.values()) nodes.sort((a, b) => byLabel(a.label, b.label));

  const row = new Map<string, number>();
  const assignRows = () => {
    for (const nodes of columns.values()) nodes.forEach((node, index) => row.set(node.id, (index - (nodes.length - 1) / 2) * ROW));
  };
  assignRows();
  const barycenter = (id: string) => {
    const linked = linksOf(id).map((other) => row.get(other) as number);
    return linked.length ? linked.reduce((sum, y) => sum + y, 0) / linked.length : (row.get(id) as number);
  };
  for (let sweep = 0; sweep < 4; sweep += 1) {
    for (const key of sweep % 2 === 0 ? COLUMN_ORDER : [...COLUMN_ORDER].reverse()) {
      const nodes = columns.get(key) as NetworkNode[];
      const weights = new Map(nodes.map((node) => [node.id, barycenter(node.id)]));
      nodes.sort((a, b) => (weights.get(a.id) as number) - (weights.get(b.id) as number) || byLabel(a.label, b.label));
      assignRows();
    }
  }

  const used = COLUMN_ORDER.filter((key) => (columns.get(key) as NetworkNode[]).length > 0);
  const x = new Map(used.map((key, index) => [key, index * COLUMN_GAP]));
  const nodes = graph.nodes.map((node) => {
    const key = columnOf(node, graph.edges);
    const side: LabelSide = key === "origin" ? "left" : "right";
    return { ...node, x: x.get(key) as number, y: row.get(node.id) as number, side, degree: linksOf(node.id).length };
  });

  const tallest = Math.max(1, ...used.map((key) => (columns.get(key) as NetworkNode[]).length));
  const half = ((tallest - 1) * ROW) / 2;
  const left = used[0] === "origin" ? labelRoom(columns.get("origin") as NetworkNode[]) : 0;
  const lastKey = used.at(-1);
  const right = labelRoom(lastKey ? (columns.get(lastKey) as NetworkNode[]) : []);
  const width = (Math.max(1, used.length) - 1) * COLUMN_GAP;

  // The top margin is doubled to hold the column headings.
  const viewBox: ViewBox = [-MARGIN - left, -half - 2 * MARGIN, width + 2 * MARGIN + left + right, 2 * half + 3 * MARGIN];

  return {
    shape: "columns",
    // A label between two columns stops short of the next one.
    nodes: withRoom(nodes, viewBox, COLUMN_GAP - 2 * RADIUS.artist),
    edges: graph.edges,
    viewBox,
    rings: [],
    columns: used.map((key) => ({ key, x: x.get(key) as number })),
  };
}

/** Where the column headings sit, above the tallest column. */
export const headingY = (layout: Layout) => layout.viewBox[1] + MARGIN;

type Box = { x1: number; y1: number; x2: number; y2: number };

const overlaps = (a: Box, b: Box) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

/** A label cut to `chars` characters with an ellipsis, or left whole when it fits. */
export const fitLabel = (label: string, chars: number) =>
  label.length > chars ? `${label.slice(0, Math.max(1, chars - 1)).trimEnd()}…` : label;

/** A label as drawn: its (possibly cut) text and how far it slid up or down to clear its neighbours. */
export type PlacedLabel = { text: string; shift: number };

/** Labels shorter than this are not worth writing: the node shows its name on hover instead. */
const MIN_CHARS = 6;

/**
 * Which labels to write, and how much of each, so none overlap another label or
 * node at the current zoom (`unit` = drawing units per on-screen pixel). Each label
 * is cut to the room on its side. The `pinned` ids are always written; the others
 * are tried artists first, then by how many links they have, and skipped where they
 * would collide. A skipped label still shows on hover, focus or selection.
 */
export function visibleLabels(
  nodes: PositionedNode[],
  { unit, pinned, candidates, centerId }: { unit: number; pinned: Set<string>; candidates: Set<string> | null; centerId: string | null },
): Map<string, PlacedLabel> {
  const radiusOf = (node: PositionedNode) => nodeRadius(node, node.id === centerId) * unit;
  // While something is selected the rest is dimmed, so labels may run over the dimmed nodes.
  const solid = candidates ? nodes.filter((node) => candidates.has(node.id) || pinned.has(node.id)) : nodes;
  const circles: (Box & { id: string })[] = solid.map((node) => {
    const radius = radiusOf(node);
    return { id: node.id, x1: node.x - radius, y1: node.y - radius, x2: node.x + radius, y2: node.y + radius };
  });
  const boxes: Box[] = [];
  const shown = new Map<string, PlacedLabel>();
  const line = LINE_HEIGHT * unit;

  const fits = (node: PositionedNode) => {
    const offset = radiusOf(node) + 3 * unit;
    return { offset, chars: Math.min(LABEL_MAX, Math.floor((node.room - offset) / (CHAR_WIDTH * unit))) };
  };
  const boxAt = (node: PositionedNode, offset: number, text: string, shift: number): Box => {
    const width = text.length * CHAR_WIDTH * unit;
    const top = node.y - line / 2 + shift;
    if (node.side === "right") return { x1: node.x + offset, y1: top, x2: node.x + offset + width, y2: top + line };
    if (node.side === "left") return { x1: node.x - offset - width, y1: top, x2: node.x - offset, y2: top + line };
    return { x1: node.x - width / 2, y1: node.y + offset + shift, x2: node.x + width / 2, y2: node.y + offset + shift + line };
  };

  // Labels that must show (the center, the selection and its links, the hovered node) go first, top to
  // bottom; one that would cover an earlier one slides down below it, so a bundle of links reads as a list.
  const mustShow = nodes.filter((node) => pinned.has(node.id)).sort((a, b) => a.y - b.y || byLabel(a.label, b.label));
  for (const node of mustShow) {
    const { offset } = fits(node);
    const text = fitLabel(node.label, LABEL_MAX);
    let shift = 0;
    for (let tries = 0; tries <= boxes.length; tries += 1) {
      const box = boxAt(node, offset, text, shift);
      const cover = boxes.find((other) => overlaps(box, other));
      if (!cover) break;
      shift += cover.y2 - box.y1;
    }
    boxes.push(boxAt(node, offset, text, shift));
    shown.set(node.id, { text, shift });
  }

  // The rest are tried artists first, then by how many links they have, and left out where they would collide.
  const rest = nodes
    .filter((node) => !pinned.has(node.id) && (!candidates || candidates.has(node.id)))
    .sort(
      (a, b) =>
        Number(b.kind === "artist") - Number(a.kind === "artist") || b.degree - a.degree || byLabel(a.label, b.label),
    );
  for (const node of rest) {
    const { offset, chars } = fits(node);
    if (chars < MIN_CHARS) continue;
    const text = fitLabel(node.label, chars);
    const box = boxAt(node, offset, text, 0);
    const blocked =
      boxes.some((other) => overlaps(box, other)) || circles.some((circle) => circle.id !== node.id && overlaps(box, circle));
    if (blocked) continue;
    boxes.push(box);
    shown.set(node.id, { text, shift: 0 });
  }
  return shown;
}
