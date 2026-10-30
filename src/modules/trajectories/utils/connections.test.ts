import { describe, expect, it } from "vitest";

import { CENTER_RADIUS, CONNECTIONS_CENTER, nameLines, ringSlots } from "./connections";

describe("ringSlots", () => {
  it("starts at the top and goes clockwise, labels on the outer side", () => {
    const [top, right, bottom, left] = ringSlots(["Norte", "Leste", "Sul", "Oeste"]);
    expect(top!.label).toMatchObject({ text: "Norte", anchor: "middle" });
    expect(top!.label.y).toBeLessThan(top!.y);
    expect(right!.x).toBeGreaterThan(CONNECTIONS_CENTER.x);
    expect(right!.label).toMatchObject({ anchor: "start" });
    expect(bottom!.label.y).toBeGreaterThan(bottom!.y);
    expect(left!.label).toMatchObject({ anchor: "end" });
    expect(left!.label.x).toBeLessThan(left!.x);
  });

  it("starts each line on the edge of the artist's circle", () => {
    const [top] = ringSlots(["Norte"]);
    expect(top!.from.x).toBeCloseTo(CONNECTIONS_CENTER.x);
    expect(top!.from.y).toBeCloseTo(CONNECTIONS_CENTER.y - CENTER_RADIUS);
  });

  it("cuts long labels, leaving more room above and below than at the sides", () => {
    const name = "Museu de Arte Contemporânea da Universidade de São Paulo";
    const [top, right] = ringSlots([name, name, name, name]);
    expect(top!.label.text).toHaveLength(24);
    expect(right!.label.text.length).toBeLessThanOrEqual(15);
    expect(right!.label.text.endsWith("…")).toBe(true);
  });
});

describe("nameLines", () => {
  it("fits a name in at most two lines", () => {
    expect(nameLines("Anatol Wladyslaw")).toEqual(["Anatol", "Wladyslaw"]);
    expect(nameLines("Lasar Segall")).toEqual(["Lasar Segall"]);
    expect(nameLines("Maria Helena Andrés Ribeiro")).toEqual(["Maria Helena", "Andrés Ribe…"]);
  });

  it("cuts a single long word", () => {
    expect(nameLines("Wladyslawowski")).toEqual(["Wladyslawow…"]);
  });
});
