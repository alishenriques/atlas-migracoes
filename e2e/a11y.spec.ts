import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Every screen, in both languages, with no serious or critical WCAG 2.1 A/AA violation that axe can detect.
const PAGES = [
  "/pt",
  "/pt/explorar",
  "/pt/trajetorias",
  "/pt/trajetorias/artista-a",
  "/pt/camada-historica",
  "/pt/rede",
  "/pt/ia-relacional",
  "/pt/ia-relacional?artista=artista-a",
  "/pt/sobre",
  "/en",
  "/en/explore",
  "/en/relational-ai?artista=artista-a",
];

for (const path of PAGES) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = violations
      .filter(({ impact }) => impact === "serious" || impact === "critical")
      .map(({ id, nodes }) => `${id}: ${nodes.map(({ target }) => target.join(" ")).join(", ")}`);
    expect(serious).toEqual([]);
  });
}
