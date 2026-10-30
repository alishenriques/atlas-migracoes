import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useHistoricalFacts } from "../useHistoricalFacts";

afterEach(() => vi.restoreAllMocks());

const file = { meta: { generatedAt: "2026-10-30T00:00:00Z", fromYear: 1910, toYear: 1989 }, facts: [] };

describe("useHistoricalFacts", () => {
  it("reads the facts file", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(file) } as Response);
    const { result } = renderHook(() => useHistoricalFacts());
    await waitFor(() => expect(result.current).toEqual({ status: "ready", facts: [] }));
    expect(fetch).toHaveBeenCalledWith("/historical/facts.json");
  });

  it("reports a missing file", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve(null) } as Response);
    const { result } = renderHook(() => useHistoricalFacts());
    await waitFor(() => expect(result.current).toEqual({ status: "error" }));
    expect(log).toHaveBeenCalledWith("Failed to load the historical facts:", "/historical/facts.json: HTTP 404");
  });
});
