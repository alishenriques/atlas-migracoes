import { expect, test, type Page } from "@playwright/test";

// The demo script (e2e/smoke.spec.ts) against a deployed address with the real base.
// It names no artist: it follows the first one each list shows.

const MAIN_NAV = "Navegação principal";

async function expectRealData(page: Page) {
  await expect(page.getByText(/Dados de demonstração/)).toHaveCount(0);
}

test("the home page presents the project with the real counters", async ({ page }) => {
  await page.goto("/pt");
  await expect(page.getByRole("heading", { level: 1, name: "Atlas Migrações Leste-Sul" })).toBeVisible();
  await expect(page.getByText(/^\d+$/).first()).toBeVisible();
  await expectRealData(page);
  await page.getByRole("link", { name: "Explorar o mapa" }).click();
  await expect(page).toHaveURL(/\/pt\/explorar$/);
});

test("Explorar shows the real collection and opens an artist's trajectory", async ({ page }) => {
  await page.goto("/pt/explorar");
  await expect(page.getByRole("heading", { level: 1, name: "Atlas Migrações Leste-Sul" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Mapa das trajetórias dos artistas" })).toBeVisible();
  await expect(page.getByText(/^\d+ artistas$/)).toBeVisible();
  await expectRealData(page);

  await page.getByRole("region", { name: "Filtros" }).getByRole("listitem").getByRole("button").first().click();
  await page.getByRole("link", { name: "Abrir a ficha" }).click();
  await expect(page).toHaveURL(/\/pt\/trajetorias\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("a trajectory record leads to the open-source research with its prompt", async ({ page }) => {
  await page.goto("/pt/trajetorias");
  await page.locator('#conteudo a[href^="/pt/trajetorias/"]').first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "Pesquisar em fontes abertas" }).click();
  await expect(page).toHaveURL(/\/pt\/ia-relacional\?artista=/);
  await expect(page.getByText("Prompt enviado à IA")).toBeVisible({ timeout: 30_000 });
});

test("Camada Histórica, Rede Relacional and Sobre open", async ({ page }) => {
  await page.goto("/pt/camada-historica");
  await expect(page.getByRole("heading", { level: 1, name: "Camada Histórica" })).toBeVisible();

  await page.getByRole("navigation", { name: MAIN_NAV }).getByRole("link", { name: "Rede Relacional" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Rede Relacional" })).toBeVisible();
  await expect(page.getByRole("group", { name: /^Rede de \d+ elementos/ })).toBeVisible();
  await expectRealData(page);

  await page.getByRole("navigation", { name: MAIN_NAV }).getByRole("link", { name: "Sobre" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sobre o projeto" })).toBeVisible();
});

test("the language switch keeps the page, in English", async ({ page }) => {
  await page.goto("/pt/sobre");
  await page.getByRole("link", { name: "EN (Idioma: English)" }).click();
  await expect(page).toHaveURL(/\/en\/about$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
