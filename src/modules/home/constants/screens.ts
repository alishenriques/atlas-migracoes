import type { MenuItem } from "@/modules/layout/constants/menuConfig";

/** The screens the home page leads to, with the menu's label and the home page's description of each. */
export const SCREENS: { href: MenuItem["href"]; labelKey: MenuItem["labelKey"] }[] = [
  { href: "/explorar", labelKey: "EXPLORAR" },
  { href: "/trajetorias", labelKey: "TRAJECTORIES" },
  { href: "/camada-historica", labelKey: "HISTORICAL_LAYER" },
  { href: "/rede", labelKey: "NETWORK" },
  { href: "/ia-relacional", labelKey: "RELATIONAL_AI" },
];
