import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

const post = vi.fn();
vi.spyOn(axios, "create").mockReturnValue({ post } as unknown as ReturnType<typeof axios.create>);

const { graphqlRequest, GraphQLRequestError } = await import("./graphql-client");

describe("graphqlRequest", () => {
  it("validates and returns the data", async () => {
    post.mockResolvedValue({ data: { data: { health: "ok" } } });
    await expect(graphqlRequest(z.object({ health: z.string() }), "{ health }")).resolves.toEqual({ health: "ok" });
  });

  it("throws GraphQLRequestError with the API's messages", async () => {
    post.mockResolvedValue({ data: { data: null, errors: [{ message: "slug must not be empty" }] } });
    await expect(graphqlRequest(z.unknown(), "{ x }")).rejects.toThrow(GraphQLRequestError);
  });

  it("rejects a payload that does not match the schema", async () => {
    post.mockResolvedValue({ data: { data: { health: 1 } } });
    await expect(graphqlRequest(z.object({ health: z.string() }), "{ health }")).rejects.toThrow();
  });
});
