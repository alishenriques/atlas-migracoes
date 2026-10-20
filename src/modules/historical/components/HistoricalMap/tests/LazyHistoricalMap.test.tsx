import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LazyHistoricalMap } from "../LazyHistoricalMap";

vi.mock("../HistoricalMap", () => ({ HistoricalMap: () => <div role="region" aria-label="mapa" /> }));

describe("LazyHistoricalMap", () => {
  it("shows a placeholder while the map loads in the browser, then the map", async () => {
    const { container, findByRole } = render(
      <LazyHistoricalMap
        states={{ type: "FeatureCollection", features: [] }}
        birthplaces={[]}
        label="mapa"
        renderPlace={() => null}
        renderState={() => null}
      />,
    );
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(await findByRole("region", { name: "mapa" })).toBeInTheDocument();
    expect(document.head.querySelector('link[rel="preconnect"][href="https://tiles.openfreemap.org"]')).not.toBeNull();
  });
});
