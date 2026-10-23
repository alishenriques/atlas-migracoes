import type { AppPathname } from "@/i18n/routing";

/** Menu entries link to static screens, never to a record route like /trajetorias/[slug]. */
type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;

export type MenuItem = {
  href: StaticPathname;
  labelKey:
    | "HOME"
    | "EXPLORAR"
    | "TRAJECTORIES"
    | "HISTORICAL_LAYER"
    | "NETWORK"
    | "RELATIONAL_AI"
    | "ABOUT";
};

// The home page, then the screens of the MVP in the order of the deck's navigation bar.
export const menuItems: MenuItem[] = [
  { href: "/", labelKey: "HOME" },
  { href: "/explorar", labelKey: "EXPLORAR" },
  { href: "/trajetorias", labelKey: "TRAJECTORIES" },
  { href: "/camada-historica", labelKey: "HISTORICAL_LAYER" },
  { href: "/rede", labelKey: "NETWORK" },
  { href: "/ia-relacional", labelKey: "RELATIONAL_AI" },
  { href: "/sobre", labelKey: "ABOUT" },
];

/** Id of the element that holds each page, the target of the "skip to content" link. */
export const CONTENT_ID = "conteudo";
