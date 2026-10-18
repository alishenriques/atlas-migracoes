import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Layout, NetworkNode } from "@/lib/network";

import { NetworkGraph } from "../NetworkGraph";

const node = (id: string, kind: NetworkNode["kind"], label: string, x: number, y: number) => ({
  id,
  kind,
  label,
  slug: null,
  date: null,
  x,
  y,
});

const layout: Layout = {
  nodes: [
    node("artist:a", "artist", "Lasar Segall", 0, 0),
    node("institution:mac", "institution", "MAC USP", 50, 0),
    node("place:sp", "place", "São Paulo", 100, 0),
    node("work:w", "work", "Paisagem", 0, 50),
  ],
  edges: [
    { source: "artist:a", target: "institution:mac", kind: "exhibited_at", weight: 4 },
    { source: "institution:mac", target: "place:sp", kind: "held_in", weight: 1 },
    { source: "artist:a", target: "work:w", kind: "created", weight: 1 },
    { source: "artist:a", target: "work:missing", kind: "created", weight: 1 },
  ],
  viewBox: [-40, -40, 180, 130],
};

const renderGraph = (selectedId: string | null = null, onSelect = vi.fn()) => {
  const view = render(
    <NetworkGraph
      layout={layout}
      selectedId={selectedId}
      centerId="artist:a"
      onSelect={onSelect}
      label="Rede"
      kindLabel={(kind) => kind.toUpperCase()}
    />,
  );
  return { ...view, onSelect };
};

describe("NetworkGraph", () => {
  it("draws every node as a named, focusable button and every link it can place", () => {
    const { container } = renderGraph();
    expect(screen.getByRole("group", { name: "Rede" })).toHaveAttribute("viewBox", "-40 -40 180 130");
    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "INSTITUTION: MAC USP" })).toHaveAttribute("tabindex", "0");
    expect(container.querySelectorAll("line")).toHaveLength(3);
  });

  it("labels artists only until something is selected", () => {
    renderGraph();
    expect(screen.getByText("Lasar Segall")).toBeInTheDocument();
    expect(screen.queryByText("MAC USP")).not.toBeInTheDocument();
  });

  it("labels and highlights the selected node's links, dimming the rest", () => {
    renderGraph("institution:mac");
    expect(screen.getByText("MAC USP")).toBeInTheDocument();
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
    expect(screen.queryByText("Paisagem")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "INSTITUTION: MAC USP" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "WORK: Paisagem" })).toHaveAttribute("opacity", "0.25");
  });

  it("selects with a click, Enter or Space and clears with Escape or a click on the background", () => {
    const { onSelect } = renderGraph();
    const mac = screen.getByRole("button", { name: "INSTITUTION: MAC USP" });
    fireEvent.click(mac);
    fireEvent.keyDown(mac, { key: "Enter" });
    fireEvent.keyDown(mac, { key: " " });
    fireEvent.keyDown(mac, { key: "Escape" });
    fireEvent.keyDown(mac, { key: "a" });
    fireEvent.click(screen.getByRole("group", { name: "Rede" }));
    expect(onSelect.mock.calls).toEqual([["institution:mac"], ["institution:mac"], ["institution:mac"], [null], [null]]);
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
      expect(fontSize()).toBeCloseTo((11 * 180) / 700);
    });
  });
});
