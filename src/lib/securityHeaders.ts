/**
 * Headers sent with every page (see next.config.ts). They tell the browser not
 * to guess file types, never to show the site inside another site's frame, to
 * send only the origin to other sites, and that the platform uses no camera,
 * microphone or location. A full Content-Security-Policy, which has to allow
 * the MapLibre worker, OpenFreeMap, the API and Vercel Analytics, is planned
 * after the conference (roadmap, "Security hardening").
 */
export const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];
