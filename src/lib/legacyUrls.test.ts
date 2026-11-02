import { describe, expect, it } from "vitest";

import { legacyResearchUrl } from "./legacyUrls";

const at = (path: string) => legacyResearchUrl(new URL(path, "https://atlas.example"))?.toString() ?? null;

describe("legacyResearchUrl", () => {
  it("sends the old research link to the artist's own page, in each language", () => {
    expect(at("/pt/ia-relacional?artista=lasar-segall")).toBe("https://atlas.example/pt/ia-relacional/lasar-segall");
    expect(at("/en/relational-ai/?artista=lasar-segall")).toBe("https://atlas.example/en/relational-ai/lasar-segall");
  });

  it("keeps the rest of the query and escapes the slug", () => {
    expect(at("/pt/ia-relacional?artista=a%2Fb&utm=x")).toBe("https://atlas.example/pt/ia-relacional/a%2Fb?utm=x");
  });

  it("leaves every other URL alone", () => {
    expect(at("/pt/ia-relacional")).toBeNull();
    expect(at("/pt/ia-relacional?artista=")).toBeNull();
    expect(at("/pt/rede?artista=lasar-segall")).toBeNull();
    expect(at("/en/ia-relacional?artista=lasar-segall")).toBeNull();
    expect(at("/pt/ia-relacional/lasar-segall?artista=x")).toBeNull();
  });
});
