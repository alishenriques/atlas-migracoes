import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { ArtistIndex, FuzzyDate } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { ResearchIndex } from "../ResearchIndex";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getLocale: async () => "pt",
    getTranslations: async (namespace: "RESEARCH") => createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: { pathname: string; params: { slug: string } } }) => (
    <a href={href.pathname.replace("[slug]", href.params.slug)} {...props}>
      {children}
    </a>
  ),
}));

const year = (y: number | null): FuzzyDate => ({ raw: null, year: y, endYear: y, iso: null, precision: y === null ? "unknown" : "year" });
const data: ArtistIndex = {
  meta: { source: "database" },
  artists: [
    {
      slug: "lasar-segall",
      name: "Lasar Segall",
      birthPlace: { id: "vilna", label: "Vilna", country: "Lituânia", currentName: null, lat: 1, lng: 1 },
      birthDate: year(1889),
      deathPlace: null,
      deathDate: year(1957),
      photo: null,
    },
    {
      slug: "anatol-wladyslaw",
      name: "Anatol Wladyslaw",
      birthPlace: null,
      birthDate: year(1913),
      deathPlace: null,
      deathDate: year(null),
      photo: { url: "https://api.example/photos/anatol-wladyslaw?v=1", credit: null },
    },
  ],
};

const renderIndex = async (value: ArtistIndex | null) =>
  render(<NextIntlClientProvider locale="pt" messages={messages}>{await ResearchIndex({ data: value })}</NextIntlClientProvider>);

describe("ResearchIndex", () => {
  it("lists the artists as Trajetórias does, each opening their own research page", async () => {
    await renderIndex(data);
    expect(screen.getByRole("heading", { level: 1, name: "IA Relacional" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar artista" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Pesquisa por artista" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lasar Segall/ })).toHaveAttribute("href", "/ia-relacional/lasar-segall");
    expect(screen.getByText("Lituânia · 1889–1957")).toBeInTheDocument();
    expect(screen.getByText("1913–s.d.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Anatol Wladyslaw/ }).querySelector("img")).toHaveAttribute(
      "src",
      "https://api.example/photos/anatol-wladyslaw?v=1",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("flags simulated records", async () => {
    await renderIndex({ ...data, meta: { source: "demo" } });
    expect(screen.getByRole("status")).toHaveTextContent(/Dados de demonstração/);
  });

  it("says when the artists could not be loaded", async () => {
    await renderIndex(null);
    expect(screen.getByText(/lista de artistas/)).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});
