import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { Finding, FuzzyDate, Research } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { ResearchResults } from "../ResearchResults";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string | { params: { slug: string } } }) => (
    <a href={typeof href === "string" ? href : `/trajetorias/${href.params.slug}`} {...props}>
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

const item = "https://www.wikidata.org/wiki/Q1"; // never fetched: only rendered as a link
const statement = (property: Finding["property"], value: string, extra: Partial<Finding> = {}): Finding => ({
  source: "wikidata",
  sourceUrl: item,
  sourceTitle: "Wikidata: Lasar Segall (Q1)",
  property,
  propertyId: "P1",
  value,
  references: 0,
  reliability: "undetermined",
  reviews: [],
  ...extra,
});

const research: Research = {
  artist: {
    slug: "lasar-segall",
    name: "Lasar Segall",
    birthPlace: { id: "vilna", label: "Vilna", country: "Polônia", currentName: "Vilnius, Lituânia", lat: 54.7, lng: 25.3 },
    birthDate: year(1889),
    deathPlace: null,
    deathDate: year(null),
  },
  searchedNames: ["Lasar Segall"],
  match: { id: "Q1", label: "Lasar Segall", description: "pintor lituano-brasileiro", url: item, basis: "birth_year" },
  candidates: [],
  findings: [
    statement("birthDate", "1891-07-21", { references: 2, reliability: "documented", reviews: ["conflicts_with_collection"] }),
    statement("birthPlace", "Vilnius", { reviews: ["present_day_name"] }),
    statement("occupation", "pintor"),
    {
      ...statement("summary", "Lasar Segall foi um pintor."),
      source: "wikipedia",
      sourceUrl: "https://pt.wikipedia.org/wiki/Lasar_Segall",
      sourceTitle: "Wikipedia (pt): Lasar Segall",
      propertyId: null,
    },
  ],
  sources: [
    { source: "wikidata", status: "ok", detail: null },
    { source: "wikipedia", status: "error", detail: "pt.wikipedia.org answered 503" },
  ],
  period: { day: "1889-07-01", approximate: false, birthState: "Império Russo", states: ["Alemanha", "Império Russo"] },
  summary: {
    status: "ok",
    text: "Lasar Segall nasceu em 1891 [1] em Vilna, então no Império Russo [2].",
    citations: [1, 2],
    prompt: "# Instruções\n\nResuma.\n\n# Dados\n\n[1] data de nascimento: 1891-07-21",
    model: "gemini-2.5-flash",
    detail: null,
  },
  retrievedAt: "2026-10-18T12:00:00.000Z",
};

const renderResults = (value: Research) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <ResearchResults research={value} />
    </NextIntlClientProvider>,
  );

