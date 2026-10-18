import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useStates } from "../useStates";

afterEach(() => vi.restoreAllMocks());

describe("useStates", () => {
  it("reports an error that is not an Error instance", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue("offline");
    const { result } = renderHook(() => useStates());
    await waitFor(() => expect(result.current).toEqual({ status: "error" }));
    expect(log).toHaveBeenCalledWith("Failed to load the historical borders:", "offline");
  });

  it("ignores a response that arrives after the screen closed", async () => {
    let resolve: (response: Response) => void = () => {};
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise((done) => (resolve = done)));
    const { result, unmount } = renderHook(() => useStates());
    unmount();
    resolve({ ok: true, status: 200, json: () => Promise.resolve({ type: "FeatureCollection", features: [] }) } as Response);
    await Promise.resolve();
    expect(result.current).toEqual({ status: "loading" });
  });

  it("ignores a failure that arrives after the screen closed", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    let reject: (reason: unknown) => void = () => {};
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise((_, fail) => (reject = fail)));
    const { result, unmount } = renderHook(() => useStates());
    unmount();
    reject(new Error("offline"));
    await waitFor(() => expect(log).toHaveBeenCalled());
    expect(result.current).toEqual({ status: "loading" });
  });
});
