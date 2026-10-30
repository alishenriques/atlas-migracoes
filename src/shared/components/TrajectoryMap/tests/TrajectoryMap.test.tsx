import type { ReactNode, Ref } from "react";
import { useImperativeHandle } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FuzzyDate } from "@/lib/schemas";
import { buildTrajectory, type VisibleTrajectory } from "@/lib/trajectory";

import { TrajectoryMap } from "../TrajectoryMap";

// MapLibre needs WebGL, which jsdom lacks: the stubs below record what the map
// is asked to draw and let the tests fire its events.
const fitBounds = vi.fn();
type MapProps = {
  ref: Ref<unknown>;
  children: ReactNode;
  onClick: (event: unknown) => void;
  onLoad: () => void;
  initialViewState: unknown;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  cursor: string;
  scrollZoom: boolean;
};
let mapProps: MapProps | undefined;
const sources: Record<string, unknown> = {};

vi.mock("maplibre-gl", () => ({ setWorkerUrl: vi.fn() }));
vi.mock("react-map-gl/maplibre", () => ({
  default: function MapStub(props: MapProps) {
    mapProps = props;
    useImperativeHandle(props.ref, () => ({ fitBounds }));
    return <div data-testid="map">{props.children}</div>;
  },
  NavigationControl: () => null,
  Layer: () => null,
  Source: ({ id, data }: { id: string; data: unknown }) => {
    sources[id] = data;
    return null;
  },
  Popup: ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
    <div role="dialog">
      {children}
      <button onClick={onClose}>fechar</button>
    </div>
  ),
}));

const year = (value: number): FuzzyDate => ({ raw: null, year: value, endYear: value, iso: null, precision: "year" });
const place = (id: string, lat: number, lng: number) => ({ id, label: id, country: "Brasil", currentName: null, lat, lng });

const trajectoryOf = (slug: string, birth: ReturnType<typeof place>, brazil: ReturnType<typeof place>): VisibleTrajectory => {
  const trajectory = buildTrajectory({
    slug,
    name: slug,
    birthPlace: { ...birth, country: "Polônia" },
    birthDate: year(1890),
    deathPlace: brazil,
    deathDate: year(1950),
    exhibitions: [],
  });
  return { ...trajectory, visible: trajectory.stops };
};

const trajectories = [
  trajectoryOf("segall", place("vilna", 54.7, 25.3), place("sp", -23.5, -46.6)),
  trajectoryOf("other", place("viena", 48.2, 16.4), place("rio", -22.9, -43.2)),
];

beforeEach(() => {
  fitBounds.mockReset();
  mapProps = undefined;
});

function renderMap(selectedSlug: string | null = null) {
  return render(
    <TrajectoryMap
      trajectories={trajectories}
      selectedSlug={selectedSlug}
      label="Mapa das trajetórias"
      renderPlace={(placeId) => <p>Lugar {placeId}</p>}
    />,
  );
}

describe("TrajectoryMap", () => {
  it("draws one line per artist and one point per place", () => {
    renderMap();

    expect(screen.getByRole("region", { name: "Mapa das trajetórias" })).toBeInTheDocument();
    expect(sources.legs).toMatchObject({ features: [{ properties: { slug: "segall" } }, { properties: { slug: "other" } }] });
    expect(sources.places).toMatchObject({ features: expect.arrayContaining([expect.anything()]) });
    expect((sources.places as { features: unknown[] }).features).toHaveLength(4);
  });

  it("fits the selected artist's trajectory in view", () => {
    renderMap("segall");

    expect(fitBounds).toHaveBeenCalledWith(
      [
        [-46.6, -23.5],
        [25.3, 54.7],
      ],
      expect.objectContaining({ maxZoom: 5, duration: 1200 }),
    );
  });

  it("jumps instead of flying when the reader prefers reduced motion", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    renderMap("segall");
    expect(fitBounds).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: 0 }));
    matchMedia.mockRestore();
  });

  it("opens on the origins and Brazil, fitted into the space the panels leave", () => {
    const padding = { top: 0, right: 0, bottom: 152, left: 360 };
    render(<TrajectoryMap trajectories={[]} selectedSlug={null} label="Mapa" renderPlace={() => null} padding={padding} />);
    expect(mapProps?.initialViewState).toEqual({
      bounds: [
        [-100, -35],
        [71, 58],
      ],
      fitBoundsOptions: { padding },
    });
  });

  it("zooms with the mouse wheel unless told not to", () => {
    renderMap();
    expect(mapProps?.scrollZoom).toBe(true);
    render(<TrajectoryMap trajectories={trajectories} selectedSlug={null} label="Mapa" renderPlace={() => null} scrollZoom={false} />);
    expect(mapProps?.scrollZoom).toBe(false);
  });

  it("does not move the map when nothing is selected", () => {
    renderMap();
    act(() => mapProps?.onLoad());
    expect(fitBounds).not.toHaveBeenCalled();
  });

  it("opens the clicked place's popup and closes it", () => {
    renderMap();

    act(() => mapProps?.onClick({ features: [{ properties: { placeId: "sp" } }], lngLat: { lng: -46.6, lat: -23.5 } }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Lugar sp");

    fireEvent.click(screen.getByRole("button", { name: "fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ignores a click outside the places", () => {
    renderMap();
    act(() => mapProps?.onClick({ features: [], lngLat: { lng: 0, lat: 0 } }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a pointer while hovering a place", () => {
    renderMap();
    expect(mapProps?.cursor).toBe("grab");
    act(() => mapProps?.onMouseEnter());
    expect(mapProps?.cursor).toBe("pointer");
    act(() => mapProps?.onMouseLeave());
    expect(mapProps?.cursor).toBe("grab");
  });
});
