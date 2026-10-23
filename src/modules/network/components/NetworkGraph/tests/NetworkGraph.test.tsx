import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NetworkNode } from "@/lib/network";
import type { Layout, PositionedNode } from "@/lib/networkLayout";

import { NetworkGraph, zoomView } from "../NetworkGraph";

const node = (
  id: string,
  kind: NetworkNode["kind"],
  label: string,
  x: number,
  y: number,
  side: PositionedNode["side"] = "right",
): PositionedNode => ({ id, kind, label, slug: null, date: null, x, y, side, degree: 1, room: 400 });

const radial: Layout = {
  shape: "radial",
  nodes: [
    node("artist:a", "artist", "Lasar Segall", 0, 0, "below"),
    node("institution:mac", "institution", "MAC USP", 100, 0),
    node("place:sp", "place", "São Paulo", 200, 0),
    node("work:w", "work", "Paisagem", 0, 100),
  ],
  edges: [
    { source: "artist:a", target: "institution:mac", kind: "exhibited_at", weight: 4 },
    { source: "institution:mac", target: "place:sp", kind: "held_in", weight: 1 },
    { source: "artist:a", target: "work:w", kind: "created", weight: 1 },
    { source: "artist:a", target: "place:sp", kind: "born_in", weight: 1 },
    { source: "artist:a", target: "work:missing", kind: "created", weight: 1 },
  ],
  viewBox: [-100, -100, 400, 300],
  rings: [100, 200],
  columns: [],
};

const columns: Layout = {
  shape: "columns",
  nodes: [node("place:vilna", "place", "Vilna", 0, 0, "left"), node("artist:a", "artist", "Lasar Segall", 300, 0)],
  edges: [{ source: "artist:a", target: "place:vilna", kind: "born_in", weight: 1 }],
  viewBox: [-100, -80, 500, 160],
  rings: [],
  columns: [
    { key: "origin", x: 0 },
    { key: "artist", x: 300 },
  ],
};

const renderGraph = ({ layout = radial, selectedId = null as string | null, onSelect = vi.fn() } = {}) => {
  const props = {
    selectedId,
    centerId: "artist:a",
    onSelect,
    label: "Rede",
    kindLabel: (kind: string) => kind.toUpperCase(),
    columnLabel: (key: string) => `col ${key}`,
    zoomLabels: { in: "Aproximar", out: "Afastar", fit: "Ver tudo" },
  };
  const view = render(<NetworkGraph layout={layout} {...props} />);
  return { ...view, onSelect, rerenderWith: (next: Layout) => view.rerender(<NetworkGraph layout={next} {...props} />) };
};

const svg = () => screen.getByRole("group", { name: "Rede" });
const viewBox = () => svg().getAttribute("viewBox")?.split(" ").map(Number);

describe("zoomView", () => {
  const whole: Layout["viewBox"] = [0, 0, 800, 400];

  it("zooms around the middle or a given point", () => {
    expect(zoomView(whole, whole, 2)).toEqual([200, 100, 400, 200]);
    expect(zoomView(whole, whole, 2, [0, 0])).toEqual([0, 0, 400, 200]);
  });

  it("stops at eight times closer and never zooms out past the whole picture", () => {
    expect(zoomView(whole, whole, 100)[2]).toBe(100);
    expect(zoomView([200, 100, 400, 200], whole, 0.1)).toEqual(whole);
  });
});

