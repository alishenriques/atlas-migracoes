import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { FuzzyDate, MapArtist, Place } from "@/lib/schemas";
import messages from "@/locales/pt.json";
import type { TrajectoryMapProps } from "@/shared/components/TrajectoryMap";

import { RecordMap } from "../RecordMap";

// MapLibre needs WebGL; the stub shows what the map receives and the popups it would open.
vi.mock("@/shared/components/TrajectoryMap", () => ({
  TrajectoryMap: ({ trajectories, selectedSlug, label, renderPlace }: TrajectoryMapProps) => (
    <div role="region" aria-label={label} data-selected={selectedSlug ?? ""}>
      {trajectories[0]?.visible.map((stop) => stop.kind).join(",")}
      {(["sp", "nowhere"] as const).map((id) => (
        <div key={id} data-testid={`popup-${id}`}>
          {renderPlace(id) as ReactNode}
        </div>
      ))}
    </div>
  ),
}));

const date = (year: number | null): FuzzyDate => ({
  raw: null,
  year,
  endYear: year,
  iso: null,
  precision: year === null ? "unknown" : "year",
});
const place = (id: string, label: string, lat: number, lng: number): Place => ({
  id,
  label,
  country: "Brasil",
  currentName: null,
  lat,
  lng,
});

const artist: MapArtist = {
  slug: "lasar-segall",
  name: "Lasar Segall",
  birthPlace: { ...place("vilna", "Vilna", 54.7, 25.3), country: "Polônia" },
  birthDate: date(1889),
  deathPlace: place("sp", "São Paulo", -23.5, -46.6),
  deathDate: date(1957),
  exhibitions: [{ id: "EX.1", title: "Bienal", startDate: date(1951), place: place("sp", "São Paulo", -23.5, -46.6) }],
};

describe("RecordMap", () => {
  it("draws the artist's whole trajectory, selected", () => {
    render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <RecordMap artist={artist} label="Mapa da trajetória" />
      </NextIntlClientProvider>,
    );

    const map = screen.getByRole("region", { name: "Mapa da trajetória" });
    expect(map).toHaveAttribute("data-selected", "lasar-segall");
    expect(map).toHaveTextContent("birth,exhibition,death");
  });

  it("lists every stop at the clicked place, and nothing for an unknown place", () => {
    render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <RecordMap artist={artist} label="Mapa da trajetória" />
      </NextIntlClientProvider>,
    );

    const popup = screen.getByTestId("popup-sp");
    expect(popup).toHaveTextContent("São Paulo");
    expect(popup).toHaveTextContent("Exposição, 1951: Bienal");
    expect(popup).toHaveTextContent("Morte, 1957");
    expect(screen.getByTestId("popup-nowhere")).toBeEmptyDOMElement();
  });
});
