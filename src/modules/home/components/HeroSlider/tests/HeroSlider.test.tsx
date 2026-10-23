import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import messages from "@/locales/pt.json";

import { HeroSlider } from "../HeroSlider";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderSlider() {
  return render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <HeroSlider />
    </NextIntlClientProvider>,
  );
}

const headline = () => screen.getByRole("heading", { level: 2 }).textContent;
const progress = () => screen.getByTestId("hero-progress");
// jsdom has no AnimationEvent, so React listens for the vendor-prefixed name instead of "animationend".
const endProgress = () => fireEvent(progress(), new Event("webkitAnimationEnd", { bubbles: true }));

describe("HeroSlider", () => {
  it("names the Atlas and opens on the collection, leading to Explorar", () => {
    const { container } = renderSlider();
    expect(screen.getByRole("heading", { level: 1, name: "Atlas Migrações Leste-Sul" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Apresentação do projeto" })).toHaveAttribute(
      "aria-roledescription",
      "carrossel",
    );
    expect(headline()).toBe("Trajetórias de artistas do Leste Europeu e da Áustria no Brasil");
    expect(screen.getByText("Leste Europeu e da Áustria")).toHaveClass("text-accent");
    expect(screen.getByRole("group", { name: "1 de 4" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorar o mapa" })).toHaveAttribute("href", "/explorar");
    expect(container.querySelector("[class*='bg-[url(/home/mapa-noturno-sm.webp)]']")).toHaveClass("scale-100");
  });

  it("moves with the arrows, wrapping around, and zooms into the part of the map each slide talks about", () => {
    const { container } = renderSlider();
    const backdrop = () => container.querySelector("[class*='bg-[url(/home/mapa-noturno-sm.webp)]']");

    fireEvent.click(screen.getByRole("button", { name: "Próximo slide" }));
    expect(headline()).toMatch(/A digitalização ampliou o acesso/);
    expect(screen.getByRole("link", { name: "Ver as trajetórias" })).toHaveAttribute("href", "/trajetorias");
    expect(backdrop()).toHaveClass("scale-[1.2]", "origin-[63%_14%]");

    fireEvent.click(screen.getByRole("button", { name: "Slide anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Slide anterior" }));
    expect(headline()).toMatch(/A IA como ferramenta/);
    expect(screen.getByRole("group", { name: "4 de 4" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Conhecer a IA Relacional" })).toHaveAttribute("href", "/ia-relacional");
  });

  it("jumps to a slide from its dot, marking the current one", () => {
    renderSlider();
    const dot = screen.getByRole("button", { name: "Ir para o slide 3: Objetivo" });
    expect(dot).not.toHaveAttribute("aria-current");

    fireEvent.click(dot);

    expect(headline()).toMatch(/Da catalogação estática/);
    expect(dot).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Ir para o slide 1: O acervo" })).not.toHaveAttribute("aria-current");
  });

  it("advances when the progress line ends, and only announces the slide while paused", () => {
    renderSlider();
    expect(progress()).toHaveStyle({ animationPlayState: "running" });
    expect(screen.getByRole("group", { name: "1 de 4" })).toHaveAttribute("aria-live", "off");

    endProgress();
    expect(headline()).toMatch(/A digitalização/);

    fireEvent.click(screen.getByRole("button", { name: "Pausar a apresentação" }));
    expect(progress()).toHaveStyle({ animationPlayState: "paused" });
    expect(screen.getByRole("group", { name: "2 de 4" })).toHaveAttribute("aria-live", "polite");

    // A manual change keeps it paused.
    fireEvent.click(screen.getByRole("button", { name: "Próximo slide" }));
    expect(progress()).toHaveStyle({ animationPlayState: "paused" });

    fireEvent.click(screen.getByRole("button", { name: "Retomar a apresentação" }));
    expect(progress()).toHaveStyle({ animationPlayState: "running" });
  });
});
