import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

const RESEARCH = routing.pathnames["/ia-relacional"];
const ARTIST_RESEARCH = routing.pathnames["/ia-relacional/[slug]"];

/**
 * Where a link from before each artist had an IA Relacional page of their own
 * (`/pt/ia-relacional?artista=<slug>`, `/en/relational-ai?artista=<slug>`) now
 * leads: that artist's page, keeping any other query. Null for every other URL.
 */
export function legacyResearchUrl(url: URL): URL | null {
  const slug = url.searchParams.get("artista");
  if (!slug) return null;
  const locale = routing.locales.find((item: Locale) => url.pathname.replace(/\/$/, "") === `/${item}${RESEARCH[item]}`);
  if (!locale) return null;

  const target = new URL(url);
  target.pathname = `/${locale}${ARTIST_RESEARCH[locale].replace("[slug]", encodeURIComponent(slug))}`;
  target.searchParams.delete("artista");
  return target;
}
