import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Next.js 16 renamed the "middleware" file convention to "proxy": this is
// intentionally not named middleware.ts.
export default createMiddleware(routing);

export const config = {
  // Every path except Next internals, Vercel internals, API routes and files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
