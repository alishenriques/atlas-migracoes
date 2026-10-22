import type { ReactNode } from "react";

import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMapData, getOverview } from "@/lib/atlas";
import type { Overview } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { Home } from "../Home";

vi.mock("@/lib/atlas", () => ({ getOverview: vi.fn(), getMapData: vi.fn() }));

// The interactive map has its own tests (components/Explorar).
vi.mock("../components/Explorar", () => ({
  Explorar: ({ artists, intro, footer }: { artists: unknown[]; intro: ReactNode; footer: ReactNode }) => (
    <div data-testid="explorar">
      {artists.length}
      <div data-testid="intro">{intro}</div>
      <div data-testid="footer">{footer}</div>
    </div>
  ),
}));

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getLocale: async () => "pt",
    getTranslations: async (namespace: "HOME") => createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});

const overview = (source: Overview["meta"]["source"]): Overview => ({
  meta: { source },
  stats: { artists: 31, works: 417, exhibitions: 299, publications: 108, places: 73, originCountries: 14 },
});

async function renderHome() {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {await Home()}
    </NextIntlClientProvider>,
  );
}

describe("Home", () => {
  beforeEach(() => {
    vi.mocked(getOverview).mockReset();
    vi.mocked(getMapData).mockReset();
    vi.mocked(getMapData).mockResolvedValue({ artists: [] });
  });

  it("shows the collection counters", async () => {
    vi.mocked(getOverview).mockResolvedValue(overview("database"));
    await renderHome();
    expect(screen.getByRole("heading", { level: 1, name: "Atlas Migrações Leste-Sul" })).toBeInTheDocument();
    expect(screen.getByText("417")).toBeInTheDocument();
    expect(screen.getByText("países de origem")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByTestId("explorar")).toBeInTheDocument();
  });

  it("floats the presentation and the counters over the map", async () => {
    vi.mocked(getOverview).mockResolvedValue(overview("demo"));
    await renderHome();
    const intro = within(screen.getByTestId("intro"));
    expect(intro.getByRole("status")).toHaveTextContent("Dados de demonstração");
    expect(intro.getByRole("heading", { level: 1 })).toHaveTextContent("Atlas Migrações Leste-Sul");
    expect(within(screen.getByTestId("footer")).getByText("417")).toBeInTheDocument();
  });

  it("flags simulated demo data", async () => {
    vi.mocked(getOverview).mockResolvedValue(overview("demo"));
    await renderHome();
    expect(screen.getByRole("status")).toHaveTextContent("Dados de demonstração");
  });

  it("still renders when the API is unreachable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getOverview).mockImplementation(async () => {
      throw new Error("ECONNREFUSED");
    });
    await renderHome();
    expect(screen.getByText("Não foi possível carregar os números do acervo agora.")).toBeInTheDocument();
  });

  it("keeps the counters when the map data fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getOverview).mockResolvedValue(overview("database"));
    vi.mocked(getMapData).mockRejectedValue(new Error("timeout"));
    await renderHome();
    expect(screen.getByText("Não foi possível carregar as trajetórias agora.")).toBeInTheDocument();
    expect(screen.queryByTestId("explorar")).not.toBeInTheDocument();
    expect(screen.getByText("417")).toBeInTheDocument();
  });
});
