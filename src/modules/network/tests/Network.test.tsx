import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { NetworkData } from "@/lib/schemas";
import messages from "@/locales/pt.json";

import { type NetworkExplorerProps } from "../components/NetworkExplorer";
import { Network } from "../Network";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getTranslations: async (namespace: "NETWORK") => createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});

// The interactive part has its own tests.
vi.mock("../components/NetworkExplorer", () => ({
  NetworkExplorer: ({ data, initialSlug, intro, footer }: NetworkExplorerProps) => (
    <>
      {intro}
      <div data-testid="explorer">
        {data.artists.length} {initialSlug}
      </div>
      {footer}
    </>
  ),
}));

const renderNetwork = async (data: NetworkData | null) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {await Network({ data, initialSlug: "lasar-segall" })}
    </NextIntlClientProvider>,
  );

describe("Network", () => {
  it("introduces the screen and hands the base and the chosen artist to the graph", async () => {
    await renderNetwork({ meta: { source: "database" }, artists: [] });
    expect(screen.getByRole("heading", { level: 1, name: "Rede Relacional" })).toBeInTheDocument();
    expect(screen.getByTestId("explorer")).toHaveTextContent("0 lasar-segall");
    expect(screen.getByText(/Ligações tiradas do acervo/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("flags simulated records", async () => {
    await renderNetwork({ meta: { source: "demo" }, artists: [] });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("says so when the base could not be loaded", async () => {
    await renderNetwork(null);
    expect(screen.getByText(/Não foi possível carregar a rede/)).toBeInTheDocument();
    expect(screen.queryByTestId("explorer")).not.toBeInTheDocument();
  });
});
