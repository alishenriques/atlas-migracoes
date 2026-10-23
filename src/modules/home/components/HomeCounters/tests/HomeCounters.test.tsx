import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOverview } from "@/lib/atlas";
import type { Overview } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { HomeCounters, HomeCountersSkeleton } from "../HomeCounters";

vi.mock("@/lib/atlas", () => ({ getOverview: vi.fn() }));

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getTranslations: async (namespace: "HOME.COUNTERS") => createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});

const overview = (source: Overview["meta"]["source"]): Overview => ({
  meta: { source },
  stats: { artists: 31, works: 417, exhibitions: 299, publications: 108, places: 73, originCountries: 11 },
});

async function renderCounters() {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {await HomeCounters()}
    </NextIntlClientProvider>,
  );
}

describe("HomeCounters", () => {
  beforeEach(() => {
    vi.mocked(getOverview).mockReset();
  });

  it("shows the collection counters", async () => {
    vi.mocked(getOverview).mockResolvedValue(overview("database"));
    await renderCounters();
    expect(screen.getByText("417")).toBeInTheDocument();
    expect(screen.getByText("países de origem")).toBeInTheDocument();
    expect(screen.queryByText(/Dados de demonstração/)).not.toBeInTheDocument();
  });

  it("flags simulated records", async () => {
    vi.mocked(getOverview).mockResolvedValue(overview("demo"));
    await renderCounters();
    expect(screen.getByText(/Dados de demonstração/)).toBeInTheDocument();
  });

  it("says so when the API cannot be reached", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getOverview).mockRejectedValue(new Error("offline"));
    await renderCounters();
    expect(screen.getByText("Não foi possível carregar os números do acervo agora.")).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith("Failed to load the collection overview:", "offline");

    vi.mocked(getOverview).mockRejectedValue("timeout");
    await renderCounters();
    expect(console.error).toHaveBeenCalledWith("Failed to load the collection overview:", "timeout");
  });

  it("holds the counters' place while they load", () => {
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <HomeCountersSkeleton />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-shape]")).toHaveLength(5);
  });
});
