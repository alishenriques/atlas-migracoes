import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/locales/pt.json";

import { PendingResults, ResearchTransition, useResearchTransition } from "../ResearchTransition";

// Starts a transition that only ends when the test resolves it, as a navigation would.
let finish: () => void = () => {};
function Choose() {
  const { pending, start } = useResearchTransition();
  return (
    <button
      type="button"
      aria-busy={pending}
      onClick={() =>
        start(async () => {
          await new Promise<void>((resolve) => {
            finish = resolve;
          });
        })
      }
    >
      Escolher
    </button>
  );
}

const renderScreen = (shared: boolean) => {
  const tree = (
    <>
      <Choose />
      <PendingResults>
        <p>Achados</p>
      </PendingResults>
    </>
  );
  return render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {shared ? <ResearchTransition>{tree}</ResearchTransition> : tree}
    </NextIntlClientProvider>,
  );
};

describe("ResearchTransition", () => {
  it("swaps the results for their skeleton while another artist is on the way", async () => {
    renderScreen(true);
    expect(screen.getByText("Achados")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Escolher" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Carregando…");
    expect(screen.queryByText("Achados")).not.toBeInTheDocument();
    await act(async () => finish());
    expect(screen.getByText("Achados")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps each part's own transition outside the screen", async () => {
    renderScreen(false);
    fireEvent.click(screen.getByRole("button", { name: "Escolher" }));
    expect(await screen.findByRole("button", { busy: true })).toBeInTheDocument();
    expect(screen.getByText("Achados")).toBeInTheDocument();
    await act(async () => finish());
    expect(screen.getByRole("button", { busy: false })).toBeInTheDocument();
  });
});
