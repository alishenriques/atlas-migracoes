import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HistoricalFact } from "@/lib/historicalFacts";
import en from "@/locales/en.json";
import pt from "@/locales/pt.json";

import { HistoricalFacts } from "../HistoricalFacts";

const fact = (id: string, start: string, weight: number, end: string | null = null): HistoricalFact => ({
  id,
  start: { iso: start, precision: "day" },
  end: end ? { iso: end, precision: "day" } : null,
  weight,
  pt: { title: `Fato ${id}`, text: `Texto do fato ${id}.`, url: `https://pt.wikipedia.org/wiki/${id}` },
  en: id === "Q2" ? { title: "World War II", text: "A war.", url: "https://en.wikipedia.org/wiki/World_War_II" } : null,
});

const facts = [fact("Q1", "1938-03-12", 80), fact("Q2", "1939-09-01", 200, "1945-09-02"), fact("Q3", "1939-03-15", 50)];

const respond = (body: unknown, ok = true) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) } as Response);

const file = { meta: { generatedAt: "2026-10-30T00:00:00Z", fromYear: 1910, toYear: 1989 }, facts };

const renderFacts = (year: number, locale: "pt" | "en" = "pt") =>
  render(
    <NextIntlClientProvider locale={locale} messages={locale === "pt" ? pt : en}>
      <HistoricalFacts year={year} />
    </NextIntlClientProvider>,
  );

afterEach(() => vi.restoreAllMocks());

describe("HistoricalFacts", () => {
  it("labels the facts inferred and explains how they were chosen", async () => {
    respond(file);
    renderFacts(1939);
    const section = screen.getByRole("region", { name: "Fatos históricos" });
    expect(within(section).getByText("Inferido")).toBeInTheDocument();
    expect(screen.getByText("Carregando os fatos…")).toBeInTheDocument();
    await screen.findByRole("heading", { name: "Em 1939" });
    fireEvent.click(screen.getByRole("button", { name: /Sobre os fatos históricos/ }));
    expect(screen.getByText(/sem revisão de pesquisador/)).toBeInTheDocument();
  });

  it("lists the year's facts in date order, each linked to its article", async () => {
    respond(file);
    renderFacts(1939);
    const list = (await screen.findByRole("heading", { name: "Em 1939" })).nextElementSibling as HTMLElement;
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => within(item).getByRole("link").textContent)).toEqual(["Fato Q3", "Fato Q2"]);
    expect(items[0]).toHaveTextContent("15 de mar. de 1939");
    expect(items[0]).toHaveTextContent("Texto do fato Q3.");
    expect(within(items[0]!).getByRole("link")).toHaveAttribute("href", "https://pt.wikipedia.org/wiki/Q3");
    expect(screen.queryByRole("heading", { name: "Em curso" })).not.toBeInTheDocument();
    expect(screen.getByText(/Wikipédia \(CC BY-SA 4.0\)/)).toBeInTheDocument();
  });

  it("shows the longer events still going on", async () => {
    respond(file);
    renderFacts(1942);
    expect(await screen.findByRole("heading", { name: "Em curso" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fato Q2 (1939–1945)" })).toHaveAttribute("href", "https://pt.wikipedia.org/wiki/Q2");
    expect(screen.queryByRole("heading", { name: "Em 1942" })).not.toBeInTheDocument();
  });

  it("says when a year has no facts", async () => {
    respond(file);
    renderFacts(1960);
    expect(await screen.findByText("Nenhum fato registrado para 1960.")).toBeInTheDocument();
  });

  it("says when the facts could not be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    respond(null, false);
    renderFacts(1939);
    expect(await screen.findByText("Não foi possível carregar os fatos históricos agora.")).toBeInTheDocument();
  });

  it("uses the English article when the app is in English", async () => {
    respond(file);
    renderFacts(1939, "en");
    expect(await screen.findByRole("link", { name: "World War II" })).toHaveAttribute("href", "https://en.wikipedia.org/wiki/World_War_II");
    expect(screen.getByRole("link", { name: "Fato Q3" })).toBeInTheDocument();
  });
});
