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
    function MapStub({ states, birthplaces, label, renderPlace, renderState, padding }: HistoricalMapProps) {
      return (
        <div role="region" aria-label={label} data-padding-left={padding?.left}>
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

const factsFile = {
  meta: { generatedAt: "2026-10-30T00:00:00Z", fromYear: 1910, toYear: 1989 },
  facts: [
    {
      id: "Q1",
      start: { iso: "1925-12-01", precision: "day" },
      end: null,
      weight: 30,
      pt: { title: "Tratado de Locarno", text: "Acordos assinados em Londres.", url: "https://pt.wikipedia.org/wiki/Tratados_de_Locarno" },
      en: null,
    },
  ],
};

// The borders answer `body`; the historical facts file always loads.
const respond = (body: unknown, ok = true) =>
  vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
    Promise.resolve(
      (String(input).includes("/historical/")
        ? { ok: true, status: 200, json: () => Promise.resolve(factsFile) }
        : { ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) }) as Response,
    ),
  );

const renderExplorer = (props: { intro?: React.ReactNode; credit?: React.ReactNode } = {}) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <HistoricalExplorer artists={artists} {...props} />
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

  it("shows the year's historical facts and keeps the borders' note behind the info button", async () => {
    respond(states);
    renderExplorer();
    expect(await screen.findByRole("link", { name: "Tratado de Locarno" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Fatos históricos" })).toHaveTextContent("Inferido");
    const about = screen.getByRole("button", { name: /Sobre as fronteiras/ });
    expect(about).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(about);
    expect(about).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/segundo a CShapes 2.0/)).toBeInTheDocument();
  });

  it("floats the presentation over the controls and leaves the map's opening view clear of them", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList,
    );
    respond(states);
    renderExplorer({ intro: <h1>Camada Histórica</h1>, credit: <p>Fronteiras: CShapes 2.0</p> });
    expect(await screen.findByRole("region", { name: /Mapa da Europa/ })).toHaveAttribute("data-padding-left", "360");
    expect(screen.getByRole("heading", { level: 1, name: "Camada Histórica" })).toBeInTheDocument();
    expect(screen.getByText("Fronteiras: CShapes 2.0")).toBeInTheDocument();
  });

  it("stacks the blocks under the map on mobile, with no room left for them", async () => {
    respond(states);
    renderExplorer();
    expect(await screen.findByRole("region", { name: /Mapa da Europa/ })).not.toHaveAttribute("data-padding-left");
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
    await screen.findByRole("region", { name: /Mapa da Europa/ });
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
