import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { HomeSkeleton } from "../HomeSkeleton";

describe("HomeSkeleton", () => {
  it("draws Explorar in skeleton, with the counters along the bottom", () => {
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <HomeSkeleton />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("status"));
    expect(container.querySelectorAll("[data-shape]")).toHaveLength(13);
  });
});
