import { describe, expect, it } from "vitest";

import { SECURITY_HEADERS } from "./securityHeaders";
import nextConfig from "../../next.config";

describe("security headers", () => {
  it("are sent with every path", async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    const everyPath = rules.find((rule) => rule.source === "/:path*");
    expect(everyPath?.headers).toEqual(SECURITY_HEADERS);
  });

  it("forbid framing and turn off the features the site never uses", () => {
    const value = (key: string) => SECURITY_HEADERS.find((header) => header.key === key)?.value;
    expect(value("Content-Security-Policy")).toBe("frame-ancestors 'none'");
    expect(value("X-Frame-Options")).toBe("DENY");
    expect(value("Permissions-Policy")).toContain("geolocation=()");
  });
});
