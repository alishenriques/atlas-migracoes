import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { NetworkSkeleton } from "../NetworkSkeleton";

describe("NetworkSkeleton", () => {
  it("shows the presentation, with the controls and the graph in skeleton", () => {
    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <NetworkSkeleton />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Rede Relacional" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
    expect(container.querySelectorAll("[data-shape]")).toHaveLength(4);
  });
});
