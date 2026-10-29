import { fireEvent, render, screen, within } from "@testing-library/react";
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
  photo: null,
};

async function renderRecord(data: ArtistRecordResponse) {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {await ArtistRecord({ data })}
    </NextIntlClientProvider>,
  );
}

describe("ArtistRecord", () => {
  it("shows the artist beside the map, with the links as buttons", async () => {
    await renderRecord({ meta: { source: "database" }, artist });

    expect(screen.getByRole("heading", { level: 1, name: "Lasar Segall" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ainda sem foto" })).toBeInTheDocument();
    expect(screen.getByText("Vilna (Vilnius, Lituânia), 1889")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Mapa da trajetória de Lasar Segall" })).toBeInTheDocument();
    const network = screen.getByRole("link", { name: "Ver na Rede Relacional" });
    expect(network).toHaveAttribute("href", "/rede?artista=lasar-segall");
    expect(network).toHaveAttribute("data-variant", "primary");
    expect(screen.getByRole("link", { name: "Pesquisar em fontes abertas" })).toHaveAttribute(
      "href",
      "/ia-relacional?artista=lasar-segall",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the artist's photo with its credit", async () => {
    await renderRecord({
      meta: { source: "database" },
      artist: { ...artist, photo: { url: "https://api.example/photos/lasar-segall?v=1", credit: "Acervo da família" } },
    });
    expect(screen.getByRole("img", { name: "Lasar Segall" })).toHaveAttribute(
      "src",
      "https://api.example/photos/lasar-segall?v=1",
    );
    expect(screen.getByText("Foto: Acervo da família")).toBeInTheDocument();
  });

  it("folds each section to its title, count and source status", async () => {
    await renderRecord({ meta: { source: "database" }, artist });

    // The trajectory starts open; the lists start folded.
    expect(screen.getByRole("button", { name: /^Trajetória\s?\(3\)$/ })).toHaveAttribute("aria-expanded", "true");
    const worksToggle = screen.getByRole("button", { name: /^Obras\s?\(1\)$/ });
    expect(worksToggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(worksToggle);
    const works = screen.getByRole("region", { name: /^Obras/ });
    expect(within(works).getByText("Paisagem")).toBeInTheDocument();
    expect(within(works).getByText("c. 1930 · óleo sobre tela")).toBeInTheDocument();
    expect(within(works).getByText("Tombo 1963.1.1 · Doação")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Exposições\s?\(1\)$/ }));
    expect(within(screen.getByRole("region", { name: /^Exposições/ })).getByText("1951 · MAM · São Paulo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Publicações\s?\(0\)$/ }));
    expect(within(screen.getByRole("region", { name: /^Publicações/ })).getByText("Nenhum registro no acervo.")).toBeInTheDocument();
  });

  it("explains each source status in a tip opened by clicking it", async () => {
    await renderRecord({ meta: { source: "database" }, artist });
    const sources = screen.getByRole("region", { name: "Fontes" });
    expect(screen.queryByText(/Trajetória traçada pela plataforma/)).not.toBeInTheDocument();

    fireEvent.click(within(sources).getByRole("button", { name: /Trajetória inferida/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Trajetória traçada pela plataforma a partir desses registros; não é um percurso documentado.",
    );
    fireEvent.click(within(sources).getByRole("button", { name: /Documentado/ }));
    expect(screen.getByText(/Acervo do MAC USP: obras selecionadas/)).toBeInTheDocument();
  });

  it("marks birth and death with their icons", async () => {
    await renderRecord({ meta: { source: "database" }, artist });
    expect(screen.getByText("Nascimento").querySelector('[data-icon="birth"]')).toBeInTheDocument();
    expect(screen.getByText("Falecimento").querySelector('[data-icon="death"]')).toBeInTheDocument();
  });

  it("flags demo data", async () => {
    await renderRecord({ meta: { source: "demo" }, artist });
    expect(screen.getByRole("status")).toHaveTextContent("Dados de demonstração");
  });

  it("sends an unknown artist to the 404", async () => {
    await expect(ArtistRecord({ data: { meta: { source: "database" }, artist: null } })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

async function renderIndex(data: Parameters<typeof TrajectoryIndex>[0]["data"]) {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {await TrajectoryIndex({ data })}
    </NextIntlClientProvider>,
  );
}

describe("TrajectoryIndex", () => {
  it("names what the page holds beside the title", async () => {
    await renderIndex({ artists: [artist] });
    expect(screen.getByRole("heading", { level: 1, name: "Trajetórias" })).toBeInTheDocument();
    expect(screen.getByText("Fichas dos artistas")).toBeInTheDocument();
  });

  it("links every artist to their record", async () => {
    await renderIndex({ artists: [artist] });
    expect(screen.getByRole("link", { name: /Lasar Segall/ })).toHaveAttribute("href", "/trajetorias/lasar-segall");
    expect(screen.getByText("Polônia · 1889–1957")).toBeInTheDocument();
  });

  it("marks that there is no photo of the artist yet, and shows the photo when there is one", async () => {
    await renderIndex({
      artists: [artist, { ...artist, slug: "anatol", name: "Anatol", photo: { url: "https://api.example/photos/anatol", credit: null } }],
    });
    expect(screen.getByRole("img", { name: "Ainda sem foto" })).toHaveAttribute("data-empty", "true");
    expect(screen.getByRole("link", { name: /Anatol/ }).querySelector("img")).toHaveAttribute(
      "src",
      "https://api.example/photos/anatol",
    );
  });

  it("still renders when the artists cannot be loaded", async () => {
    await renderIndex(null);
    expect(screen.getByText("Não foi possível carregar os artistas agora.")).toBeInTheDocument();
  });
});
