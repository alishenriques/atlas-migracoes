import type { ReactNode } from "react";

import { act, fireEvent, render, screen, within } from "@testing-library/react";
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
        <div
          data-testid="map"
          data-padding-left={padding?.left}
          data-padding-right={padding?.right}
          data-padding-bottom={padding?.bottom}
        >
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

function renderExplorar(blocks: { intro?: ReactNode; footer?: ReactNode } = {}) {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <Explorar artists={artists} {...blocks} />
    </NextIntlClientProvider>,
  );
}

describe("Explorar map popups", () => {
  it("groups the records of the clicked place by artist", () => {
    renderExplorar();
    const popup = within(screen.getByTestId("popup-sp"));
    expect(popup.getByText("Brasil")).toBeInTheDocument();
    expect(popup.getByText("São Paulo")).toBeInTheDocument();
    expect(popup.getByText("2 artistas · 2 registros")).toBeInTheDocument();

    const [first, second] = popup.getAllByRole("button").map((button) => button.closest("li"));
    expect(first).toHaveTextContent("Artista A");
    expect(within(first as HTMLElement).getByText("Morte")).toBeInTheDocument();
    expect(within(first as HTMLElement).getByText("1957")).toBeInTheDocument();
    expect(second).toHaveTextContent("Artista B");
    expect(within(second as HTMLElement).getByText("Exposição")).toBeInTheDocument();
    expect(within(second as HTMLElement).getByText("1940")).toBeInTheDocument();
    expect(screen.getByTestId("popup-nowhere")).toBeEmptyDOMElement();
  });

  it("opens an artist's trajectory in the panel from the popup", () => {
    renderExplorar();
    fireEvent.click(screen.getByRole("button", { name: "Ver a trajetória de Artista B no mapa" }));
    expect(screen.getByRole("heading", { name: "Artista B" })).toBeInTheDocument();
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
    expect(screen.getByTestId("map")).toHaveAttribute("data-padding-right", "0");
    matchMedia.mockRestore();
  });

  it("floats the intro and footer blocks over the map, leaving room for the footer on desktop", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(
      () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList,
    );
    renderExplorar({ intro: <p>Apresentação</p>, footer: <p>Acervo</p> });
    expect(screen.getByText("Apresentação")).toBeInTheDocument();
    expect(screen.getByText("Acervo")).toBeInTheDocument();
    expect(screen.getByTestId("map")).toHaveAttribute("data-padding-right", "0");
    expect(screen.getByTestId("map")).toHaveAttribute("data-padding-left", "360");
    expect(screen.getByTestId("map")).toHaveAttribute("data-padding-bottom", "152");
    matchMedia.mockRestore();
  });
});
