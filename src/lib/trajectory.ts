import type { FuzzyDate, MapArtist, Place } from "@/lib/schemas";

export type GeoPlace = Place & { lat: number; lng: number };

export type StopKind = "birth" | "exhibition" | "death";

/** A known point of an artist's life: where and when (as exactly as the source says). */
export type Stop = {
  kind: StopKind;
  place: GeoPlace;
  date: FuzzyDate;
  /** Exhibition title, for exhibition stops. */
  title?: string;
};

export type Trajectory = {
  artist: MapArtist;
  /** Birth first, then exhibitions in date order, then death. */
  stops: Stop[];
  /** Exhibitions after the artist's death: their works travelled, not the artist. Not drawn. */
  posthumous: number;
  /** Points that cannot be drawn: no date, or a place without coordinates. */
  undrawn: number;
};

export type Period = [from: number, to: number];

/** The period the platform covers. */
export const FULL_PERIOD: Period = [1918, 1989];

export const isGeocoded = (place: Place | null): place is GeoPlace =>
  place !== null && place.lat !== null && place.lng !== null;

const lastYear = (date: FuzzyDate) => date.endYear ?? date.year;

/**
 * Builds the trajectory from the points the collection documents: birth,
 * exhibitions of the artist's works during their lifetime, and death. The data
 * has no arrival year or route, so nothing between those points is inferred.
 */
export function buildTrajectory(artist: MapArtist): Trajectory {
  const deathYear = lastYear(artist.deathDate);
  const stops: Stop[] = [];
  let posthumous = 0;
  let undrawn = 0;

  if (isGeocoded(artist.birthPlace)) {
    stops.push({ kind: "birth", place: artist.birthPlace, date: artist.birthDate });
  } else {
    undrawn += 1;
  }

  for (const exhibition of artist.exhibitions) {
    const year = exhibition.startDate.year;
    if (year !== null && deathYear !== null && year > deathYear) {
      posthumous += 1;
    } else if (year === null || !isGeocoded(exhibition.place)) {
      undrawn += 1;
    } else {
      stops.push({ kind: "exhibition", place: exhibition.place, date: exhibition.startDate, title: exhibition.title });
    }
  }

  const exhibitions = stops.filter((stop) => stop.kind === "exhibition");
  exhibitions.sort((a, b) => (a.date.year ?? 0) - (b.date.year ?? 0));
  const ordered = [...stops.filter((stop) => stop.kind === "birth"), ...exhibitions];

  if (isGeocoded(artist.deathPlace) && artist.deathDate.year !== null) {
    ordered.push({ kind: "death", place: artist.deathPlace, date: artist.deathDate });
  } else if (artist.deathPlace !== null || artist.deathDate.year !== null) {
    undrawn += 1;
  }

  return { artist, stops: ordered, posthumous, undrawn };
}

/** Whether the artist's lifetime touches the period (an unknown end is open). */
export function livedDuring(trajectory: Trajectory, [from, to]: Period): boolean {
  const born = trajectory.artist.birthDate.year;
  const died = lastYear(trajectory.artist.deathDate);
  return (born === null || born <= to) && (died === null || died >= from);
}

/**
 * The stops shown for a period: the birthplace stays as the point of origin,
 * the rest only when their year falls inside the period.
 */
export function stopsInPeriod(trajectory: Trajectory, [from, to]: Period): Stop[] {
  return trajectory.stops.filter((stop) => {
    if (stop.kind === "birth") return stop.date.year === null || stop.date.year <= to;
    const year = stop.date.year;
    return year !== null && year >= from && year <= to;
  });
}

export type Filters = {
  /** Country of birth as written in the source; empty for all. */
  originCountry: string;
  period: Period;
};

export type VisibleTrajectory = Trajectory & { visible: Stop[] };

export function filterTrajectories(trajectories: Trajectory[], filters: Filters): VisibleTrajectory[] {
  return trajectories
    .filter((t) => !filters.originCountry || t.artist.birthPlace?.country === filters.originCountry)
    .filter((t) => livedDuring(t, filters.period))
    .map((t) => ({ ...t, visible: stopsInPeriod(t, filters.period) }));
}

/** Country name the collection uses for Brazil. */
export const BRAZIL = "Brasil";

/**
 * The migration the map highlights: from the birthplace to the first
 * documented place in Brazil. Null when the artist was born in Brazil, has no
 * documented place in Brazil, or either end is outside the shown period.
 */
export function migrationLeg({ stops, visible }: VisibleTrajectory): [Stop, Stop] | null {
  const birth = stops.find((stop) => stop.kind === "birth");
  if (!birth || birth.place.country === BRAZIL) return null;
  const arrival = stops.find((stop) => stop.place.country === BRAZIL);
  if (!arrival || !visible.includes(birth) || !visible.includes(arrival)) return null;
  return [birth, arrival];
}

/** Countries of birth present in the data, alphabetical. */
export function originCountries(artists: MapArtist[], locale: string): string[] {
  const countries = new Set(artists.flatMap((artist) => (artist.birthPlace ? [artist.birthPlace.country] : [])));
  return [...countries].sort((a, b) => a.localeCompare(b, locale));
}

/** The place as written in the source, with the present-day name when the source gives one. */
export const placeName = (place: Place) => (place.currentName ? `${place.label} (${place.currentName})` : place.label);
