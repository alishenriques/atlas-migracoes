import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { HistoricalSkeleton } from "../HistoricalSkeleton";

describe("HistoricalSkeleton", () => {
  it("draws Camada Histórica in skeleton, with no bar along the bottom", () => {
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <HistoricalSkeleton />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("status"));
    expect(container.querySelectorAll("[data-shape]")).toHaveLength(8);
  });
});
