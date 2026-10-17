import axios from "axios";
import { z, type ZodType } from "zod";

import { loadPublicEnv } from "./env";

const graphqlErrorSchema = z.object({ message: z.string() });
const graphqlResponseSchema = z.object({
  data: z.unknown().nullable().optional(),
  errors: z.array(graphqlErrorSchema).optional(),
});

export class GraphQLRequestError extends Error {
  constructor(messages: string[]) {
    super(messages.join("; "));
    this.name = "GraphQLRequestError";
  }
}

const client = axios.create({
  baseURL: loadPublicEnv().NEXT_PUBLIC_GRAPHQL_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

/** Posts a GraphQL query and validates the payload against `schema`. */
export async function graphqlRequest<T>(
  schema: ZodType<T>,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await client.post("", { query, variables });
  const body = graphqlResponseSchema.parse(response.data);

  if (body.errors?.length) {
    throw new GraphQLRequestError(body.errors.map((error) => error.message));
  }

  return schema.parse(body.data);
}
