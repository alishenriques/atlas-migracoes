import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { ArtistRecord as Record, ArtistRecordResponse, FuzzyDate, Place } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { ArtistRecord } from "../ArtistRecord";
import { TrajectoryIndex } from "../TrajectoryIndex";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getLocale: async () => "pt",
    getTranslations: async (namespace: "TRAJECTORIES" | "TRAJECTORY") =>
      createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string | { params: { slug: string } } | { pathname: string; query: { [key: string]: string } };
  }) => (
    <a
      href={
        typeof href === "string"
          ? href
          : "params" in href
            ? `/trajetorias/${href.params.slug}`
            : `${href.pathname}?${new URLSearchParams(href.query).toString()}`
      }
      {...props}
    >
      {children}
    </a>
  ),
}));

// MapLibre needs WebGL; the map has its own tests.
vi.mock("../components/RecordMap", () => ({
  RecordMap: ({ label }: { label: string }) => <div role="region" aria-label={label} />,
}));

const date = (year: number | null, precision: FuzzyDate["precision"] = "year"): FuzzyDate => ({
  raw: year === null ? null : String(year),
  year,
  endYear: year,
  iso: null,
  precision: year === null ? "unknown" : precision,
});
const place = (id: string, label: string, currentName: string | null = null): Place => ({
  id,
  label,
  country: "Polônia",
  currentName,
  lat: 1,
  lng: 1,
});

const artist: Record = {
  slug: "lasar-segall",
  name: "Lasar Segall",
  birthPlace: place("vilna", "Vilna", "Vilnius, Lituânia"),
  birthDate: date(1889),
  deathPlace: place("sp", "São Paulo"),
  deathDate: date(1957),
  exhibitions: [
    {
      id: "EX.1",
      title: "Bienal de São Paulo",
      startDate: date(1951),
      endDate: date(1951),
      institution: "MAM",
      venue: null,
      place: place("sp", "São Paulo"),
    },
  ],
  works: [
    {
      id: "1963.1.1",
      title: "Paisagem",
      date: date(1930, "circa"),
      technique: "óleo sobre tela",
      dimensions: null,
      acquisition: "Doação",
      acquisitionDate: date(null),
    },
  ],
  publications: [],
};

async function renderRecord(data: ArtistRecordResponse) {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {await ArtistRecord({ data })}
    </NextIntlClientProvider>,
  );
}

describe("ArtistRecord", () => {
  it("shows the artist's life, map, works, exhibitions and sources", async () => {
    await renderRecord({ meta: { source: "database" }, artist });

    expect(screen.getByRole("heading", { level: 1, name: "Lasar Segall" })).toBeInTheDocument();
    expect(screen.getByText("Vilna (Vilnius, Lituânia), 1889")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Mapa da trajetória de Lasar Segall" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver na Rede Relacional" })).toHaveAttribute("href", "/rede?artista=lasar-segall");
    expect(screen.getByRole("link", { name: "Pesquisar em fontes abertas" })).toHaveAttribute(
      "href",
      "/ia-relacional?artista=lasar-segall",
    );

    const works = screen.getByRole("region", { name: "1 obra" });
    expect(within(works).getByText("Paisagem")).toBeInTheDocument();
    expect(within(works).getByText("c. 1930 · óleo sobre tela")).toBeInTheDocument();
    expect(within(works).getByText("Tombo 1963.1.1 · Doação")).toBeInTheDocument();

    const exhibitions = screen.getByRole("region", { name: "1 exposição" });
    expect(within(exhibitions).getByText("1951 · MAM · São Paulo")).toBeInTheDocument();

    expect(within(screen.getByRole("region", { name: "Publicações" })).getByText("Nenhum registro no acervo.")).toBeInTheDocument();
    expect(screen.getByText("Trajetória traçada pela plataforma a partir desses registros; não é um percurso documentado.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("flags demo data", async () => {
    await renderRecord({ meta: { source: "demo" }, artist });
    expect(screen.getByRole("status")).toHaveTextContent("Dados de demonstração");
  });

  it("sends an unknown artist to the 404", async () => {
    await expect(ArtistRecord({ data: { meta: { source: "database" }, artist: null } })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("TrajectoryIndex", () => {
  it("links every artist to their record", async () => {
    render(await TrajectoryIndex({ data: { artists: [artist] } }));
    expect(screen.getByRole("link", { name: /Lasar Segall/ })).toHaveAttribute("href", "/trajetorias/lasar-segall");
    expect(screen.getByText("Polônia · 1889–1957")).toBeInTheDocument();
  });

  it("marks that there is no photo of the artist yet", async () => {
    render(await TrajectoryIndex({ data: { artists: [artist] } }));
    expect(screen.getByRole("img", { name: "Ainda sem foto" })).toHaveAttribute("data-empty", "true");
  });

  it("still renders when the artists cannot be loaded", async () => {
    render(await TrajectoryIndex({ data: null }));
    expect(screen.getByText("Não foi possível carregar os artistas agora.")).toBeInTheDocument();
  });
});
