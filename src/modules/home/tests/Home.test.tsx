import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import en from "@/locales/en.json";
import pt from "@/locales/pt.json";

import { Home } from "../Home";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// The counters read the API; they have their own tests.
vi.mock("../components/HomeCounters", () => ({
  HomeCounters: () => <p>counters</p>,
  HomeCountersSkeleton: () => <p>loading</p>,
}));

function renderHome(locale: "pt" | "en" = "pt") {
  render(
    <NextIntlClientProvider locale={locale} messages={locale === "pt" ? pt : en}>
      <Home />
    </NextIntlClientProvider>,
  );
}

describe("Home", () => {
  it("opens with the slider, then the counters, the need, the impacts, the screens and the method", () => {
    renderHome();
    expect(screen.getByRole("heading", { level: 1, name: "Atlas Migrações Leste-Sul" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "Trajetórias de artistas do Leste Europeu e da Áustria no Brasil",
      "O acervo em números",
      "Um acervo lido em relação",
      "O que muda para a pesquisa e para o acervo",
      "Cinco maneiras de ler o acervo",
      "Leitura, relação e confiabilidade",
    ]);
    expect(screen.getByRole("region", { name: "O acervo em números" })).toHaveTextContent("counters");
    expect(screen.getByText(/Como a IA pode contribuir/)).toBeInTheDocument();
  });

  it("says what changes for research and for the collection", () => {
    renderHome();
    const impacts = screen.getByRole("region", { name: "O que muda para a pesquisa e para o acervo" });
    expect(within(impacts).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Para a pesquisa",
      "Para o acervo",
    ]);
    expect(within(impacts).getAllByRole("listitem")).toHaveLength(6);
  });

  it("leads to each screen of the atlas and to the project's method", () => {
    renderHome();
    const screens = screen.getByRole("region", { name: "Cinco maneiras de ler o acervo" });
    expect(within(screens).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/explorar",
      "/trajetorias",
      "/camada-historica",
      "/rede",
      "/ia-relacional",
    ]);
    expect(within(screens).getByRole("link", { name: /Camada Histórica/ })).toHaveTextContent(/fronteiras de cada período/);
    expect(screen.getByRole("link", { name: "Conheça o projeto e a metodologia" })).toHaveAttribute("href", "/sobre");
  });

  it("ends with the developer's credit, after the main content", () => {
    renderHome();
    const footer = screen.getByRole("contentinfo");
    expect(screen.getByRole("main")).not.toContainElement(footer);
    expect(footer).toHaveTextContent("Desenvolvido por");
  });

  it("is in English too", () => {
    renderHome("en");
    expect(screen.getByRole("heading", { level: 2, name: "What changes for research and for the collection" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore the map" })).toHaveAttribute("href", "/explorar");
  });
});
