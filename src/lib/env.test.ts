import { describe, expect, it } from "vitest";

import { loadPublicEnv } from "./env";

describe("loadPublicEnv", () => {
  it("defaults to the local API and site", () => {
    expect(loadPublicEnv({})).toEqual({
      NEXT_PUBLIC_GRAPHQL_URL: "http://localhost:4000/graphql",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
  });

  it("rejects a malformed URL", () => {
    expect(() => loadPublicEnv({ NEXT_PUBLIC_GRAPHQL_URL: "not a url" })).toThrow();
  });
});
