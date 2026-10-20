import createNextIntlPlugin from "next-intl/plugin";

import { SECURITY_HEADERS } from "./src/lib/securityHeaders";

import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@alishenriques/atlas-design-system"],
  // The borders file (~640 KB, ~50 KB compressed) changes only when
  // scripts/build-cartography.mts runs, so browsers and the CDN may keep it a
  // day and serve a stale copy for a week while revalidating. Its name has no
  // hash, so it is never marked immutable.
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        source: "/cartography/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
