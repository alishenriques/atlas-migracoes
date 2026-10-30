import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { Connection } from "@/lib/network";
import messages from "@/locales/pt.json";

import { ConnectionsCard } from "../ConnectionsCard";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: { pathname: string; query: Record<string, string> } }) => (
    <a href={`${href.pathname}?${new URLSearchParams(href.query).toString()}`} {...props}>
      {children}
    </a>
  ),
}));

const connections: Connection[] = [
  { id: "artist:yolanda", kind: "joint_exhibition", label: "Yolanda Mohalyi", slug: "yolanda", weight: 3 },
  { id: "institution:mac", kind: "institution", label: "MAC USP", slug: null, weight: 22 },
  { id: "place:sp", kind: "place", label: "São Paulo", slug: null, weight: 1 },
];

function setup(value: Connection[] | null) {
  return render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <ConnectionsCard slug="anatol-wladyslaw" name="Anatol Wladyslaw" connections={value} />
    </NextIntlClientProvider>,
  );
}

/** The drawing of the network, not the info icon inside the Toggletip's button. */
const drawing = (container: HTMLElement) =>
  [...container.querySelectorAll("svg")].find((svg) => !svg.closest("button")) ?? null;

describe("ConnectionsCard", () => {
  it("draws the artist with their connections and lists them by kind of relation", () => {
    const { container } = setup(connections);
    const card = screen.getByRole("region", { name: "Rede de conexões" });
    expect(within(card).getByRole("list", { name: "Tipos de relação" })).toHaveTextContent(
      "Exposição conjuntaInstituiçãoNascimento e morte",
    );
    const svg = drawing(container);
    expect(svg?.querySelectorAll("circle")).toHaveLength(connections.length + 1);
    expect(svg).toHaveTextContent(/AnatolWladyslaw/);
    // Birth and death are dashed, the other links solid.
    const dashed = [...(svg?.querySelectorAll("line") ?? [])].map((line) => line.getAttribute("stroke-dasharray"));
    expect(dashed).toEqual([null, null, "3 3"]);
    const items = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(items).toContain("Exposição conjunta: Yolanda Mohalyi");
    expect(items).toContain("Instituição: MAC USP");
    expect(items).toContain("Nascimento e morte: São Paulo");
  });

  it("opens the full network on this artist", () => {
    setup(connections);
    expect(screen.getByRole("link", { name: /Ver rede expandida/ })).toHaveAttribute(
      "href",
      "/rede?artista=anatol-wladyslaw",
    );
  });

  it("explains what the block shows", () => {
    setup(connections);
    expect(screen.getByText("Sobre a rede de conexões")).toBeInTheDocument();
  });

  it("says so when the artist has no connections, or the network could not load", () => {
    const { container, unmount } = setup([]);
    expect(screen.getByText("Nenhuma conexão registrada no acervo.")).toBeInTheDocument();
    expect(drawing(container)).toBeNull();
    unmount();
    setup(null);
    expect(screen.getByText("Não foi possível carregar a rede agora.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver rede expandida/ })).toBeInTheDocument();
  });
});
