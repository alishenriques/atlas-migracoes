import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import messages from "@/locales/pt.json";

import { ResearchIndexSkeleton } from "../ResearchIndexSkeleton";
import { ResearchSkeleton } from "../ResearchSkeleton";

// The cards' grid shares a module with the skeleton; its links are not drawn here.
vi.mock("@/i18n/navigation", () => ({ Link: () => null }));

const renderPt = (node: React.ReactNode) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );

describe("ResearchIndexSkeleton", () => {
  it("shows the presentation, with the artist cards in skeleton", () => {
    const { container } = renderPt(<ResearchIndexSkeleton />);
    expect(screen.getByRole("heading", { level: 1, name: "IA Relacional" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    expect(container.querySelectorAll('[data-shape="circle"]')).toHaveLength(12);
  });
});

describe("ResearchSkeleton", () => {
  it("shows the presentation, with the artist's findings in skeleton", () => {
    renderPt(<ResearchSkeleton />);
    expect(screen.getByRole("heading", { level: 1, name: "IA Relacional" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
  });
});