describe("ResearchResults", () => {
  it("sets the collection's record beside the person found and how it was chosen", () => {
    renderResults(research);
    expect(screen.getByText("1889, Vilna (Vilnius, Lituânia)")).toBeInTheDocument();
    expect(screen.getByText("s.d., lugar desconhecido")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir a ficha da trajetória" })).toHaveAttribute("href", "/trajetorias/lasar-segall");
    expect(screen.getByText("pintor lituano-brasileiro")).toBeInTheDocument();
    expect(screen.getByText(/única pessoa com este nome nascida no ano/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver na fonte: Wikidata Q1" })).toHaveAttribute("href", item);
  });

  it("shows each finding with its reliability, references, source and what needs review", () => {
    renderResults(research);
    const born = screen.getByRole("region", { name: "Nascimento" });
    expect(within(born).getByText("21 de jul. de 1891")).toBeInTheDocument();
    expect(within(born).getByText("Documentado")).toBeInTheDocument();
    expect(within(born).getByText("2 referências")).toBeInTheDocument();
    expect(within(born).getByText(/a data diverge da registrada no acervo/)).toBeInTheDocument();
    expect(within(born).getByRole("link", { name: "Wikidata: Lasar Segall (Q1)" })).toHaveAttribute("target", "_blank");

    const place = screen.getByRole("region", { name: "Lugar de nascimento" });
    expect(within(place).getByText("sem referências")).toBeInTheDocument();
    expect(within(place).getByText(/nome atual do lugar/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Ocupação" })).toHaveTextContent("pintor");
  });

  it("shows the encyclopedia summary apart, as undetermined", () => {
    renderResults(research);
    const summary = screen.getByText("Lasar Segall foi um pintor.").parentElement as HTMLElement;
    expect(within(summary).getByText("Não determinado")).toBeInTheDocument();
    expect(within(summary).queryByText(/referência/)).not.toBeInTheDocument();
    expect(within(summary).getByRole("link", { name: "Wikipedia (pt): Lasar Segall" })).toBeInTheDocument();
  });

  it("says which sources answered, when, and how the search works", () => {
    renderResults(research);
    expect(screen.getByText("Wikidata: consultada")).toBeInTheDocument();
    expect(screen.getByText("Wikipedia: não respondeu")).toBeInTheDocument();
    expect(screen.getByText("Fontes lidas em 18 de outubro de 2026 às 09:00.")).toBeInTheDocument();
    expect(screen.getByText(/Busca no Wikidata pelo nome “Lasar Segall”/)).toBeInTheDocument();
  });

  it("explains the name-only match", () => {
    renderResults({ ...research, match: { ...research.match!, basis: "name", description: null } });
    expect(screen.getByText(/O acervo não registra o ano de nascimento/)).toBeInTheDocument();
  });

  it("says when the person found has none of the statements read", () => {
    renderResults({ ...research, findings: [] });
    expect(screen.getByText(/não tem nenhuma destas informações/)).toBeInTheDocument();
  });

  it("explains why no person was chosen and shows no findings", () => {
    renderResults({
      ...research,
      match: null,
      findings: [],
      sources: [{ source: "wikidata", status: "no_match", detail: null }],
    });
    expect(screen.getByText(/Não foram encontrados dados concretos sobre este artista/)).toBeInTheDocument();
    expect(screen.getByText("Wikidata: nada encontrado")).toBeInTheDocument();
    expect(screen.queryByText("Pessoa encontrada no Wikidata")).not.toBeInTheDocument();
    expect(screen.queryByText("Achados")).not.toBeInTheDocument();
  });

  it("tells a failed search apart from no match", () => {
    renderResults({
      ...research,
      match: null,
      findings: [],
      sources: [{ source: "wikidata", status: "error", detail: "www.wikidata.org answered 503" }],
    });
    expect(screen.getByText(/Pesquisa pendente/)).toBeInTheDocument();
    expect(screen.queryByText(/Não foram encontrados dados concretos/)).not.toBeInTheDocument();
  });

  it("numbers the findings and links each citation of the AI summary to its finding", () => {
    const { container } = renderResults(research);
    const summary = screen.getByText(/Lasar Segall nasceu em 1891/);
    const citations = within(summary).getAllByRole("link");
    expect(citations.map((link) => [link.getAttribute("aria-label"), link.getAttribute("href")])).toEqual([
      ["Achado 1", "#achado-1"],
      ["Achado 2", "#achado-2"],
    ]);
    expect(container.querySelector("#achado-1")).toHaveTextContent("21 de jul. de 1891");
    expect(container.querySelector("#achado-2")).toHaveTextContent("Vilnius");
    expect(container.querySelector("#achado-4")).toHaveTextContent("Lasar Segall foi um pintor.");
    expect(screen.getByLabelText("Achado 3")).toHaveTextContent("[3]");
    expect(screen.getByText(/Escrito por IA \(gemini-2.5-flash\)/)).toBeInTheDocument();
  });

  it("shows the prompt sent to the AI and the period's map it was given", () => {
    renderResults(research);
    expect(screen.getByText("Prompt enviado à IA")).toBeInTheDocument();
    expect(screen.getByText(/\[1\] data de nascimento: 1891-07-21/)).toBeInTheDocument();
    expect(screen.getByText("Europa em 1 de jul. de 1889")).toBeInTheDocument();
    expect(screen.getByText("Império Russo", { selector: "p" })).toBeInTheDocument();
  });

  it("hides the prompt when there is none", () => {
    renderResults({ ...research, summary: { ...research.summary, status: "no_findings", text: null, prompt: null } });
    expect(screen.queryByText("Prompt enviado à IA")).not.toBeInTheDocument();
    expect(screen.queryByText("Resumo da IA")).not.toBeInTheDocument();
  });
});
