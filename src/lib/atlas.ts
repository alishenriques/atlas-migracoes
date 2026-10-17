import { graphqlRequest } from "./graphql-client";
import { mapDataSchema, overviewSchema, type MapData, type Overview } from "./schemas";

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

const MAP_QUERY = /* GraphQL */ `
  fragment MapPlace on Place {
    id
    label
    country
    currentName
    lat
    lng
  }

  fragment MapDate on FuzzyDate {
    raw
    year
    endYear
    iso
    precision
  }

  query ExplorarMap {
    artists {
      slug
      name
      birthPlace {
        ...MapPlace
      }
      birthDate {
        ...MapDate
      }
      deathPlace {
        ...MapPlace
      }
      deathDate {
        ...MapDate
      }
      exhibitions {
        id
        title
        startDate {
          ...MapDate
        }
        place {
          ...MapPlace
        }
      }
    }
  }
`;

/** Every artist with the known points of their trajectory, for the Explorar map. */
export function getMapData(): Promise<MapData> {
  return graphqlRequest(mapDataSchema, MAP_QUERY);
}
