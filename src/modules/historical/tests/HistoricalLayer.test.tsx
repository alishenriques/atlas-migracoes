import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HistoricalLayer } from "../HistoricalLayer";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getTranslations: async (namespace: "HISTORICAL_LAYER") => createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});

// The interactive part has its own tests.
vi.mock("../components/HistoricalExplorer", () => ({
  HistoricalExplorer: ({ artists, intro, credit }: { artists: unknown[]; intro: ReactNode; credit: ReactNode }) => (
    <div data-testid="explorer">
      {intro}
      <p>{artists.length} artistas</p>
      {credit}
    </div>
  ),
}));

describe("HistoricalLayer", () => {
  it("introduces the screen, hands the artists to the map and credits CShapes", async () => {
    render(await HistoricalLayer({ data: { artists: [] } }));
    expect(screen.getByRole("heading", { level: 1, name: "Camada Histórica" })).toBeInTheDocument();
    expect(screen.getByTestId("explorer")).toHaveTextContent("0 artistas");
    expect(screen.getByText(/CShapes 2\.0, de Schvitz/)).toBeInTheDocument();
  });

  it("says so when the artists could not be loaded", async () => {
    render(await HistoricalLayer({ data: null }));
    expect(screen.getByText(/Não foi possível carregar os artistas/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Camada Histórica" })).toBeInTheDocument();
    expect(screen.getByText(/CShapes 2\.0, de Schvitz/)).toBeInTheDocument();
    expect(screen.queryByTestId("explorer")).not.toBeInTheDocument();
  });
});
