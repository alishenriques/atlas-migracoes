import { describe, expect, it } from "vitest";

import { baseMapStyle, readMapColors } from "../mapStyle";

describe("baseMapStyle", () => {
  it("draws only land and water, with no present-day borders or names", () => {
    const style = baseMapStyle({ land: "#111", water: "#000", coast: "#333" });

    expect(style.layers.map((layer) => layer.id)).toEqual(["land", "water"]);
    expect(style.layers.some((layer) => layer.type === "symbol")).toBe(false);
    expect(style.layers[1]).toMatchObject({ paint: { "fill-color": "#000", "fill-outline-color": "#333" } });
  });
});

describe("readMapColors", () => {
  it("reads the design system's colour tokens", () => {
    const element = document.createElement("div");
    element.style.setProperty("--atlas-color-bg-raised", " #1a2440 ");
    element.style.setProperty("--atlas-color-bg", "#0b1020");
    element.style.setProperty("--atlas-color-border-strong", "#3a4560");
    element.style.setProperty("--atlas-color-accent", "#c9a24a");
    element.style.setProperty("--atlas-color-fg", "#f2ede1");

    expect(readMapColors(element)).toEqual({
      land: "#1a2440",
      water: "#0b1020",
      coast: "#3a4560",
      accent: "#c9a24a",
      foreground: "#f2ede1",
    });
  });
});
