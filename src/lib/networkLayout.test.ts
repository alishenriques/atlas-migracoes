import { describe, expect, it } from "vitest";

import { nodeIds, type EdgeKind, type Graph, type NetworkNode, type NodeKind } from "./network";
import {
  columnsLayout,
  fitLabel,
  headingY,
  LABEL_MAX,
  nodeRadius,
  radialLayout,
  spreadOnRing,
  visibleLabels,
  type Layout,
  type PositionedNode,
} from "./networkLayout";

const TURN = 2 * Math.PI;

const node = (id: string, kind: NodeKind, label = id, year: number | null = null): NetworkNode => ({
  id,
  kind,
  label,
  slug: kind === "artist" ? id : null,
  date: year === null ? null : { raw: String(year), year, endYear: year, iso: null, precision: "year" },
});
const link = (source: string, target: string, kind: EdgeKind) => ({ source, target, kind, weight: 1 });

const at = (layout: Layout, id: string) => layout.nodes.find((item) => item.id === id) as PositionedNode;
const distance = (item: PositionedNode) => Math.hypot(item.x, item.y);
/** Angle clockwise from the top, in [0, 2π). */
const bearing = (item: PositionedNode) => (Math.atan2(item.y, item.x) + Math.PI / 2 + TURN) % TURN;

describe("nodeRadius", () => {
  it("sizes by kind, grows with the links up to a cap, and draws the center largest", () => {
    expect(nodeRadius({ kind: "work", degree: 0 })).toBe(4.5);
    expect(nodeRadius({ kind: "work", degree: 1 })).toBe(4.5);
    expect(nodeRadius({ kind: "work", degree: 4 })).toBe(6);
    expect(nodeRadius({ kind: "institution", degree: 4096 })).toBe(9.5);
    expect(nodeRadius({ kind: "work", degree: 1 }, true)).toBe(11);
  });
});

describe("fitLabel", () => {
  it("keeps a label that fits and cuts a longer one with an ellipsis", () => {
    expect(fitLabel("Pinacoteca", 10)).toBe("Pinacoteca");
    expect(fitLabel("Museu de Arte Moderna", 10)).toBe("Museu de…");
    expect(fitLabel("Museu", 0)).toBe("M…");
  });
});

describe("spreadOnRing", () => {
  it("keeps nodes where they want to be when there is room", () => {
    expect(spreadOnRing([0, 1], 0.1)).toEqual([0, 1]);
  });

  it("pushes crowded nodes apart around where they wanted to be", () => {
    const [first, second] = spreadOnRing([0, 0], 0.2) as [number, number];
    expect(first).toBeCloseTo(-0.1);
    expect(second).toBeCloseTo(0.1);
  });

  it("spaces a ring evenly when it is too full, or when pushing would wrap it around", () => {
    expect(spreadOnRing([1, 1, 1, 1], 2)).toEqual([1, 1 + TURN / 4, 1 + TURN / 2, 1 + (3 * TURN) / 4]);
    expect(spreadOnRing([0, 0, 0, TURN - 0.05], 0.5)).toEqual([0, TURN / 4, TURN / 2, (3 * TURN) / 4]);
  });
});

