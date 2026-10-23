import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { States } from "@/lib/cartography";
import type { FuzzyDate, MapArtist, Place } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { HistoricalExplorer } from "../HistoricalExplorer";

import type { HistoricalMapProps } from "../../HistoricalMap";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: { params: { slug: string } } }) => (
    <a href={`/trajetorias/${href.params.slug}`} {...props}>
      {children}
    </a>
  ),
}));

// MapLibre needs WebGL; the stub shows the states in force and renders both popups.
vi.mock("next/dynamic", () => ({
  default: () =>
    function MapStub({ states, birthplaces, label, renderPlace, renderState }: HistoricalMapProps) {
      return (
        <div role="region" aria-label={label}>
          <p data-testid="states">{states.features.map((f) => f.properties.name).join(",")}</p>
          <div data-testid="place-popup">{birthplaces[0] && renderPlace(birthplaces[0].placeId)}</div>
          <div data-testid="state-popup">{renderState("Polônia")}</div>
          <div data-testid="empty-popup">{renderPlace("nowhere")}</div>
        </div>
      );
    },
}));

const year = (y: number | null, precision: FuzzyDate["precision"] = "year"): FuzzyDate => ({
  raw: null,
  year: y,
  endYear: y,
  iso: null,
  precision: y === null ? "unknown" : precision,
});

const place = (id: string, label: string, lng: number | null, lat: number | null): Place => ({
  id,
  label,
  country: "X",
  currentName: null,
  lat,
  lng,
});

const vilna = place("vilna", "Vilna", 25.3, 54.7);

const artist = (slug: string, name: string, birthDate: FuzzyDate, birthPlace: Place | null = vilna): MapArtist => ({
  slug,
  name,
  birthPlace,
  birthDate,
  deathPlace: null,
  deathDate: year(1957),
  exhibitions: [],
});

const artists = [
  artist("lasar-segall", "Lasar Segall", year(1889)),
  artist("born-1939", "Nascida em 1939", year(1939)),
  artist("circa", "Circa", year(1930, "circa")),
  artist("sem-data", "Sem data", year(null)),
  artist("sem-lugar", "Sem lugar", year(1900), place("x", "X", null, null)),
];

const square: [number, number][][] = [
  [
    [20, 50],
    [30, 50],
    [30, 60],
    [20, 60],
    [20, 50],
  ],
];
const states: States = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Russia (Soviet Union)", start: "1886-01-01", end: "1917-12-31" }, geometry: { type: "Polygon", coordinates: square } },
    { type: "Feature", properties: { name: "Poland", start: "1922-03-24", end: "1939-09-28" }, geometry: { type: "Polygon", coordinates: square } },
  ],
};

const respond = (body: unknown, ok = true) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) } as Response);

const renderExplorer = () =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <HistoricalExplorer artists={artists} />
    </NextIntlClientProvider>,
  );

afterEach(() => vi.restoreAllMocks());

describe("HistoricalExplorer", () => {
  it("shows a loading message until the borders arrive", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
    renderExplorer();
    expect(screen.getByText("Carregando as fronteiras…")).toBeInTheDocument();
  });

  it("reads each birthplace in the state of the artist's birth and of the year shown", async () => {
    respond(states);
    renderExplorer();
    expect(await screen.findByRole("region", { name: "Mapa da Europa com as fronteiras de 1925" })).toBeInTheDocument();
    expect(screen.getByTestId("states")).toHaveTextContent("Polônia");
    expect(screen.getByRole("heading", { name: "Fronteiras de 1925" })).toBeInTheDocument();

    const segall = screen.getByRole("link", { name: "Lasar Segall" }).closest("li");
    expect(segall).toHaveTextContent("Nasceu em Vilna, 1889");
    expect(segall).toHaveTextContent("No nascimento: Império Russo");
    expect(segall).toHaveTextContent("Em 1925: Polônia");

    const origin = (name: string) => screen.getByRole("link", { name }).closest("li");
    expect(origin("Nascida em 1939")).toHaveTextContent("Polônia ou nenhum Estado na base");
    expect(origin("Circa")).toHaveTextContent("Polônia (data aproximada)");
    expect(origin("Sem data")).toHaveTextContent("não determinado");
    expect(screen.queryByRole("link", { name: "Sem lugar" })).not.toBeInTheDocument();
  });

  it("lists who was born in a clicked place or state", async () => {
    respond(states);
    renderExplorer();
    const placePopup = await screen.findByTestId("place-popup");
    expect(within(placePopup).getByText("Vilna")).toBeInTheDocument();
    expect(within(placePopup).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByTestId("state-popup")).toHaveTextContent("4 artistas nasceram em lugares que em 1925 pertenciam");
    expect(screen.getByTestId("empty-popup")).toBeEmptyDOMElement();
  });

  it("switches decade, then year, and redraws the borders", async () => {
    respond(states);
    renderExplorer();
    await screen.findByRole("region");
    fireEvent.click(screen.getByRole("radio", { name: "1910" }));
    expect(screen.getByRole("combobox", { name: "Ano" })).toHaveValue("1915");
    expect(screen.getByTestId("states")).toHaveTextContent("Império Russo");
    expect(screen.getByTestId("state-popup")).toHaveTextContent("Nenhum artista nasceu");

    fireEvent.change(screen.getByRole("combobox", { name: "Ano" }), { target: { value: "1919" } });
    expect(screen.getByTestId("states")).toBeEmptyDOMElement();
    expect(screen.getByRole("link", { name: "Lasar Segall" }).closest("li")).toHaveTextContent(
      "Em 1919: nenhum Estado na base",
    );
  });

  it("says so when the borders file cannot be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    respond({}, false);
    renderExplorer();
    expect(await screen.findByText("Não foi possível carregar as fronteiras históricas agora.")).toBeInTheDocument();
  });

  it("rejects a borders file that does not match the schema", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    respond({ type: "FeatureCollection", features: [{ type: "Feature" }] });
    renderExplorer();
    expect(await screen.findByText("Não foi possível carregar as fronteiras históricas agora.")).toBeInTheDocument();
  });
});
