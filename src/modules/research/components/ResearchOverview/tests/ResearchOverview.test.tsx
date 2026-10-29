import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import type { FuzzyDate, Research, ResearchCandidate } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { ResearchOverview } from "../ResearchOverview";

const year = (value: number | null): FuzzyDate => ({
  raw: null,
  year: value,
  endYear: value,
  iso: null,
  precision: value === null ? "unknown" : "year",
});

const research: Research = {
  artist: {
    slug: "dimitri-ismailovitch",
    name: "Dimitri Ismailovitch",
    birthPlace: null,
    birthDate: year(1892),
    deathPlace: null,
    deathDate: year(null),
  },
  searchedNames: ["Dimitri Ismailovitch"],
  match: null,
  candidates: [],
  findings: [],
  sources: [{ source: "wikidata", status: "no_match", detail: null }],
  period: null,
  summary: { status: "no_findings", text: null, citations: [], prompt: null, model: null, detail: null },
  retrievedAt: "2026-10-21T15:00:00.000Z",
};

const candidate = (overrides: Partial<ResearchCandidate>): ResearchCandidate => ({
  id: "Q4198627",
  label: "Dimitri Ismailovitch",
  description: "artista russo-brasileiro",
  url: "https://www.wikidata.org/wiki/Q4198627",
  birthYear: 1890,
  foundBy: "Dimitri Ismailovitch",
  reason: "birth_year_differs",
  ...overrides,
});

const renderOverview = (value: Research) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <ResearchOverview research={value} />
    </NextIntlClientProvider>,
  );

describe("ResearchOverview", () => {
  it("says where and when the research found nothing, and that nobody by this name is on Wikidata", () => {
    renderOverview(research);
    expect(screen.getByText("Pesquisa de IA sobre este artista")).toBeInTheDocument();
    expect(
      screen.getByText("Não foram encontrados dados concretos sobre este artista nas pesquisas realizadas em Wikidata em 21 de outubro de 2026."),
    ).toBeInTheDocument();
    expect(screen.getByText("Nomes buscados: “Dimitri Ismailovitch”.")).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma pessoa com este nome foi encontrada no Wikidata/)).toBeInTheDocument();
  });

  it("lists the people not linked, each with why, as leads to check", () => {
    renderOverview({
      ...research,
      searchedNames: ["Maciej Antoni Babinski", "Maciej Babinski"],
      artist: { ...research.artist, name: "Maciej Antoni Babinski" },
      candidates: [
        candidate({}),
        candidate({ id: "Q2", label: "Maciej Babiński", description: null, foundBy: "Maciej Babinski", reason: "shorter_name" }),
        candidate({ id: "Q3", birthYear: null, reason: "no_birth_year" }),
        candidate({ id: "Q4", reason: "ambiguous" }),
        candidate({ id: "Q5", reason: "name_differs" }),
      ],
    });
    expect(screen.getByText("Nomes buscados: “Maciej Antoni Babinski” e “Maciej Babinski”.")).toBeInTheDocument();
    const leads = within(screen.getByRole("region", { name: "Possíveis correspondências, não vinculadas" }));
    expect(leads.getByText("No Wikidata, nasceu em 1890; no acervo, 1892. Confirme qual data está correta.")).toBeInTheDocument();
    expect(leads.getByText("Só aparece na busca por “Maciej Babinski”, um nome diferente do registrado no acervo.")).toBeInTheDocument();
    expect(leads.getByText(/não registra o ano de nascimento, então não é possível comparar com o acervo \(1892\)/)).toBeInTheDocument();
    expect(leads.getByText(/Mais de uma pessoa no Wikidata/)).toBeInTheDocument();
    expect(leads.getByText(/e o nome no Wikidata é diferente/)).toBeInTheDocument();
    expect(leads.getByRole("link", { name: "Wikidata Q4198627" })).toHaveAttribute("href", "https://www.wikidata.org/wiki/Q4198627");
    expect(leads.getByText(/Nenhuma delas foi vinculada automaticamente/)).toBeInTheDocument();
    expect(screen.queryByText(/Nenhuma pessoa com este nome/)).not.toBeInTheDocument();
  });

  it("says the research is pending when Wikidata did not answer", () => {
    renderOverview({ ...research, sources: [{ source: "wikidata", status: "error", detail: "503" }] });
    expect(screen.getByText(/Pesquisa pendente: o Wikidata não respondeu na pesquisa de 21 de outubro de 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/Não foram encontrados/)).not.toBeInTheDocument();
  });

  it("says where and when the findings were found, and which AI wrote the summary", () => {
    const found: Research = {
      ...research,
      match: { id: "Q1", label: "Lasar Segall", description: null, url: "https://www.wikidata.org/wiki/Q1", basis: "birth_year", note: null },
      sources: [
        { source: "wikidata", status: "ok", detail: null },
        { source: "wikipedia", status: "ok", detail: null },
      ],
      summary: { status: "ok", text: "Pintor [1].", citations: [1], prompt: "p", model: "gemini-3.8-flash", detail: null },
    };
    const { rerender } = renderOverview(found);
    expect(screen.getByText(/Informações encontradas na pesquisa automatizada de 21 de outubro de 2026 em Wikidata e Wikipedia/)).toBeInTheDocument();
    expect(screen.getByText("Resumo escrito por IA: gemini-3.8-flash.")).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <ResearchOverview research={{ ...found, summary: { ...found.summary, status: "error", model: null } }} />
      </NextIntlClientProvider>,
    );
    expect(screen.queryByText(/Resumo escrito por IA/)).not.toBeInTheDocument();
  });

  it("leaves out the names searched when there are none, as in results stored before they were recorded", () => {
    renderOverview({ ...research, searchedNames: [] });
    expect(screen.queryByText(/Nomes buscados/)).not.toBeInTheDocument();
  });
});
