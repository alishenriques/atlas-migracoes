import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import type { ResearchSummary } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { AiSummary } from "../AiSummary";

const ok: ResearchSummary = {
  status: "ok",
  text: "Pintor [1], gravador [2] e escultor [7].",
  citations: [1, 2, 7],
  prompt: "# Instruções",
  model: null,
  detail: null,
};

const renderSummary = (summary: ResearchSummary, findingCount = 2) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <AiSummary summary={summary} findingCount={findingCount} />
    </NextIntlClientProvider>,
  );

describe("AiSummary", () => {
  it("links only the citations of existing findings", () => {
    renderSummary(ok);
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["#achado-1", "#achado-2"]);
    expect(screen.getByText(/escultor \[7\]\./)).toBeInTheDocument();
    expect(screen.getByText(/Escrito por IA \(Gemini\)/)).toBeInTheDocument();
  });

  it("says why there is no text", () => {
    const none = { ...ok, text: null, citations: [] };
    const { rerender } = renderSummary({ ...none, status: "not_configured" });
    expect(screen.getByText(/não está ativo neste ambiente/)).toBeInTheDocument();

    const again = (summary: ResearchSummary) =>
      rerender(
        <NextIntlClientProvider locale="pt" messages={messages}>
          <AiSummary summary={summary} findingCount={2} />
        </NextIntlClientProvider>,
      );
    again({ ...none, status: "rejected" });
    expect(screen.getByText(/não citava os achados corretamente/)).toBeInTheDocument();
    again({ ...none, status: "error" });
    expect(screen.getByText(/A IA não respondeu agora/)).toBeInTheDocument();
    again({ ...none, status: "ok" });
    expect(screen.getByText(/A IA não respondeu agora/)).toBeInTheDocument();
  });

  it("shows nothing when there is nothing to summarise", () => {
    const { container } = renderSummary({ ...ok, status: "no_findings", text: null, prompt: null });
    expect(container).toBeEmptyDOMElement();
  });
});
