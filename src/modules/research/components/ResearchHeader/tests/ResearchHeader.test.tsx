import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { ResearchHeader } from "../ResearchHeader";

describe("ResearchHeader", () => {
  it("names the screen and what it holds, as Trajetórias does", () => {
    render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <ResearchHeader />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "IA Relacional" })).toBeInTheDocument();
    expect(screen.getByText("Pesquisa por artista")).toBeInTheDocument();
    expect(screen.getByText(/nada do que é encontrado aqui entra na base sem revisão/)).toBeInTheDocument();
  });
});
