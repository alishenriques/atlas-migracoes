import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { Loading } from "../Loading";

describe("Loading", () => {
  it("announces the loading once and holds the skeletons", () => {
    render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <Loading className="grid">
          <span aria-hidden="true" data-testid="bone" />
        </Loading>
      </NextIntlClientProvider>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Carregando…");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveClass("grid");
    expect(screen.getByTestId("bone")).toBeInTheDocument();
  });
});
