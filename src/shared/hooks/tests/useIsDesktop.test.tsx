import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIsDesktop } from "../useIsDesktop";

afterEach(() => vi.restoreAllMocks());

function Probe() {
  return <span>{useIsDesktop() ? "desktop" : "mobile"}</span>;
}

describe("useIsDesktop", () => {
  it("assumes a desktop on the server", () => {
    expect(renderToString(<Probe />)).toContain("desktop");
  });

  it("follows the media query as the screen changes", () => {
    let matches = false;
    let listener: () => void = () => {};
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          get matches() {
            return matches;
          },
          addEventListener: (_: string, callback: () => void) => (listener = callback),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    const { result, unmount } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);
    matches = true;
    act(() => listener());
    expect(result.current).toBe(true);
    unmount();
  });
});
