import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import en from "@/locales/en.json";
import pt from "@/locales/pt.json";

import { About } from "../About";

function renderAbout(locale: "pt" | "en") {
  render(
    <NextIntlClientProvider locale={locale} messages={locale === "pt" ? pt : en}>
      <About />
    </NextIntlClientProvider>,
  );
}

describe("About", () => {
  it("presents the project, the three methodology steps and the reliability levels", () => {
    renderAbout("pt");
    expect(screen.getByRole("heading", { level: 1, name: "Sobre o projeto" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(
      expect.arrayContaining(["Leitura", "Relação", "Confiabilidade"]),
    );
    expect(screen.getByText("Documentado")).toBeInTheDocument();
    expect(screen.getByText("Inferido")).toBeInTheDocument();
    expect(screen.getByText("Indeterminado")).toBeInTheDocument();
  });

  it("credits the collection and the basemap", () => {
    renderAbout("en");
    expect(screen.getByText(/© OpenStreetMap contributors, ODbL/)).toBeInTheDocument();
    expect(screen.getByText(/Museum of Contemporary Art of the University of São Paulo/, { selector: "li" })).toBeInTheDocument();
  });

  it("ends with the developer's footer, outside main", () => {
    renderAbout("pt");
    const footer = screen.getByRole("contentinfo");
    expect(screen.getByRole("main")).not.toContainElement(footer);
    expect(footer).toHaveTextContent("Desenvolvido por");
  });
});
