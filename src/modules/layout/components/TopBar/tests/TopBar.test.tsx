import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import messages from "@/locales/pt.json";

import { TopBar } from "../TopBar";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/trajetorias",
  Link: ({ children, href, locale, ...props }: { children: React.ReactNode; href: string; locale?: string }) => (
    <a href={locale ? `/${locale}${href}` : href} {...props}>
      {children}
    </a>
  ),
}));

function renderTopBar() {
  return render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <TopBar />
    </NextIntlClientProvider>,
  );
}

describe("TopBar", () => {
  it("links to every MVP screen inside a labelled nav", () => {
    renderTopBar();
    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(nav.querySelectorAll("a")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Camada Histórica" })).toHaveAttribute("href", "/camada-historica");
  });

  it("marks the current screen", () => {
    renderTopBar();
    expect(screen.getByRole("link", { name: "Trajetórias" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Explorar" })).not.toHaveAttribute("aria-current");
  });

  it("offers the same page in English", () => {
    renderTopBar();
    expect(screen.getByRole("link", { name: "Idioma: English" })).toHaveAttribute("href", "/en/trajetorias");
  });
});
