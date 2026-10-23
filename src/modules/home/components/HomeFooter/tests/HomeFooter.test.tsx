import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import en from "@/locales/en.json";
import pt from "@/locales/pt.json";

import { HomeFooter } from "../HomeFooter";

describe("HomeFooter", () => {
  it("credits the developer with his AH logo, linking to the portfolio in a new tab", () => {
    render(
      <NextIntlClientProvider locale="pt" messages={pt}>
        <HomeFooter />
      </NextIntlClientProvider>,
    );
    const link = screen.getByRole("link", { name: "Desenvolvido por Alisson Henriques" });
    expect(link).toHaveAttribute("href", "https://www.alissonhenriques.dev");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("img", { name: "Alisson Henriques" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toContainElement(link);
  });

  it("is in English too", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <HomeFooter />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("link", { name: "Developed by Alisson Henriques" })).toBeInTheDocument();
  });
});
