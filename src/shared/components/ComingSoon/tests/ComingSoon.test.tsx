import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { ComingSoon } from "../ComingSoon";

describe("ComingSoon", () => {
  it("shows the screen title as the page heading", () => {
    render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <ComingSoon title="Trajetórias" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Trajetórias" })).toBeInTheDocument();
    expect(screen.getByText("Em construção")).toBeInTheDocument();
  });
});
