import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { ResearchPeriod } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { PeriodMap } from "../PeriodMap";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const period: ResearchPeriod = {
  day: "1891-07-01",
  approximate: false,
  birthState: "Império Russo",
  states: ["Alemanha", "Áustria-Hungria", "Império Russo"],
};

const renderPeriod = (value: ResearchPeriod | null) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <PeriodMap period={value} />
    </NextIntlClientProvider>,
  );

describe("PeriodMap", () => {
  it("shows the state that held the birthplace and the states of that day", () => {
    renderPeriod(period);
    expect(screen.getByText("Europa em 1 de jul. de 1891")).toBeInTheDocument();
    expect(screen.getByText("Império Russo", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("3 Estados na Europa nesse dia")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(period.states);
    expect(screen.getByRole("link", { name: "Abrir a Camada Histórica" })).toHaveAttribute("href", "/camada-historica");
    expect(screen.queryByText(/aproximado/)).not.toBeInTheDocument();
  });

  it("flags an approximate year and a birthplace no state held", () => {
    renderPeriod({ ...period, approximate: true, birthState: null, states: ["Alemanha"] });
    expect(screen.getByText(/ano de nascimento é aproximado/)).toBeInTheDocument();
    expect(screen.getByText("nenhum Estado identificado")).toBeInTheDocument();
    expect(screen.getByText("1 Estado na Europa nesse dia")).toBeInTheDocument();
  });

  it("explains when there is no map for the period", () => {
    renderPeriod(null);
    expect(screen.getByText(/a IA não recebe o mapa do período/)).toBeInTheDocument();
  });
});
