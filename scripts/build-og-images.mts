// Renders the share cards (Open Graph / Twitter) into public/og, one per locale,
// from scripts/og-image/template.html: the night world map of the Home, the
// "rosa leste-sul" logo and the Home's own copy. Run after changing the template:
//   yarn build:og-images
// It loads Cormorant Garamond and Inter from Google Fonts, so it needs network.
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const template = fileURLToPath(new URL("./og-image/template.html", import.meta.url));
const output = (locale: string): string => fileURLToPath(new URL(`../public/og/atlas-${locale}.jpg`, import.meta.url));

const browser = await chromium.launch();
for (const locale of ["pt", "en"]) {
  // A fresh page per locale: a hash-only goto would not re-run the template's script.
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`file://${template}#${locale}`);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.screenshot({ path: output(locale), type: "jpeg", quality: 84 });
  await page.close();
  console.log(`public/og/atlas-${locale}.jpg`);
}
await browser.close();
