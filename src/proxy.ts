import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { legacyResearchUrl } from "./lib/legacyUrls";

const intl = createMiddleware(routing);

// Next.js 16 renamed the "middleware" file convention to "proxy": this is
// intentionally not named middleware.ts.
export default function proxy(request: NextRequest) {
  // Old IA Relacional links (`?artista=<slug>`) get a real redirect to the artist's page,
  // before anything renders; the page itself redirects too, as a fallback.
  const legacy = legacyResearchUrl(request.nextUrl);
  return legacy ? NextResponse.redirect(legacy) : intl(request);
}

export const config = {
  // Every path except Next internals, Vercel internals, API routes and files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
