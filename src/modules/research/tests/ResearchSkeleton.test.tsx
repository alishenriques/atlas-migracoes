import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { ResearchSkeleton } from "../ResearchSkeleton";

describe("ResearchSkeleton", () => {
  it("shows the presentation, with the artist picker in skeleton", () => {
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <ResearchSkeleton />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "IA Relacional" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    expect(container.querySelectorAll("[data-shape]")).toHaveLength(2);
  });
});
