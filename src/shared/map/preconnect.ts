import { preconnect } from "react-dom";

import { TILES_ORIGIN } from "./mapStyle";

/**
 * Opens the connection to the tile server while MapLibre's code is still
 * downloading, so the first tiles do not wait for DNS and TLS. Call it while
 * rendering a map's placeholder: React turns it into a <link rel="preconnect">,
 * in the server HTML too. MapLibre fetches tiles with CORS, hence `anonymous`.
 */
export function preconnectTiles(): void {
  preconnect(TILES_ORIGIN, { crossOrigin: "anonymous" });
}
