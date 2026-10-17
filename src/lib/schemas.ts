import { z } from "zod";

// Mirrors the API's GraphQL types (atlas-migracoes-api, src/graphql/schema.ts).
// Responses are validated here too, even though the API already validates them.

export const dataSourceSchema = z.enum(["database", "demo"]);

export const statsSchema = z.object({
  artists: z.number().int(),
  works: z.number().int(),
  exhibitions: z.number().int(),
  publications: z.number().int(),
  places: z.number().int(),
  originCountries: z.number().int(),
});

export const overviewSchema = z.object({
  meta: z.object({ source: dataSourceSchema }),
  stats: statsSchema,
});

export type DataSource = z.infer<typeof dataSourceSchema>;
export type Stats = z.infer<typeof statsSchema>;
export type Overview = z.infer<typeof overviewSchema>;