describe("radialLayout", () => {
  const center = nodeIds.artist("segall");
  // Two works; each shown at two exhibitions, one of each at the MAC and one at the Pinacoteca.
  const graph: Graph = {
    nodes: [
      node(center, "artist", "Lasar Segall"),
      node("work:b", "work", "Retrato", 1940),
      node("work:a", "work", "Paisagem", 1930),
      node("place:vilna", "place", "Vilna"),
      node("exhibition:1", "exhibition", "Bienal I"),
      node("exhibition:2", "exhibition", "Salão I"),
      node("exhibition:3", "exhibition", "Bienal II"),
      node("exhibition:4", "exhibition", "Salão II"),
      node("institution:mac", "institution", "MAC USP"),
      node("institution:pina", "institution", "Pinacoteca"),
    ],
    edges: [
      link(center, "work:a", "created"),
      link(center, "work:b", "created"),
      link(center, "place:vilna", "born_in"),
      link("work:a", "exhibition:1", "shown_in"),
      link("work:a", "exhibition:2", "shown_in"),
      link("work:b", "exhibition:3", "shown_in"),
      link("work:b", "exhibition:4", "shown_in"),
      link("exhibition:1", "institution:mac", "held_by"),
      link("exhibition:3", "institution:mac", "held_by"),
      link("exhibition:2", "institution:pina", "held_by"),
      link("exhibition:4", "institution:pina", "held_by"),
    ],
  };
  const layout = radialLayout(graph, center);

  it("puts the artist in the middle, labelled below, and each ring one link further out", () => {
    expect(layout.shape).toBe("radial");
    expect(at(layout, center)).toMatchObject({ x: 0, y: 0, side: "below", degree: 3 });
    const [inner, middle, outer] = layout.rings as [number, number, number];
    expect(inner).toBeLessThan(middle);
    expect(middle).toBeLessThan(outer);
    expect(distance(at(layout, "work:a"))).toBeCloseTo(inner, 1);
    expect(distance(at(layout, "place:vilna"))).toBeCloseTo(inner, 1);
    expect(distance(at(layout, "exhibition:3"))).toBeCloseTo(middle, 1);
    expect(distance(at(layout, "institution:pina"))).toBeCloseTo(outer, 1);
    expect(layout.columns).toEqual([]);
  });

  it("reads the first ring clockwise from the top, by kind, date and name", () => {
    expect(at(layout, "work:a")).toMatchObject({ x: 0 });
    const order = ["work:a", "work:b", "place:vilna"].map((id) => bearing(at(layout, id)));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("keeps the exhibitions of one institution side by side, so its links fan out", () => {
    const ring = ["exhibition:1", "exhibition:2", "exhibition:3", "exhibition:4"].sort(
      (a, b) => bearing(at(layout, a)) - bearing(at(layout, b)),
    );
    const venue = (id: string) => (id === "exhibition:1" || id === "exhibition:3" ? "mac" : "pina");
    // Going round the ring, the venue changes only twice: once into each group.
    const changes = ring.filter((id, index) => venue(id) !== venue(ring[(index + 1) % ring.length] as string));
    expect(changes).toHaveLength(2);
  });

  it("writes labels away from the middle and frames every node with room for them", () => {
    const [minX, minY, width, height] = layout.viewBox;
    for (const item of layout.nodes) {
      if (item.id !== center) expect(item.side).toBe(item.x < 0 ? "left" : "right");
      expect(item.x).toBeGreaterThan(minX);
      expect(item.x).toBeLessThan(minX + width);
      expect(item.y).toBeGreaterThan(minY);
      expect(item.y).toBeLessThan(minY + height);
      expect(item.room).toBeGreaterThan(0);
    }
    expect(at(layout, center).room).toBe(width);
  });

  it("gives the same picture every time, in coordinates rounded to a hundredth", () => {
    expect(radialLayout(graph, center)).toEqual(layout);
    for (const item of layout.nodes) expect(Math.round(item.x * 100) / 100).toBe(item.x);
  });

  it("gives a ring of many nodes a larger radius", () => {
    const works = Array.from({ length: 60 }, (_, index) => node(`work:${index}`, "work"));
    const wide = radialLayout(
      { nodes: [node(center, "artist"), ...works], edges: works.map((work) => link(center, work.id, "created")) },
      center,
    );
    expect(wide.rings[0]).toBeGreaterThan(layout.rings[0] as number);
  });

  it("puts nodes the center can't reach on one more ring", () => {
    const loose = radialLayout(
      { nodes: [node(center, "artist"), node("work:a", "work"), node("place:x", "place")], edges: [link(center, "work:a", "created")] },
      center,
    );
    expect(loose.rings).toHaveLength(2);
    expect(distance(at(loose, "place:x"))).toBeCloseTo(loose.rings[1] as number, 1);
  });

  it("draws a lone artist as a single centered node, and an unknown center as one ring", () => {
    const lone = radialLayout({ nodes: [node(center, "artist")], edges: [] }, center);
    expect(lone.rings).toEqual([]);
    expect(lone.viewBox[2]).toBeGreaterThan(0);
    expect(radialLayout(graph, "artist:nobody").rings).toHaveLength(1);
  });
});

describe("columnsLayout", () => {
  // Two artists born in Vilna and Wien; Ana showed at the MAC (in São Paulo) and Bela straight in Rio.
  const graph: Graph = {
    nodes: [
      node("artist:bela", "artist", "Bela"),
      node("artist:ana", "artist", "Ana"),
      node("place:wien", "place", "Wien"),
      node("place:vilna", "place", "Vilna"),
      node("institution:mac", "institution", "MAC USP"),
      node("place:sp", "place", "São Paulo"),
      node("place:rio", "place", "Rio de Janeiro"),
    ],
    edges: [
      link("artist:ana", "place:wien", "born_in"),
      link("artist:bela", "place:vilna", "born_in"),
      link("artist:ana", "institution:mac", "exhibited_at"),
      link("institution:mac", "place:sp", "held_in"),
      link("artist:bela", "place:rio", "exhibited_at"),
    ],
  };
  const layout = columnsLayout(graph);

  it("reads left to right: birthplaces, artists, institutions and exhibition cities", () => {
    expect(layout.shape).toBe("columns");
    expect(layout.columns.map(({ key }) => key)).toEqual(["origin", "artist", "institution", "city"]);
    expect(at(layout, "place:wien")).toMatchObject({ x: 0, side: "left" });
    expect(at(layout, "artist:ana")).toMatchObject({ x: 300, side: "right" });
    expect(at(layout, "institution:mac")).toMatchObject({ x: 600, side: "right" });
    expect(at(layout, "place:sp")).toMatchObject({ x: 900, side: "right" });
    expect(at(layout, "place:rio").x).toBe(900);
    expect(layout.rings).toEqual([]);
  });

  it("orders rows so each artist sits level with their birthplace and venue", () => {
    expect(at(layout, "artist:bela").y).toBe(at(layout, "place:vilna").y);
    expect(at(layout, "artist:ana").y).toBe(at(layout, "place:wien").y);
    expect(at(layout, "place:sp").y).toBeCloseTo(Math.sign(at(layout, "artist:ana").y) * 14);
  });

  it("puts the headings above the rows and stops each label short of the next column", () => {
    expect(headingY(layout)).toBeLessThan(Math.min(...layout.nodes.map((item) => item.y)));
    expect(at(layout, "artist:ana").room).toBe(284);
    const [minX, , width] = layout.viewBox;
    expect(at(layout, "place:sp").room).toBe(minX + width - 900);
    expect(at(layout, "place:wien").room).toBe(-minX);
  });

  it("makes a place that is both a birthplace and a venue a city, and closes up empty columns", () => {
    const both = columnsLayout({
      nodes: [node("artist:ana", "artist"), node("place:sp", "place")],
      edges: [link("artist:ana", "place:sp", "born_in"), link("artist:ana", "place:sp", "exhibited_at")],
    });
    expect(both.columns).toEqual([
      { key: "artist", x: 0 },
      { key: "city", x: 300 },
    ]);
  });

  it("frames an empty graph", () => {
    const empty = columnsLayout({ nodes: [], edges: [] });
    expect(empty.columns).toEqual([]);
    expect(empty.viewBox.every(Number.isFinite)).toBe(true);
  });
});

describe("visibleLabels", () => {
  const placed = (id: string, x: number, y: number, extra: Partial<PositionedNode> = {}): PositionedNode => ({
    ...node(id, "institution", `Label ${id}`),
    x,
    y,
    side: "right",
    degree: 1,
    room: 1000,
    ...extra,
  });
  const options = { unit: 1, pinned: new Set<string>(), candidates: null, centerId: null };

  it("writes every label that has room, whole", () => {
    const labels = visibleLabels([placed("a", 0, 0), placed("b", 0, 100)], options);
    expect([...labels]).toEqual([
      ["a", { text: "Label a", shift: 0 }],
      ["b", { text: "Label b", shift: 0 }],
    ]);
  });

  it("leaves out the less important of two colliding labels: artists first, then the most linked", () => {
    const busy = placed("busy", 0, 2, { degree: 9 });
    expect([...visibleLabels([placed("quiet", 0, 0), busy], options).keys()]).toEqual(["busy"]);
    const artist = placed("artist", 0, 0, { kind: "artist" });
    expect([...visibleLabels([busy, artist], options).keys()]).toEqual(["artist"]);
  });

  it("leaves out a label that would run over another node", () => {
    expect(visibleLabels([placed("a", 0, 0), placed("b", 30, 0, { side: "left" })], options).has("a")).toBe(false);
  });

  it("cuts a label to its room, and skips it when too little is left", () => {
    const long = placed("long", 0, 0, { label: "Museu de Arte Contemporânea", room: 100 });
    expect(visibleLabels([long], options).get("long")?.text).toBe("Museu de Art…");
    expect(visibleLabels([placed("tight", 0, 0, { room: 40 })], options).size).toBe(0);
    // Zoomed out (more drawing units per pixel), the same room holds fewer characters.
    expect(visibleLabels([long], { ...options, unit: 2 }).size).toBe(0);
  });

  it("always writes pinned labels, sliding one down below another it would cover", () => {
    const labels = visibleLabels([placed("a", 0, 0, { room: 0 }), placed("b", 2, 2)], {
      ...options,
      pinned: new Set(["a", "b"]),
    });
    expect(labels.get("a")).toEqual({ text: "Label a", shift: 0 });
    expect(labels.get("b")?.shift).toBeCloseTo(12);
  });

  it("while something is selected, labels only the highlighted nodes and ignores the dimmed ones", () => {
    const labels = visibleLabels([placed("a", 0, 0), placed("dimmed", 30, 0, { side: "left" }), placed("c", 0, 100)], {
      ...options,
      candidates: new Set(["a", "c"]),
    });
    expect([...labels.keys()].sort()).toEqual(["a", "c"]);
  });

  it("writes labels on the left and below their node", () => {
    const labels = visibleLabels(
      [placed("left", 0, 0, { side: "left" }), placed("center", 500, 0, { side: "below" }), placed("under", 500, 20)],
      { ...options, centerId: "center", pinned: new Set(["center"]) },
    );
    expect(labels.has("left")).toBe(true);
    expect(labels.has("center")).toBe(true);
    // The center's label, below it, takes the room the next node's label wanted.
    expect(labels.has("under")).toBe(false);
  });

  it("keeps long pinned labels to the maximum length", () => {
    const label = "x".repeat(LABEL_MAX + 10);
    const labels = visibleLabels([placed("a", 0, 0, { label })], { ...options, pinned: new Set(["a"]) });
    expect(labels.get("a")?.text).toHaveLength(LABEL_MAX);
  });
});
