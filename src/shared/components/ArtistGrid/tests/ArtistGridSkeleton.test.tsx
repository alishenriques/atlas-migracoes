import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { ArtistGridSkeleton } from "../ArtistGridSkeleton";

describe("ArtistGridSkeleton", () => {
  it("draws the search box and a dozen cards under one status", () => {
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <ArtistGridSkeleton />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    expect(container.querySelectorAll('[data-shape="circle"]')).toHaveLength(12);
  });
});
