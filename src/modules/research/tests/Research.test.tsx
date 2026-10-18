import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { ArtistList, Research as ResearchData } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { Research, type ResearchState } from "../Research";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getTranslations: async (namespace: "RESEARCH") => createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});

// The picker and the results have their own tests.
vi.mock("../components/ArtistPicker", () => ({
  ArtistPicker: ({ artists, selected }: { artists: ArtistList["artists"]; selected: string | null }) => (
    <div data-testid="picker">
      {artists.length} {selected}
    </div>
  ),
}));
vi.mock("../components/ResearchResults", () => ({
  ResearchResults: ({ research }: { research: ResearchData }) => <div data-testid="results">{research.artist.name}</div>,
}));

const list: ArtistList = { meta: { source: "database" }, artists: [{ slug: "lasar-segall", name: "Lasar Segall" }] };

const renderResearch = async (props: { list: ArtistList | null; slug: string | null; state: ResearchState }) =>
  render(<NextIntlClientProvider locale="pt" messages={messages}>{await Research(props)}</NextIntlClientProvider>);

describe("Research", () => {
  it("introduces the screen and asks for an artist", async () => {
    await renderResearch({ list, slug: null, state: { status: "idle" } });
    expect(screen.getByRole("heading", { level: 1, name: "IA Relacional" })).toBeInTheDocument();
    expect(screen.getByTestId("picker")).toHaveTextContent("1");
    expect(screen.getByText(/Escolha um artista para pesquisar/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the findings for the chosen artist", async () => {
    const research = { artist: { name: "Lasar Segall" } } as ResearchData;
    await renderResearch({ list, slug: "lasar-segall", state: { status: "found", research } });
    expect(screen.getByTestId("picker")).toHaveTextContent("1 lasar-segall");
    expect(screen.getByTestId("results")).toHaveTextContent("Lasar Segall");
  });

  it("says when the artist is unknown or the sources cannot be reached", async () => {
    const { unmount } = await renderResearch({ list, slug: "x", state: { status: "not_found" } });
    expect(screen.getByText("Este artista não está no acervo.")).toBeInTheDocument();
    unmount();
    await renderResearch({ list, slug: "x", state: { status: "unavailable" } });
    expect(screen.getByText(/não está disponível agora/)).toBeInTheDocument();
  });

  it("flags simulated records and says when the list could not be loaded", async () => {
    const { unmount } = await renderResearch({ list: { ...list, meta: { source: "demo" } }, slug: null, state: { status: "idle" } });
    expect(screen.getByRole("status")).toBeInTheDocument();
    unmount();
    await renderResearch({ list: null, slug: null, state: { status: "idle" } });
    expect(screen.getByText(/lista de artistas/)).toBeInTheDocument();
    expect(screen.queryByTestId("picker")).not.toBeInTheDocument();
    expect(screen.queryByText(/Escolha um artista para pesquisar/)).not.toBeInTheDocument();
  });
});