describe("NetworkGraph", () => {
  it("draws every node as a named, focusable button and every link it can place", () => {
    const { container } = renderGraph();
    expect(svg()).toHaveAttribute("viewBox", "-100 -100 400 300");
    expect(screen.getAllByRole("button", { name: /:/ })).toHaveLength(4);
    expect(screen.getByRole("button", { name: "INSTITUTION: MAC USP" })).toHaveAttribute("tabindex", "0");
    const paths = [...container.querySelectorAll("path")];
    expect(paths).toHaveLength(4);
    expect(paths[0]?.getAttribute("d")).toBe("M0 0L100 0");
  });

  it("draws the rings of a radial network and dashes the links of birth and death", () => {
    const { container } = renderGraph();
    expect(container.querySelectorAll("circle[r='100'], circle[r='200']")).toHaveLength(2);
    const dashed = [...container.querySelectorAll("path")].filter((path) => path.getAttribute("stroke-dasharray"));
    expect(dashed.map((path) => path.getAttribute("d"))).toEqual(["M0 0L200 0"]);
  });

  it("heads the columns of the overview and links them with curves", () => {
    const { container } = renderGraph({ layout: columns });
    expect(screen.getByText("col origin")).toHaveAttribute("x", "0");
    expect(screen.getByText("col artist")).toHaveAttribute("x", "300");
    expect(container.querySelector("path")?.getAttribute("d")).toBe("M300 0C150 0 150 0 0 0");
    expect(screen.getByText("Vilna")).toHaveAttribute("text-anchor", "end");
  });

  it("labels what fits, the center below its node", () => {
    renderGraph();
    expect(screen.getByText("Lasar Segall")).toHaveAttribute("text-anchor", "middle");
    expect(screen.getByText("MAC USP")).toHaveAttribute("text-anchor", "start");
    expect(screen.getByText("Paisagem")).toBeInTheDocument();
  });

  it("labels and highlights the selected node's links, dimming the rest", () => {
    renderGraph({ selectedId: "institution:mac" });
    expect(screen.getByText("MAC USP")).toBeInTheDocument();
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
    expect(screen.queryByText("Paisagem")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "INSTITUTION: MAC USP" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "WORK: Paisagem" })).toHaveAttribute("opacity", "0.25");
  });

  it("shows a node's label on hover or focus", () => {
    renderGraph({ selectedId: "institution:mac" });
    const work = screen.getByRole("button", { name: "WORK: Paisagem" });
    fireEvent.pointerEnter(work);
    expect(screen.getByText("Paisagem")).toBeInTheDocument();
    fireEvent.pointerLeave(work);
    expect(screen.queryByText("Paisagem")).not.toBeInTheDocument();
    fireEvent.focus(work);
    expect(screen.getByText("Paisagem")).toBeInTheDocument();
    fireEvent.blur(work);
    expect(screen.queryByText("Paisagem")).not.toBeInTheDocument();
  });

  it("selects with a click, Enter or Space and clears with Escape or a click on the background", () => {
    const { onSelect } = renderGraph();
    const mac = screen.getByRole("button", { name: "INSTITUTION: MAC USP" });
    fireEvent.click(mac);
    fireEvent.keyDown(mac, { key: "Enter" });
    fireEvent.keyDown(mac, { key: " " });
    fireEvent.keyDown(mac, { key: "Escape" });
    fireEvent.keyDown(mac, { key: "a" });
    fireEvent.click(svg());
    expect(onSelect.mock.calls).toEqual([["institution:mac"], ["institution:mac"], ["institution:mac"], [null], [null]]);
  });

  describe("zoom and pan", () => {
    afterEach(() => vi.restoreAllMocks());

    it("zooms in and out with the buttons and goes back to the whole network", () => {
      renderGraph();
      const zoomOut = screen.getByRole("button", { name: "Afastar" });
      const fit = screen.getByRole("button", { name: "Ver tudo" });
      expect(zoomOut).toBeDisabled();
      expect(fit).toBeDisabled();
      expect(svg()).toHaveStyle({ touchAction: "pan-y" });

      fireEvent.click(screen.getByRole("button", { name: "Aproximar" }));
      expect(viewBox()?.[2]).toBeCloseTo(400 / 1.5);
      expect(svg()).toHaveStyle({ touchAction: "none" });
      fireEvent.click(screen.getByRole("button", { name: "Aproximar" }));
      fireEvent.click(zoomOut);
      expect(viewBox()?.[2]).toBeCloseTo(400 / 1.5);
      fireEvent.click(fit);
      expect(viewBox()).toEqual([-100, -100, 400, 300]);
    });

    it("zooms with the wheel towards the pointer", () => {
      renderGraph();
      fireEvent.wheel(svg(), { deltaY: -100, clientX: 0, clientY: 0 });
      // jsdom measures nothing, so the first zoom goes to the middle.
      expect(viewBox()?.[0]).toBeCloseTo(100 - 200 / 1.2);
      fireEvent.wheel(svg(), { deltaY: 100 });
      expect(viewBox()).toEqual([-100, -100, 400, 300]);

      vi.spyOn(svg(), "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 400, height: 300 } as DOMRect);
      fireEvent.wheel(svg(), { deltaY: -100, clientX: 0, clientY: 0 });
      // The top left corner stays where it was.
      expect(viewBox()?.slice(0, 2)).toEqual([-100, -100]);
    });

    it("pans by dragging, without selecting what the drag ends on", () => {
      const { onSelect } = renderGraph();
      fireEvent.click(screen.getByRole("button", { name: "Aproximar" }));
      const [x, y] = viewBox() as number[];
      const mac = screen.getByRole("button", { name: "INSTITUTION: MAC USP" });

      fireEvent.pointerMove(svg(), { clientX: 50, clientY: 50 });
      expect(viewBox()?.[0]).toBe(x);

      fireEvent.pointerDown(mac, { clientX: 100, clientY: 100 });
      fireEvent.pointerMove(svg(), { clientX: 102, clientY: 101 });
      expect(viewBox()?.[0]).toBe(x);
      fireEvent.pointerMove(svg(), { clientX: 90, clientY: 80 });
      expect(viewBox()?.[0]).toBeGreaterThan(x as number);
      expect(viewBox()?.[1]).toBeGreaterThan(y as number);
      fireEvent.pointerUp(svg());
      fireEvent.click(mac);
      expect(onSelect).not.toHaveBeenCalled();

      // A press that doesn't move is a click.
      fireEvent.pointerDown(mac, { clientX: 100, clientY: 100 });
      fireEvent.pointerUp(svg());
      fireEvent.click(mac);
      expect(onSelect).toHaveBeenCalledWith("institution:mac");

      // Leaving the graph ends a drag.
      fireEvent.pointerDown(svg(), { clientX: 0, clientY: 0 });
      fireEvent.pointerLeave(svg());
      const before = viewBox();
      fireEvent.pointerMove(svg(), { clientX: 60, clientY: 60 });
      expect(viewBox()).toEqual(before);
    });

    it("starts a new network from the whole picture", () => {
      const { rerenderWith } = renderGraph();
      fireEvent.click(screen.getByRole("button", { name: "Aproximar" }));
      rerenderWith(columns);
      expect(viewBox()).toEqual([-100, -80, 500, 160]);
    });
  });

  describe("sizes", () => {
    afterEach(() => vi.unstubAllGlobals());

    const stubObserver = (rect: { width: number; height: number } | undefined) => {
      const disconnect = vi.fn();
      vi.stubGlobal(
        "ResizeObserver",
        class {
          constructor(private callback: ResizeObserverCallback) {}
          observe() {
            this.callback(rect ? [{ contentRect: rect } as ResizeObserverEntry] : [], this as unknown as ResizeObserver);
          }
          disconnect = disconnect;
        },
      );
      return disconnect;
    };
    const fontSize = () => Number(screen.getByText("Lasar Segall").getAttribute("font-size"));

    it("keeps labels at a fixed on-screen size once the graph is measured", () => {
      renderGraph();
      const unmeasured = fontSize();
      vi.unstubAllGlobals();
      const disconnect = stubObserver({ width: 350, height: 350 });
      const { unmount } = renderGraph();
      expect(screen.getAllByText("Lasar Segall").map((text) => Number(text.getAttribute("font-size")))).toEqual([
        unmeasured,
        unmeasured * 2,
      ]);
      unmount();
      expect(disconnect).toHaveBeenCalled();
    });

    it("ignores an empty measurement", () => {
      stubObserver(undefined);
      renderGraph();
      expect(fontSize()).toBeCloseTo((11 * 400) / 700);
    });
  });
});
