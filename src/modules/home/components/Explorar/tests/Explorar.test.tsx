import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { FuzzyDate, MapArtist, Place } from "@/lib/schemas";
import messages from "@/locales/pt.json";
import type { TrajectoryMapProps } from "@/shared/components/TrajectoryMap";

import { Explorar } from "../Explorar";


vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: { params: { slug: string } } }) => (
    <a href={`/trajetorias/${href.params.slug}`} {...props}>
      {children}
    </a>
  ),
}));

// MapLibre needs WebGL; the stub exposes what the map would draw.
vi.mock("next/dynamic", () => ({
  default: () =>
    function MapStub({ trajectories, selectedSlug, label }: TrajectoryMapProps) {
      return (
        <div role="region" aria-label={label} data-selected={selectedSlug ?? ""}>
          {trajectories.map((t) => t.artist.slug).join(",")}
        </div>
      );
    },
}));

const date = (year: number | null, precision: FuzzyDate["precision"] = "year"): FuzzyDate => ({
  raw: null,
  year,
  endYear: year,
  iso: null,
  precision: year === null ? "unknown" : precision,
});

const place = (id: string, label: string, country: string, currentName: string | null = null): Place => ({
  id,
  label,
  country,
  currentName,
  lat: 1,
  lng: 1,
});

const saoPaulo = place("sp", "São Paulo", "Brasil");

const artists: MapArtist[] = [
  {
    slug: "lasar-segall",
    name: "Lasar Segall",
    birthPlace: place("vilna", "Vilna", "Lituânia", "Vilnius, Lituânia"),
    birthDate: date(1889),
    deathPlace: saoPaulo,
    deathDate: date(1957),
    exhibitions: [
      { id: "EX.1", title: "Mostra de 1943", startDate: date(1943, "circa"), place: place("rio", "Rio de Janeiro", "Brasil") },
      { id: "EX.2", title: "Retrospectiva", startDate: date(1967), place: saoPaulo },
    ],
  },
  {
    slug: "mira-schendel",
    name: "Mira Schendel",
    birthPlace: place("zurique", "Zurique", "Suíça"),
    birthDate: date(1919),
    deathPlace: saoPaulo,
    deathDate: date(1988),
    exhibitions: [],
  },
];

function renderExplorar() {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <Explorar artists={artists} />
    </NextIntlClientProvider>,
  );
  return screen.getByRole("region", { name: "Mapa das trajetórias dos artistas" });
}

describe("Explorar", () => {
  it("lists every artist and draws them all on the map", () => {
    const map = renderExplorar();
    expect(screen.getByText("2 artistas")).toBeInTheDocument();
    expect(map).toHaveTextContent("lasar-segall,mira-schendel");
  });

  it("explains the two kinds of line", () => {
    renderExplorar();
    const legend = screen.getByRole("group", { name: "Legenda" });
    expect(legend).toHaveTextContent("Da origem ao Brasil");
    expect(legend).toHaveTextContent("Demais registros, em ordem de data");
  });

  it("filters by country of origin", () => {
    const map = renderExplorar();
    fireEvent.click(screen.getByRole("combobox", { name: "País de origem" }));
    fireEvent.click(screen.getByRole("option", { name: "Suíça" }));
    expect(screen.getByText("1 artista")).toBeInTheDocument();
    expect(map).toHaveTextContent("mira-schendel");
    expect(map).not.toHaveTextContent("lasar-segall");
  });

  it("shows the flag of each known country of origin, in the list and in the filter", () => {
    renderExplorar();
    expect(screen.getByRole("button", { name: /Lasar Segall/ }).querySelector('[data-country="Lituânia"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: /Mira Schendel/ }).querySelector("svg")).toBeNull();
    fireEvent.click(screen.getByRole("combobox", { name: "País de origem" }));
    expect(screen.getByRole("option", { name: "Lituânia" }).querySelector("[data-country]")).not.toBeNull();
  });

  it("filters by period and can be cleared", () => {
    const map = renderExplorar();
    fireEvent.change(screen.getByRole("slider", { name: "Ano inicial" }), { target: { value: "1960" } });
    expect(map).toHaveTextContent("mira-schendel");
    expect(map).not.toHaveTextContent("lasar-segall");
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(screen.getByText("2 artistas")).toBeInTheDocument();
  });

  it("opens an artist's trajectory with dates as exact as the source", () => {
    const map = renderExplorar();
    fireEvent.click(screen.getByRole("button", { name: /Lasar Segall/ }));
    expect(map).toHaveAttribute("data-selected", "lasar-segall");
    expect(screen.getByRole("heading", { level: 2, name: "Lasar Segall" })).toBeInTheDocument();
    expect(screen.getByText("Trajetória inferida")).toBeInTheDocument();

    const stops = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(stops.map((stop) => stop.textContent)).toEqual([
      "Nascimento · 1889Vilna (Vilnius, Lituânia)",
      "Exposição · c. 1943Rio de JaneiroMostra de 1943",
      "Falecimento · 1957São Paulo",
    ]);
    expect(screen.getByText("1 exposição póstuma fica fora do traçado.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir a ficha" })).toHaveAttribute("href", "/trajetorias/lasar-segall");

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText("2 artistas")).toBeInTheDocument();
  });
});
