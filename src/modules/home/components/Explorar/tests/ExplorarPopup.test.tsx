import type { ReactNode } from "react";

import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { FuzzyDate, MapArtist, Place } from "@/lib/schemas";
import messages from "@/locales/pt.json";
import type { TrajectoryMapProps } from "@/shared/components/TrajectoryMap";

import { Explorar } from "../Explorar";

vi.mock("@/i18n/navigation", () => ({ Link: ({ children }: { children: ReactNode }) => <a>{children}</a> }));

// MapLibre needs WebGL; the stub renders the popups the map would open for two places.
vi.mock("next/dynamic", () => ({
  default: () =>
    function MapStub({ renderPlace, padding }: TrajectoryMapProps) {
      return (
        <div data-testid="map" data-padding-left={padding?.left}>
          {(["sp", "nowhere"] as const).map((id) => (
            <div key={id} data-testid={`popup-${id}`}>
              {renderPlace(id)}
            </div>
          ))}
        </div>
      );
    },
}));

const date = (year: number): FuzzyDate => ({ raw: null, year, endYear: year, iso: null, precision: "year" });
const place = (id: string, label: string, country: string): Place => ({
  id,
  label,
  country,
  currentName: null,
  lat: 1,
  lng: 1,
});
const saoPaulo = place("sp", "São Paulo", "Brasil");

const artists: MapArtist[] = [
  {
    slug: "a",
    name: "Artista A",
    birthPlace: place("vilna", "Vilna", "Lituânia"),
    birthDate: date(1889),
    deathPlace: saoPaulo,
    deathDate: date(1957),
    exhibitions: [],
  },
  {
    slug: "b",
    name: "Artista B",
    birthPlace: place("viena", "Viena", "Áustria"),
    birthDate: date(1900),
    deathPlace: null,
    deathDate: { raw: null, year: null, endYear: null, iso: null, precision: "unknown" },
    exhibitions: [{ id: "EX.1", title: "Salão", startDate: date(1940), place: saoPaulo }],
  },
];

function renderExplorar() {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <Explorar artists={artists} />
    </NextIntlClientProvider>,
  );
}

describe("Explorar map popups", () => {
  it("lists every visible artist who passed through the clicked place", () => {
    renderExplorar();
    const popup = screen.getByTestId("popup-sp");
    expect(popup).toHaveTextContent("São Paulo");
    expect(popup).toHaveTextContent("Artista A: Morte, 1957");
    expect(popup).toHaveTextContent("Artista B: Exposição, 1940");
    expect(screen.getByTestId("popup-nowhere")).toBeEmptyDOMElement();
  });

  it("leaves room for the floating panel on desktop only, following the viewport", () => {
    const listeners: (() => void)[] = [];
    let desktop = false;
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          get matches() {
            return desktop;
          },
          addEventListener: (_: string, listener: () => void) => listeners.push(listener),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    renderExplorar();
    expect(screen.getByTestId("map")).toHaveAttribute("data-padding-left", "0");

    desktop = true;
    act(() => listeners.forEach((listener) => listener()));
    expect(screen.getByTestId("map")).toHaveAttribute("data-padding-left", "360");
    matchMedia.mockRestore();
  });
});
