import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/locales/pt.json";

import { TopBar } from "../TopBar";

const navigation = vi.hoisted(() => ({ pathname: "/trajetorias", params: {} as Record<string, string> }));

vi.mock("next/navigation", () => ({ useParams: () => navigation.params }));

type Href = string | { pathname: string; params?: Record<string, string> };
const toUrl = (href: Href) =>
  typeof href === "string"
    ? href
    : Object.entries(href.params ?? {}).reduce((url, [key, value]) => url.replace(`[${key}]`, value), href.pathname);

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => navigation.pathname,
  Link: ({ children, href, locale, ...props }: { children: React.ReactNode; href: Href; locale?: string }) => (
    <a href={locale ? `/${locale}${toUrl(href)}` : toUrl(href)} {...props}>
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
  beforeEach(() => {
    navigation.pathname = "/trajetorias";
    navigation.params = {};
  });

  it("links to every MVP screen inside a labelled nav", () => {
    renderTopBar();
    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(nav.querySelectorAll("a")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Camada Histórica" })).toHaveAttribute("href", "/camada-historica");
    expect(screen.getByRole("link", { name: "Rede Relacional" })).toHaveAttribute("href", "/rede");
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

  it("keeps the section marked and the record's URL on an artist record", () => {
    navigation.pathname = "/trajetorias/[slug]";
    navigation.params = { locale: "pt", slug: "lasar-segall" };
    renderTopBar();
    expect(screen.getByRole("link", { name: "Trajetórias" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Idioma: English" })).toHaveAttribute(
      "href",
      "/en/trajetorias/lasar-segall",
    );
  });
});
