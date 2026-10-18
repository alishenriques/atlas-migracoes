import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Layout } from "../Layout";

vi.mock("../components/TopBar", () => ({ TopBar: () => <nav aria-label="Menu principal" /> }));

describe("Layout", () => {
  it("puts the top bar above the page", () => {
    render(
      <Layout>
        <main>Conteúdo</main>
      </Layout>,
    );

    const navigation = screen.getByRole("navigation", { name: "Menu principal" });
    expect(navigation.nextElementSibling).toBe(screen.getByRole("main"));
  });
});
