import { setWorkerUrl } from "maplibre-gl";

// MapLibre 6 looks for its worker next to its own module, which the bundler
// moves; point it at the worker file emitted as a static asset instead.
// Import this module (for its side effect) from every client-only map.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
