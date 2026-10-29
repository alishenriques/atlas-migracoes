import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import messages from "@/locales/pt.json";

import { ArtistGrid, type ArtistCard } from "../ArtistGrid";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: { params: { slug: string } } }) => (
    <a href={`/trajetorias/${href.params.slug}`} {...props}>
      {children}
    </a>
  ),
}));

const artists: ArtistCard[] = [
  { slug: "lasar-segall", name: "Lasar Segall", meta: "Lituânia · 1889–1957", photo: null },
  { slug: "samson-flexor", name: "Samson Flexor", meta: "Moldávia · 1907–1971", photo: null },
  { slug: "yolanda-mohalyi", name: "Yolanda Mohályi", meta: "Hungria · 1909–1978", photo: null },
];

function setup() {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <ArtistGrid artists={artists} />
    </NextIntlClientProvider>,
  );
  return screen.getByRole("searchbox", { name: "Buscar artista" });
}

const names = () => screen.queryAllByRole("link").map((link) => link.textContent);

describe("ArtistGrid", () => {
  it("lists every artist with the total before a search", () => {
    setup();
    expect(names()).toHaveLength(3);
    expect(screen.getByText("3 artistas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lasar Segall/ })).toHaveAttribute("href", "/trajetorias/lasar-segall");
  });

  it("filters by name, ignoring case and accents", () => {
    const search = setup();
    fireEvent.change(search, { target: { value: "  MOHALY " } });
    expect(names()).toEqual([expect.stringContaining("Yolanda Mohályi")]);
    expect(screen.getByText("1 de 3 artistas")).toBeInTheDocument();
  });

  it("says when no artist matches, and the clear button brings the list back", () => {
    const search = setup();
    fireEvent.change(search, { target: { value: "Portinari" } });
    expect(names()).toHaveLength(0);
    expect(screen.getByText("Nenhum artista encontrado para “Portinari”.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(names()).toHaveLength(3);
  });
});
