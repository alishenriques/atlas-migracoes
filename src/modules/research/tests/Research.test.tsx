import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { Research as ResearchData, ResearchResponse } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { Research } from "../Research";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getTranslations: async (namespace: "RESEARCH") => createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// The findings have their own tests.
vi.mock("../components/ResearchResults", () => ({
  ResearchResults: ({ research }: { research: ResearchData }) => <div data-testid="results">{research.artist.slug}</div>,
}));

const research = { artist: { slug: "lasar-segall", name: "Lasar Segall" } } as ResearchData;
const found: ResearchResponse = { meta: { source: "database" }, research };

const renderResearch = async (data: ResearchResponse | null) =>
  render(<NextIntlClientProvider locale="pt" messages={messages}>{await Research({ data })}</NextIntlClientProvider>);

describe("Research", () => {
  it("shows the artist's findings under the screen's presentation, with the way back to the list", async () => {
    await renderResearch(found);
    expect(screen.getByRole("heading", { level: 1, name: "IA Relacional" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Todos os artistas/ })).toHaveAttribute("href", "/ia-relacional");
    expect(screen.getByTestId("results")).toHaveTextContent("lasar-segall");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("flags simulated records", async () => {
    await renderResearch({ ...found, meta: { source: "demo" } });
    expect(screen.getByRole("status")).toHaveTextContent(/Dados de demonstração/);
  });

  it("says when the open sources could not be reached", async () => {
    await renderResearch(null);
    expect(screen.getByText(/não está disponível agora/)).toBeInTheDocument();
    expect(screen.queryByTestId("results")).not.toBeInTheDocument();
  });

  it("sends an artist the collection does not have to the 404", async () => {
    await expect(Research({ data: { meta: { source: "database" }, research: null } })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
