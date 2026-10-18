import type { ReactNode } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { States } from "@/lib/cartography";

import { HistoricalMap } from "../HistoricalMap";

// MapLibre needs WebGL, which jsdom lacks: the stubs record what the map is
// asked to draw and let the tests fire its events.
type MapProps = {
  children: ReactNode;
  mapStyle: { glyphs?: string };
  onClick: (event: unknown) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  cursor: string;
};
let mapProps: MapProps | undefined;
const sources: Record<string, unknown> = {};
const layers: Record<string, { paint?: Record<string, unknown> }> = {};

vi.mock("maplibre-gl", () => ({ setWorkerUrl: vi.fn() }));
vi.mock("react-map-gl/maplibre", () => ({
  default: function MapStub(props: MapProps) {
    mapProps = props;
    return <div data-testid="map">{props.children}</div>;
  },
  NavigationControl: () => null,
  Layer: (props: { id: string; paint?: Record<string, unknown> }) => {
    layers[props.id] = props;
    return null;
  },
  Source: ({ id, data, children }: { id: string; data: unknown; children: ReactNode }) => {
    sources[id] = data;
    return <>{children}</>;
  },
  Popup: ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
    <div role="dialog">
      {children}
      <button onClick={onClose}>fechar</button>
    </div>
  ),
}));

const states: States = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Poland", start: "1922-03-24", end: "1939-09-28" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [20, 50],
            [30, 50],
            [30, 60],
            [20, 50],
          ],
        ],
      },
    },
  ],
};

beforeEach(() => {
  mapProps = undefined;
});

function renderMap() {
  return render(
    <HistoricalMap
      states={states}
      birthplaces={[{ placeId: "vilna", lng: 25.3, lat: 54.7, artists: 2 }]}
      label="Mapa da Europa"
      renderPlace={(placeId) => <p>Lugar {placeId}</p>}
      renderState={(name) => <p>Estado {name}</p>}
    />,
  );
}

const click = (layer: string, properties: Record<string, string>) =>
  act(() => mapProps?.onClick({ features: [{ layer: { id: layer }, properties }], lngLat: { lng: 25, lat: 54 } }));

describe("HistoricalMap", () => {
  it("draws the states in force with their names and the birthplaces on top", () => {
    renderMap();
    expect(screen.getByRole("region", { name: "Mapa da Europa" })).toBeInTheDocument();
    expect(mapProps?.mapStyle.glyphs).toContain("openfreemap");
    expect(sources.states).toBe(states);
    expect(sources["state-labels"]).toMatchObject({ features: [{ properties: { name: "Poland" } }] });
    expect(Object.keys(layers)).toEqual(expect.arrayContaining(["states-fill", "states-line", "states-label", "birthplaces"]));
    expect(sources.birthplaces).toMatchObject({
      features: [{ geometry: { type: "Point", coordinates: [25.3, 54.7] }, properties: { placeId: "vilna", artists: 2 } }],
    });
  });

  it("opens a birthplace before the state under it, and closes it", () => {
    renderMap();
    act(() =>
      mapProps?.onClick({
        features: [
          { layer: { id: "states-fill" }, properties: { name: "Poland" } },
          { layer: { id: "birthplaces" }, properties: { placeId: "vilna" } },
        ],
        lngLat: { lng: 25.3, lat: 54.7 },
      }),
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Lugar vilna");
    fireEvent.click(screen.getByRole("button", { name: "fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a clicked state and highlights it", () => {
    renderMap();
    click("states-fill", { name: "Poland" });
    expect(screen.getByRole("dialog")).toHaveTextContent("Estado Poland");
    expect(JSON.stringify(layers["states-fill"]?.paint)).toContain("Poland");
  });

  it("closes the popup on a click outside states and places", () => {
    renderMap();
    click("states-fill", { name: "Poland" });
    act(() => mapProps?.onClick({ features: [], lngLat: { lng: -30, lat: 40 } }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a pointer while hovering", () => {
    renderMap();
    expect(mapProps?.cursor).toBe("grab");
    act(() => mapProps?.onMouseEnter());
    expect(mapProps?.cursor).toBe("pointer");
    act(() => mapProps?.onMouseLeave());
    expect(mapProps?.cursor).toBe("grab");
  });
});
