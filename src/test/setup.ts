import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia. Stubbed here (not per-test) since any
// component may reach for it (prefers-reduced-motion, pointer type, etc.).
// Defaults to "no match" — tests that need a specific match mock this further.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
