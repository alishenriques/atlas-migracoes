import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { statesSchema } from "./cartography";
import { periodName, STATE_NAMES, stateNameLocale, stateNamesSchema } from "./stateNames";

const read = (file: string): unknown => JSON.parse(readFileSync(join(process.cwd(), "public/cartography", file), "utf8"));

describe("periodName", () => {
  it("names the state as it was on the day", () => {
    expect(periodName("Russia (Soviet Union)", "1891-07-01", "pt")).toBe("Império Russo");
    expect(periodName("Russia (Soviet Union)", "1917-03-15", "pt")).toBe("Império Russo");
    expect(periodName("Russia (Soviet Union)", "1917-03-16", "pt")).toBe("Rússia (Governo Provisório)");
    expect(periodName("Russia (Soviet Union)", "1920-07-01", "pt")).toBe("Rússia Soviética");
    expect(periodName("Russia (Soviet Union)", "1923-07-01", "pt")).toBe("União Soviética");
    expect(periodName("Russia (Soviet Union)", "1995-07-01", "en")).toBe("Russia");
    expect(periodName("Austria-Hungary", "1913-07-01", "pt")).toBe("Áustria-Hungria");
    expect(periodName("Austria", "1940-07-01", "pt")).toBe("Áustria (anexada pela Alemanha)");
    expect(periodName("Turkey (Ottoman Empire)", "1913-07-01", "en")).toBe("Ottoman Empire");
  });

  it("keeps the source's name when the table does not know the state", () => {
    expect(periodName("Atlantis", "1900-07-01", "pt")).toBe("Atlantis");
  });
});

describe("stateNameLocale", () => {
  it("is English on the English site and Portuguese otherwise", () => {
    expect(stateNameLocale("en")).toBe("en");
    expect(stateNameLocale("pt")).toBe("pt");
  });
});

describe("stateNamesSchema", () => {
  it("rejects periods out of order or a last period with an end", () => {
    const pt = { pt: "A", en: "A" };
    expect(stateNamesSchema.safeParse({ X: [{ ...pt, until: "1920-01-01" }] }).success).toBe(false);
    expect(stateNamesSchema.safeParse({ X: [pt, pt] }).success).toBe(false);
    expect(stateNamesSchema.safeParse({ X: [{ ...pt, until: "1920-01-01" }, { ...pt, until: "1910-01-01" }, pt] }).success).toBe(false);
    expect(stateNamesSchema.safeParse({ X: [{ ...pt, until: "1910-01-01" }, { ...pt, until: "1920-01-01" }, pt] }).success).toBe(true);
  });

  it("covers every state in the published borders", () => {
    const states = statesSchema.parse(read("europe-states.geojson"));
    const missing = [...new Set(states.features.map((f) => f.properties.name))].filter((name) => !(name in STATE_NAMES));
    expect(missing).toEqual([]);
    expect(stateNamesSchema.parse(read("state-names.json"))).toEqual(STATE_NAMES);
  });
});
