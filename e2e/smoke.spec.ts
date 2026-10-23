import { expect, test } from "@playwright/test";

// The demo script for the conference, end to end, against simulated records (e2e/mock-api.mts).

test("the home page presents the project and leads to Explorar", async ({ page }) => {
  await page.goto("/pt");
  await expect(page.getByRole("heading", { level: 1, name: "Atlas Migrações Leste-Sul" })).toBeVisible();
  await expect(page.getByText(/Dados de demonstração/).first()).toBeVisible();
  await expect(page.getByText(/^\d+$/).first()).toBeVisible();

  await page.getByRole("button", { name: "Pausar a apresentação" }).click();
  await page.getByRole("button", { name: "Próximo slide" }).click();
  await expect(page.getByRole("heading", { level: 2, name: /A digitalização ampliou o acesso/ })).toBeVisible();
  await page.getByRole("button", { name: "Ir para o slide 1: O acervo" }).click();
  await page.getByRole("link", { name: "Explorar o mapa" }).click();
  await expect(page).toHaveURL(/\/pt\/explorar$/);
  await expect(page.getByRole("region", { name: "Mapa das trajetórias dos artistas" })).toBeVisible();
});

test("Explorar shows the collection and opens an artist's trajectory", async ({ page }) => {
  await page.goto("/pt/explorar");
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

test("Camada Histórica, Rede Relacional and Sobre open", async ({ page, isMobile }) => {
  // On a phone the screens fold behind the Menu button.
  const openMenu = async () => {
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  };
  await page.goto("/pt/camada-historica");
  await expect(page.getByRole("heading", { level: 1, name: "Camada Histórica" })).toBeVisible();

  await openMenu();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Rede Relacional" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Rede Relacional" })).toBeVisible();
  await expect(page.getByRole("group", { name: /^Rede de 7 elementos/ })).toBeVisible();

  await openMenu();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Sobre" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sobre o projeto" })).toBeVisible();
});

test("on a phone the Menu button drops the screens and closes after a choice", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the full menu is always visible on a wide screen");
  await page.goto("/pt/sobre");
  const nav = page.getByRole("navigation", { name: "Navegação principal" });
  const menu = page.getByRole("button", { name: "Menu" });
  await expect(nav).toBeHidden();

  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(nav.getByRole("link")).toHaveCount(7);
  await expect(nav.getByRole("link", { name: "IA Relacional" })).toBeInViewport();

  await nav.getByRole("link", { name: "Trajetórias" }).click();
  await expect(page).toHaveURL(/\/pt\/trajetorias$/);
  await expect(nav).toBeHidden();
  await expect(menu).toHaveAttribute("aria-expanded", "false");

  await menu.click();
  await nav.getByRole("link", { name: "Início" }).click();
  await expect(page).toHaveURL(/\/pt$/);
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

test("pages carry the security headers", async ({ page }) => {
  const response = await page.goto("/pt/sobre");
  const headers = response?.headers() ?? {};
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["content-security-policy"]).toBe("frame-ancestors 'none'");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});
