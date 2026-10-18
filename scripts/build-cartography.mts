/**
 * Builds the historical state borders of Europe used by the Camada Histórica
 * from CShapes 2.0 (ETH Zürich, https://icr.ethz.ch/data/cshapes/): clipped to
 * Europe, simplified, one polygon per version of each state with the days it
 * was valid.
 *
 *   yarn build:cartography ~/atlas/cshapes/CShapes-2.0.geojson
 *
 * Download CShapes-2.0.geojson from the page above first and keep it outside
 * the repository. The output is public/cartography/europe-states.geojson.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import mapshaper from "mapshaper";
import { z } from "zod";

/** West, south, east, north: Europe from the Atlantic islands to the Urals and the Caucasus. */
const EUROPE_BBOX = [-25, 33, 60, 72];
/** Share of vertices kept by the simplification. */
const SIMPLIFY = "10%";
const OUT_FILE = join(import.meta.dirname, "..", "public", "cartography", "europe-states.geojson");

// CShapes' gwsdate/gwedate strings are shifted by a time zone; the integer fields are exact.
const featureSchema = z.object({
  type: z.literal("Feature"),
  properties: z.object({
    cntry_name: z.string(),
    gwsyear: z.number().int(),
    gwsmonth: z.number().int(),
    gwsday: z.number().int(),
    gweyear: z.number().int(),
    gwemonth: z.number().int(),
    gweday: z.number().int(),
  }),
  geometry: z.object({ type: z.enum(["Polygon", "MultiPolygon"]), coordinates: z.array(z.unknown()) }).nullable(),
});
const collectionSchema = z.object({ type: z.literal("FeatureCollection"), features: z.array(featureSchema) });

const isoDay = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const input = process.argv[2];
if (!input) {
  console.error("Usage: yarn build:cartography <path to CShapes-2.0.geojson>");
  process.exit(1);
}

const source = collectionSchema.parse(JSON.parse(await readFile(input, "utf8")));

// Keep only the fields the app reads: the state's name and the days its border was valid.
const normalized = {
  type: "FeatureCollection",
  features: source.features.map(({ properties: p, geometry }) => ({
    type: "Feature",
    properties: {
      name: p.cntry_name,
      start: isoDay(p.gwsyear, p.gwsmonth, p.gwsday),
      end: isoDay(p.gweyear, p.gwemonth, p.gweday),
    },
    geometry,
  })),
};

const commands = [
  "-i in.json",
  `-clip bbox=${EUROPE_BBOX.join(",")}`,
  `-simplify ${SIMPLIFY} keep-shapes`,
  "-o out.json format=geojson precision=0.001",
].join(" ");
const output = await mapshaper.applyCommands(commands, { "in.json": normalized });
const result = output["out.json"];
if (result === undefined) throw new Error("mapshaper produced no output");

// States wholly outside Europe come back with a null geometry: drop them.
const clipped = z.object({ features: z.array(z.object({ geometry: z.unknown() }).passthrough()) }).parse(JSON.parse(result));
const features = clipped.features.filter((feature) => feature.geometry !== null);
const text = JSON.stringify({ type: "FeatureCollection", features });
await writeFile(OUT_FILE, `${text}\n`);
console.log(`${source.features.length} state versions in the world, ${features.length} in Europe → ${OUT_FILE} (${text.length} bytes)`);
