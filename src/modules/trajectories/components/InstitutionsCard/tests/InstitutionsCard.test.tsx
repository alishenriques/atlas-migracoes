import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";
import type { InstitutionSummary } from "@/modules/trajectories/utils/profile";

import { InstitutionsCard } from "../InstitutionsCard";

const sp = { id: "sp", label: "São Paulo", country: "Brasil", currentName: null, lat: null, lng: null };
const institution = (name: string, extra: Partial<InstitutionSummary> = {}): InstitutionSummary => ({
  name,
  place: null,
  exhibitions: 1,
  years: null,
  ...extra,
});

function setup(institutions: InstitutionSummary[]) {
  render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <InstitutionsCard institutions={institutions} />
    </NextIntlClientProvider>,
  );
}

describe("InstitutionsCard", () => {
  it("names each institution with where, how often and when", () => {
    setup([
      institution("MAM", { place: sp, exhibitions: 3, years: { from: 1951, to: 1961 } }),
      institution("Bienal", { exhibitions: 1, years: { from: 1955, to: 1955 } }),
      institution("Galeria X"),
    ]);
    expect(screen.getByRole("heading", { level: 2, name: "Instituições relacionadas" })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "MAMSão Paulo, Brasil · 3 exposições · 1951–1961",
      "Bienal1 exposição · 1955",
      "Galeria X1 exposição",
    ]);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows five, then all of them on See all", () => {
    setup(Array.from({ length: 7 }, (_, index) => institution(`Instituição ${index + 1}`)));
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(5);

    const more = screen.getByRole("button", { name: /Ver todas \(7\)/ });
    expect(more).toHaveAttribute("aria-expanded", "false");
    expect(more).toHaveAttribute("aria-controls", list.id);
    fireEvent.click(more);
    expect(within(list).getAllByRole("listitem")).toHaveLength(7);
    expect(more).toHaveAttribute("aria-expanded", "true");
    expect(more).toHaveTextContent("Ver menos");

    fireEvent.click(more);
    expect(within(list).getAllByRole("listitem")).toHaveLength(5);
  });

  it("says when the collection records none", () => {
    setup([]);
    expect(screen.getByText("Nenhuma instituição registrada no acervo.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
