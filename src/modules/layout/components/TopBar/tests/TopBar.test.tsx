import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const topBar = () => (
  <NextIntlClientProvider locale="pt" messages={messages}>
    <TopBar />
  </NextIntlClientProvider>
);

function renderTopBar() {
  return render(topBar());
}

describe("TopBar", () => {
  beforeEach(() => {
    navigation.pathname = "/trajetorias";
    navigation.params = {};
  });

  it("links to the home page and every MVP screen inside a labelled nav", () => {
    renderTopBar();
    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(nav.querySelectorAll("a")).toHaveLength(7);
    expect(nav.querySelector("a")).toHaveTextContent("Início");
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute("href", "/explorar");
    expect(screen.getByRole("link", { name: "Camada Histórica" })).toHaveAttribute("href", "/camada-historica");
    expect(screen.getByRole("link", { name: "Rede Relacional" })).toHaveAttribute("href", "/rede");
    expect(screen.getByRole("link", { name: "IA Relacional" })).toHaveAttribute("href", "/ia-relacional");
  });

  it("links home with the Atlas mark and the site name", () => {
    renderTopBar();
    const brand = screen.getByRole("link", { name: "Atlas Migrações Leste-Sul · 1918–1989" });
    expect(brand).toHaveAttribute("href", "/");
    expect(brand.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(brand).toHaveTextContent("Atlas Migrações");
    expect(brand).toHaveTextContent("Leste-Sul · 1918–1989");
  });

  it("marks the current screen", () => {
    renderTopBar();
    expect(screen.getByRole("link", { name: "Trajetórias" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Explorar" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("marks Início only on the home page", () => {
    navigation.pathname = "/";
    renderTopBar();
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { current: "page" })).toHaveLength(1);
  });

  it("starts with a link that skips the menu to the page's content", () => {
    renderTopBar();
    const skip = screen.getAllByRole("link")[0];
    expect(skip).toHaveTextContent("Pular para o conteúdo");
    expect(skip).toHaveAttribute("href", "#conteudo");
  });

  it("offers the same page in English", () => {
    renderTopBar();
    expect(screen.getByRole("link", { name: "EN (Idioma: English)" })).toHaveAttribute("href", "/en/trajetorias");
  });

  it("keeps the section marked and the record's URL on an artist record", () => {
    navigation.pathname = "/trajetorias/[slug]";
    navigation.params = { locale: "pt", slug: "lasar-segall" };
    renderTopBar();
    expect(screen.getByRole("link", { name: "Trajetórias" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "EN (Idioma: English)" })).toHaveAttribute(
      "href",
      "/en/trajetorias/lasar-segall",
    );
  });

  describe("menu on small screens", () => {
    it("folds the screens behind a Menu button that controls the nav", async () => {
      renderTopBar();
      const button = screen.getByRole("button", { name: "Menu" });
      const nav = screen.getByRole("navigation", { name: "Navegação principal" });
      expect(button).toHaveAttribute("aria-controls", nav.id);
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(nav).toHaveClass("hidden");

      await userEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(nav).not.toHaveClass("hidden");

      await userEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("closes on Escape and gives the focus back to the button", async () => {
      renderTopBar();
      const button = screen.getByRole("button", { name: "Menu" });
      await userEvent.click(button);
      screen.getByRole("link", { name: "Sobre" }).focus();
      await userEvent.keyboard("{Escape}");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveFocus();
    });

    it("ignores other keys", async () => {
      renderTopBar();
      const button = screen.getByRole("button", { name: "Menu" });
      await userEvent.click(button);
      await userEvent.keyboard("{Tab}");
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("closes on a touch outside the header, not inside it", async () => {
      renderTopBar();
      const button = screen.getByRole("button", { name: "Menu" });
      await userEvent.click(button);
      fireEvent.pointerDown(screen.getByRole("navigation", { name: "Navegação principal" }));
      expect(button).toHaveAttribute("aria-expanded", "true");
      fireEvent.pointerDown(document.body);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("closes when the page changes", async () => {
      const { rerender } = renderTopBar();
      const button = screen.getByRole("button", { name: "Menu" });
      await userEvent.click(button);
      navigation.pathname = "/sobre";
      rerender(topBar());
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute("aria-current", "page");
    });
  });
});
