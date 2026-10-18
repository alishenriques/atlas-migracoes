import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/locales/pt.json";

import { ArtistPicker } from "../ArtistPicker";

const push = vi.fn();
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }));

const artists = [
  { slug: "lasar-segall", name: "Lasar Segall" },
  { slug: "anita-malfatti", name: "Anita Malfatti" },
];

const renderPicker = (selected: string | null) =>
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <ArtistPicker artists={artists} selected={selected} />
    </NextIntlClientProvider>,
  );

beforeEach(() => push.mockReset());

describe("ArtistPicker", () => {
  it("lists the artists by name after the placeholder", () => {
    renderPicker(null);
    const select = screen.getByRole("combobox", { name: "Artista" });
    expect(select).toHaveValue("");
    expect([...(select as HTMLSelectElement).options].map((option) => option.text)).toEqual([
      "Escolha um artista",
      "Anita Malfatti",
      "Lasar Segall",
    ]);
  });

  it("puts the chosen artist in the URL", () => {
    renderPicker(null);
    fireEvent.change(screen.getByRole("combobox", { name: "Artista" }), { target: { value: "lasar-segall" } });
    expect(push).toHaveBeenCalledWith({ pathname: "/ia-relacional", query: { artista: "lasar-segall" } });
  });

  it("goes back to no artist when the placeholder is chosen", () => {
    renderPicker("lasar-segall");
    expect(screen.getByRole("combobox", { name: "Artista" })).toHaveValue("lasar-segall");
    fireEvent.change(screen.getByRole("combobox", { name: "Artista" }), { target: { value: "" } });
    expect(push).toHaveBeenCalledWith("/ia-relacional");
  });
});
