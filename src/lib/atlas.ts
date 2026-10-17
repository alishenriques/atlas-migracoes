import { graphqlRequest } from "./graphql-client";
import { overviewSchema, type Overview } from "./schemas";

const OVERVIEW_QUERY = /* GraphQL */ `
  query Overview {
    meta {
      source
    }
    stats {
      artists
      works
      exhibitions
      publications
      places
      originCountries
    }
  }
`;

/** Collection counters and where the data comes from (real or demo). */
export function getOverview(): Promise<Overview> {
  return graphqlRequest(overviewSchema, OVERVIEW_QUERY);
}
