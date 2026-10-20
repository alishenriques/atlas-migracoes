import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Layout } from "../Layout";

vi.mock("../components/TopBar", () => ({ TopBar: () => <nav aria-label="Menu principal" /> }));

describe("Layout", () => {
  it("puts the top bar above the page, which the skip link can focus", () => {
    render(
      <Layout>
        <main>Conteúdo</main>
      </Layout>,
    );

    const navigation = screen.getByRole("navigation", { name: "Menu principal" });
    const content = navigation.nextElementSibling;
    expect(content).toHaveAttribute("id", "conteudo");
    expect(content).toHaveAttribute("tabindex", "-1");
    expect(content?.firstElementChild).toBe(screen.getByRole("main"));
  });
});
