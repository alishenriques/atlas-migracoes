import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  // Keys are the internal routes (the app/[locale]/* folders, in Portuguese);
  // values are the public URL per locale. `Link`/`getPathname` from
  // ./navigation build the localized URL from the internal key.
  pathnames: {
    "/": "/",
    "/trajetorias": { pt: "/trajetorias", en: "/trajectories" },
    "/camada-historica": { pt: "/camada-historica", en: "/historical-layer" },
    "/sobre": { pt: "/sobre", en: "/about" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
