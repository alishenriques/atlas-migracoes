import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { FuzzyDate, NetworkArtist, NetworkData, Place } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { NetworkExplorer } from "../NetworkExplorer";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: { params: { slug: string } } }) => (
    <a href={`/trajetorias/${href.params.slug}`} {...props}>
      {children}
    </a>
  ),
}));

const year = (value: number | null): FuzzyDate => ({
  raw: null,
  year: value,
  endYear: value,
  iso: null,
  precision: value === null ? "unknown" : "year",
});
const place = (id: string, label: string): Place => ({ id, label, country: "X", currentName: null, lat: null, lng: null });
const vilna = place("vilna", "Vilna");
const saoPaulo = place("sp", "São Paulo");

const bienal = { id: "EX.1", title: "Bienal", startDate: year(1951), institution: "MAC USP", place: saoPaulo };
const tardia = { id: "EX.2", title: "Retrospectiva", startDate: year(1980), institution: "Pinacoteca", place: saoPaulo };
const semData = { id: "EX.3", title: "Sem data", startDate: year(null), institution: "Galeria", place: null };

const segall: NetworkArtist = {
  slug: "lasar-segall",
  name: "Lasar Segall",
  birthPlace: vilna,
  birthDate: year(1889),
  deathPlace: saoPaulo,
  works: [{ id: "W1", title: "Paisagem", date: year(1930), exhibitions: [bienal, tardia, semData], publications: [] }],
};
const gruber: NetworkArtist = {
  slug: "mario-gruber",
  name: "Mario Gruber",
  birthPlace: null,
  birthDate: year(null),
  deathPlace: null,
  works: [{ id: "W9", title: "Gravura", date: year(1960), exhibitions: [bienal], publications: [] }],
};
const data: NetworkData = { meta: { source: "database" }, artists: [segall, gruber] };

const renderExplorer = (initialSlug: string | null = null, value: NetworkData = data) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <NetworkExplorer data={value} initialSlug={initialSlug} />
    </NextIntlClientProvider>,
  );

const graph = () => screen.getByRole("group", { name: /Rede de \d+ elementos/ });
const legend = () => screen.getByRole("list", { name: "Legenda" });

describe("NetworkExplorer", () => {
  it("opens on the overview of the whole base, over every dated year", () => {
    renderExplorer();
    expect(screen.getByRole("combobox", { name: "Centro da rede" })).toHaveValue("");
    expect(screen.getByRole("slider", { name: "Ano inicial" })).toHaveValue("1951");
    expect(screen.getByRole("slider", { name: "Ano final" })).toHaveValue("1980");
    expect(within(legend()).getByText("Artistas").closest("li")).toHaveTextContent("Artistas2");
    expect(within(legend()).getByText("Instituições").closest("li")).toHaveTextContent("Instituições3");
    expect(within(legend()).queryByText(/Obras/)).not.toBeInTheDocument();
    expect(screen.getByText(/Na visão geral/)).toBeInTheDocument();
    expect(screen.getByText("Selecione um elemento da rede para ver suas ligações.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpar" })).not.toBeInTheDocument();
  });

  it("opens centered on the artist from the link, and ignores an unknown one", () => {
    renderExplorer("lasar-segall");
    expect(screen.getByRole("combobox", { name: "Centro da rede" })).toHaveValue("lasar-segall");
    expect(screen.getByText(/As obras de Lasar Segall/)).toBeInTheDocument();
    expect(within(graph()).getByRole("button", { name: "Obra: Paisagem" })).toBeInTheDocument();
  });

  it("falls back to the overview for an unknown artist", () => {
    renderExplorer("nobody");
    expect(screen.getByRole("combobox", { name: "Centro da rede" })).toHaveValue("");
  });

  it("drops undated records and those outside a narrower period", () => {
    renderExplorer("lasar-segall");
    fireEvent.change(screen.getByRole("slider", { name: "Ano final" }), { target: { value: "1960" } });
    expect(within(graph()).getByRole("button", { name: "Exposição: Bienal" })).toBeInTheDocument();
    expect(within(graph()).queryByRole("button", { name: "Exposição: Retrospectiva" })).not.toBeInTheDocument();
    expect(within(graph()).queryByRole("button", { name: "Exposição: Sem data" })).not.toBeInTheDocument();
  });

  it("shows a selected node's details and links, and moves along them", () => {
    renderExplorer("lasar-segall");
    fireEvent.click(within(graph()).getByRole("button", { name: "Exposição: Bienal" }));
    const panel = screen.getByText("Exposição", { selector: "span" }).closest("div")?.parentElement as HTMLElement;
    expect(within(panel).getByText("Bienal")).toBeInTheDocument();
    expect(within(panel).getByText("1951")).toBeInTheDocument();
    expect(within(panel).getByText("4 ligações")).toBeInTheDocument();
    expect(within(panel).getByText("Documentado")).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole("button", { name: "Artista: Mario Gruber" }));
    expect(screen.getByRole("link", { name: "Abrir a ficha da trajetória" })).toHaveAttribute(
      "href",
      "/trajetorias/mario-gruber",
    );
    fireEvent.click(screen.getByRole("button", { name: "Centralizar a rede neste artista" }));
    expect(screen.getByRole("combobox", { name: "Centro da rede" })).toHaveValue("mario-gruber");
    expect(screen.queryByRole("button", { name: "Centralizar a rede neste artista" })).not.toBeInTheDocument();
  });

  it("gives a place no date and no record link", () => {
    renderExplorer("lasar-segall");
    fireEvent.click(within(graph()).getByRole("button", { name: "Lugar: Vilna" }));
    expect(screen.getByText("1 ligação")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir a ficha da trajetória" })).not.toBeInTheDocument();
  });

  it("clears the center, period and selection", () => {
    renderExplorer();
    fireEvent.change(screen.getByRole("combobox", { name: "Centro da rede" }), { target: { value: "mario-gruber" } });
    expect(within(graph()).getByRole("button", { name: "Artista: Mario Gruber" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(screen.getByRole("combobox", { name: "Centro da rede" })).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Limpar" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Centro da rede" }), { target: { value: "" } });
    expect(screen.getByText("Selecione um elemento da rede para ver suas ligações.")).toBeInTheDocument();
  });

  it("says so when the period has no links", () => {
    const lonely: NetworkArtist = { ...gruber, works: [] };
    renderExplorer("mario-gruber", { meta: { source: "database" }, artists: [lonely] });
    expect(screen.getByText("Nenhuma ligação neste período.")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /Rede de/ })).not.toBeInTheDocument();
  });

  it("offers no period control when the base is dated in a single year", () => {
    renderExplorer(null, { meta: { source: "database" }, artists: [gruber] });
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });
});
