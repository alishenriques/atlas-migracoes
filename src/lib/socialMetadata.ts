import type { Metadata } from "next";

// The share card shown when a link to the Atlas is posted (WhatsApp, LinkedIn,
// Facebook, X, Slack...). One image per locale, in public/og, at the size every
// network accepts (1.91:1). The paths are relative: the layout's metadataBase
// (NEXT_PUBLIC_SITE_URL) turns them into the absolute URLs crawlers require.
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

const OPEN_GRAPH_LOCALE = { pt: "pt_BR", en: "en_US" } as const;

export type ShareLocale = keyof typeof OPEN_GRAPH_LOCALE;

export function isShareLocale(locale: string): locale is ShareLocale {
  return Object.hasOwn(OPEN_GRAPH_LOCALE, locale);
}

export function shareImagePath(locale: ShareLocale): string {
  return `/og/atlas-${locale}.jpg`;
}

type SocialMetadataInput = {
  locale: string;
  siteName: string;
  description: string;
  imageAlt: string;
};

// Pages that set only a title inherit this from the layout, so every route gets
// the card. A page that sets its own openGraph replaces it whole (Next merges
// metadata shallowly) and must spread this in.
export function socialMetadata({
  locale,
  siteName,
  description,
  imageAlt,
}: SocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  const shareLocale: ShareLocale = isShareLocale(locale) ? locale : "pt";
  const image = { url: shareImagePath(shareLocale), ...SHARE_IMAGE_SIZE, alt: imageAlt, type: "image/jpeg" };
  const alternateLocale = Object.entries(OPEN_GRAPH_LOCALE)
    .filter(([key]) => key !== shareLocale)
    .map(([, value]) => value);

  return {
    openGraph: {
      type: "website",
      siteName,
      title: siteName,
      description,
      locale: OPEN_GRAPH_LOCALE[shareLocale],
      alternateLocale,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [{ url: image.url, alt: imageAlt }],
    },
  };
}
