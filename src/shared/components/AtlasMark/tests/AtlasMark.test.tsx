import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AtlasMark } from "../AtlasMark";

describe("AtlasMark", () => {
  it("is hidden from assistive technology, since the brand text carries the name", () => {
    const { container } = render(<AtlasMark />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", "0 0 64 64");
  });

  it("draws the rose in the text color and the East-to-South arc in the accent", () => {
    const { container } = render(<AtlasMark />);
    const [ink, accent] = container.querySelectorAll("svg > g");
    expect(ink).toHaveClass("text-foreground");
    expect(accent).toHaveClass("text-accent");
    expect(accent.querySelector("path")).toHaveAttribute("d", "M56.82 34.99A25 25 0 0 1 32 57");
  });

  it("adds the caller's size classes", () => {
    const { container } = render(<AtlasMark className="size-8" />);
    expect(container.querySelector("svg")).toHaveClass("shrink-0", "size-8");
  });
});
