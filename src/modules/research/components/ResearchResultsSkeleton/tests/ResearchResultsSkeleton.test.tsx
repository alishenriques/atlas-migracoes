import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { ResearchResultsSkeleton } from "../ResearchResultsSkeleton";

describe("ResearchResultsSkeleton", () => {
  it("announces the loading and draws the columns of the findings", () => {
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <ResearchResultsSkeleton />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    expect(container.querySelectorAll("[data-shape]")).toHaveLength(7);
  });
});
