import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountryFlag } from "../CountryFlag";

describe("CountryFlag", () => {
  it("draws the flag of a known country, hidden from assistive tech", () => {
    const { container } = render(<CountryFlag country="Polônia" className="extra" />);
    const flag = container.querySelector("svg");
    expect(flag).toHaveAttribute("data-country", "Polônia");
    expect(flag).toHaveAttribute("aria-hidden", "true");
    expect(flag).toHaveClass("extra");
  });

  it("renders nothing for an unknown or missing country", () => {
    expect(render(<CountryFlag country="Atlântida" />).container).toBeEmptyDOMElement();
    expect(render(<CountryFlag country={null} />).container).toBeEmptyDOMElement();
    expect(render(<CountryFlag country={undefined} />).container).toBeEmptyDOMElement();
  });
});
