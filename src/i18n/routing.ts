import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  // Keys are the internal routes (the app/[locale]/* folders, in Portuguese);
  // values are the public URL per locale. `Link`/`getPathname` from
  // ./navigation build the localized URL from the internal key.
  pathnames: {
    "/": "/",
    "/explorar": { pt: "/explorar", en: "/explore" },
    "/trajetorias": { pt: "/trajetorias", en: "/trajectories" },
    "/trajetorias/[slug]": { pt: "/trajetorias/[slug]", en: "/trajectories/[slug]" },
    "/camada-historica": { pt: "/camada-historica", en: "/historical-layer" },
    "/rede": { pt: "/rede", en: "/network" },
    "/ia-relacional": { pt: "/ia-relacional", en: "/relational-ai" },
    "/sobre": { pt: "/sobre", en: "/about" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
