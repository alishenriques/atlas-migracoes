import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/en.json";

import { DemoNotice } from "../DemoNotice";

describe("DemoNotice", () => {
  it("announces that the data is simulated", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <DemoNotice />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Demo data");
  });
});
