import { describe, expect, it } from "vitest";

import en from "./en.json";
import pt from "./pt.json";

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

describe("locales", () => {
  it("pt and en have the same keys", () => {
    expect(keys(en).sort()).toEqual(keys(pt).sort());
  });
});
