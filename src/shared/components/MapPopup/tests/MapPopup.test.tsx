import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MapPopup } from "../MapPopup";

describe("MapPopup", () => {
  it("shows the label, title, meta and records", () => {
    render(
      <MapPopup eyebrow="Brasil" title="São Paulo" meta="2 artistas">
        <ul>
          <li>Registro</li>
        </ul>
      </MapPopup>,
    );
    expect(screen.getByText("Brasil")).toBeInTheDocument();
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
    expect(screen.getByText("2 artistas")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Registro");
  });

  it("leaves out the optional parts", () => {
    const { container } = render(<MapPopup title="Vilna" />);
    expect(container).toHaveTextContent(/^Vilna$/);
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });
});
