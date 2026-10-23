import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { MapScreenSkeleton } from "../MapScreenSkeleton";

const renderSkeleton = (footer?: boolean) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <MapScreenSkeleton footer={footer} />
    </NextIntlClientProvider>,
  );

describe("MapScreenSkeleton", () => {
  it("announces the loading over the map, the presentation and the controls", () => {
    const { container } = renderSkeleton();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    // The map, the intro (eyebrow, title, text) and the controls (three fields and a list).
    expect(container.querySelectorAll("[data-shape]")).toHaveLength(8);
  });

  it("draws the counters along the bottom when asked", () => {
    const { container } = renderSkeleton(true);
    expect(container.querySelectorAll("[data-shape]")).toHaveLength(13);
  });
});
