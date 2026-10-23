import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { ArtistRecordSkeleton } from "../ArtistRecordSkeleton";
import { TrajectoryIndexSkeleton } from "../TrajectoryIndexSkeleton";

const renderPt = (node: React.ReactNode) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );

describe("TrajectoryIndexSkeleton", () => {
  it("shows the presentation and the artist cards in skeleton", () => {
    const { container } = renderPt(<TrajectoryIndexSkeleton />);
    expect(screen.getByRole("heading", { level: 1, name: "Trajetórias" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    expect(container.querySelectorAll('[data-shape="circle"]')).toHaveLength(12);
  });
});

describe("ArtistRecordSkeleton", () => {
  it("draws the record in skeleton under its screen label", () => {
    const { container } = renderPt(<ArtistRecordSkeleton />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    expect(screen.getByText("Trajetória")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-shape]").length).toBeGreaterThan(5);
  });
});
