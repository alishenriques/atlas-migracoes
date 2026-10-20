import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LazyTrajectoryMap } from "../LazyTrajectoryMap";

vi.mock("../TrajectoryMap", () => ({ TrajectoryMap: () => <div role="region" aria-label="mapa" /> }));

describe("LazyTrajectoryMap", () => {
  it("connects to the tile server while the map loads in the browser, then shows the map", async () => {
    const { findByRole } = render(
      <LazyTrajectoryMap trajectories={[]} label="mapa" selectedSlug={null} renderPlace={() => null} />,
    );
    expect(document.head.querySelector('link[rel="preconnect"][href="https://tiles.openfreemap.org"]')).not.toBeNull();
    expect(await findByRole("region", { name: "mapa" })).toBeInTheDocument();
  });
});
