import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMapData, getOverview } from "@/lib/atlas";
import type { Overview } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { Home } from "../Home";

vi.mock("@/lib/atlas", () => ({ getOverview: vi.fn(), getMapData: vi.fn() }));

// The interactive map has its own tests (components/Explorar).
vi.mock("../components/Explorar", () => ({
  Explorar: ({ artists }: { artists: unknown[] }) => <div data-testid="explorar">{artists.length}</div>,
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
