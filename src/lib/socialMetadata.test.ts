import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { isShareLocale, SHARE_IMAGE_SIZE, shareImagePath, socialMetadata } from "./socialMetadata";

const input = { siteName: "Atlas Migrações Leste-Sul", description: "Descrição", imageAlt: "Texto alternativo" };

// Width and height from a baseline or progressive JPEG's SOF marker.
function jpegSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1] ?? 0;
    if (marker === 0xc0 || marker === 0xc2) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  throw new Error(`No SOF marker in ${file}`);
}

describe("socialMetadata", () => {
  it("gives the Portuguese card to pt", () => {
    const { openGraph, twitter } = socialMetadata({ ...input, locale: "pt" });
    expect(openGraph).toMatchObject({
      type: "website",
      siteName: input.siteName,
      title: input.siteName,
      description: input.description,
      locale: "pt_BR",
      alternateLocale: ["en_US"],
      images: [{ url: "/og/atlas-pt.jpg", width: 1200, height: 630, alt: input.imageAlt, type: "image/jpeg" }],
    });
    expect(twitter).toMatchObject({
      card: "summary_large_image",
      images: [{ url: "/og/atlas-pt.jpg", alt: input.imageAlt }],
    });
  });

  it("gives the English card to en", () => {
    const { openGraph } = socialMetadata({ ...input, locale: "en" });
    expect(openGraph).toMatchObject({ locale: "en_US", alternateLocale: ["pt_BR"], images: [{ url: "/og/atlas-en.jpg" }] });
  });

  it("falls back to the Portuguese card for an unknown locale", () => {
    expect(socialMetadata({ ...input, locale: "de" }).openGraph).toMatchObject({ locale: "pt_BR" });
  });
});

describe("share images", () => {
  it.each(["pt", "en"] as const)("ships %s at the declared size, small enough for WhatsApp", (locale) => {
    expect(isShareLocale(locale)).toBe(true);
    const file = join(process.cwd(), "public", shareImagePath(locale));
    expect(existsSync(file)).toBe(true);
    expect(jpegSize(file)).toEqual(SHARE_IMAGE_SIZE);
    // WhatsApp drops previews from images much over 300 KB.
    expect(readFileSync(file).length).toBeLessThan(300 * 1024);
  });
});
