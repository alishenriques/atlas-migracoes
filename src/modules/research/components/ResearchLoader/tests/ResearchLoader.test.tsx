import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getResearch } from "@/lib/atlas";
import type { Research } from "@/lib/schemas";

import { ResearchLoader } from "../ResearchLoader";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const pt = (await import("@/locales/pt.json")).default;
  return {
    getTranslations: async (namespace: "RESEARCH") => createTranslator({ locale: "pt", messages: pt, namespace }),
  };
});
vi.mock("@/lib/atlas", () => ({ getResearch: vi.fn() }));
// The results have their own tests.
vi.mock("../../ResearchResults", () => ({
  ResearchResults: ({ research }: { research: Research }) => <div data-testid="results">{research.artist.name}</div>,
}));

const load = vi.mocked(getResearch);

describe("ResearchLoader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the findings on the artist", async () => {
    load.mockResolvedValueOnce({ artist: { name: "Lasar Segall" } } as Research);
    render(await ResearchLoader({ slug: "lasar-segall" }));
    expect(load).toHaveBeenCalledWith("lasar-segall");
    expect(screen.getByTestId("results")).toHaveTextContent("Lasar Segall");
  });

  it("says when the artist is not in the collection", async () => {
    load.mockResolvedValueOnce(null);
    render(await ResearchLoader({ slug: "x" }));
    expect(screen.getByText("Este artista não está no acervo.")).toBeInTheDocument();
  });

  it("says when the sources cannot be reached, and logs why", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    load.mockRejectedValueOnce(new Error("timeout"));
    const { unmount } = render(await ResearchLoader({ slug: "x" }));
    expect(screen.getByText(/não está disponível agora/)).toBeInTheDocument();
    expect(log).toHaveBeenCalledWith("Failed to load the research:", "timeout");
    unmount();
    load.mockRejectedValueOnce("down");
    render(await ResearchLoader({ slug: "x" }));
    expect(log).toHaveBeenLastCalledWith("Failed to load the research:", "down");
  });
});
