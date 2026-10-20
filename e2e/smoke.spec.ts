import { expect, test } from "@playwright/test";

// The demo script for the conference, end to end, against simulated records (e2e/mock-api.mts).

test("Explorar shows the collection and opens an artist's trajectory", async ({ page }) => {
  await page.goto("/pt");
  await expect(page.getByRole("heading", { level: 1, name: "Atlas Migrações Leste-Sul" })).toBeVisible();
  await expect(page.getByText(/Dados de demonstração/).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Mapa das trajetórias dos artistas" })).toBeVisible();

  await page.getByRole("button", { name: /Artista A \(simulado\)/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Artista A (simulado)" })).toBeVisible();
  await page.getByRole("link", { name: "Abrir a ficha" }).click();
  await expect(page).toHaveURL(/\/pt\/trajetorias\/artista-a$/);
});

test("a trajectory record lists the works and leads to the open-source research", async ({ page }) => {
  await page.goto("/pt/trajetorias");
  await page.getByRole("link", { name: /Artista A \(simulado\)/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Artista A (simulado)" })).toBeVisible();
  await expect(page.getByText("Obra simulada 1")).toBeVisible();

  await page.getByRole("link", { name: "Pesquisar em fontes abertas" }).click();
  await expect(page).toHaveURL(/\/pt\/ia-relacional\?artista=artista-a$/);
  await expect(page.getByText(/nasceu em 1900/)).toBeVisible();

  // Each citation in the AI summary leads to the finding it cites.
  await page.getByRole("link", { name: "Achado 2" }).first().click();
  await expect(page).toHaveURL(/#achado-2$/);
  await expect(page.locator("#achado-2")).toBeInViewport();
  await expect(page.getByText("Prompt enviado à IA")).toBeVisible();
});

test("Camada Histórica, Rede Relacional and Sobre open", async ({ page }) => {
  await page.goto("/pt/camada-historica");
  await expect(page.getByRole("heading", { level: 1, name: "Camada Histórica" })).toBeVisible();

  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Rede Relacional" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Rede Relacional" })).toBeVisible();
  await expect(page.getByRole("group", { name: /^Rede de 7 elementos/ })).toBeVisible();

  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Sobre" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sobre o projeto" })).toBeVisible();
});

test("the language switch keeps the page, in English", async ({ page }) => {
  await page.goto("/pt/trajetorias/artista-a");
  await page.getByRole("link", { name: "EN (Idioma: English)" }).click();
  await expect(page).toHaveURL(/\/en\/trajectories\/artista-a$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("the first Tab offers to skip the menu", async ({ page, isMobile }) => {
  test.skip(isMobile, "no keyboard on a phone");
  await page.goto("/pt/sobre");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#conteudo")).toBeFocused();
});
