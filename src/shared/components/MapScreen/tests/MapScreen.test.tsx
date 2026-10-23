import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MapScreen } from "../MapScreen";

describe("MapScreen", () => {
  it("lays the intro, the panel and the footer over the map", () => {
    render(
      <MapScreen
        map={<div>Mapa</div>}
        intro={<p>Apresentação</p>}
        footer={<p>Acervo</p>}
        title="Filtros"
        action={<button type="button">Limpar</button>}
      >
        <p>Controles</p>
      </MapScreen>,
    );
    expect(screen.getByText("Mapa")).toBeInTheDocument();
    expect(screen.getByText("Apresentação")).toBeInTheDocument();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).toBeInTheDocument();
    expect(screen.getByText("Controles")).toBeInTheDocument();
    expect(screen.getByText("Acervo")).toBeInTheDocument();
  });

  it("leaves out the optional blocks", () => {
    const { container } = render(
      <MapScreen map={<div>Mapa</div>} title="Filtros">
        <p>Controles</p>
      </MapScreen>,
    );
    expect(container).not.toHaveTextContent("Apresentação");
    expect(container.querySelector("section > div:last-child")?.children).toHaveLength(1);
  });
});
