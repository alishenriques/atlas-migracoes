import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { CollectionStats } from "../CollectionStats";

const stats = { artists: 31, works: 1417, exhibitions: 299, publications: 108, places: 73, originCountries: 11 };

describe("CollectionStats", () => {
  it("shows each counter in the locale's number format, with its icon", () => {
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <CollectionStats stats={stats} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("1.417")).toBeInTheDocument();
    expect(screen.getByText("obras")).toBeInTheDocument();
    expect(screen.getByText("países de origem")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-icon]")).toHaveLength(5);
    // The places are not a counter of the strip.
    expect(screen.queryByText("73")).not.toBeInTheDocument();
  });
});
