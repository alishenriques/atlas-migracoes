import type { AppPathname } from "@/i18n/routing";

export type MenuItem = { href: AppPathname; labelKey: "HOME" | "TRAJECTORIES" | "HISTORICAL_LAYER" | "ABOUT" };

// The screens of the MVP, in the order of the deck's navigation bar.
export const menuItems: MenuItem[] = [
  { href: "/", labelKey: "HOME" },
  { href: "/trajetorias", labelKey: "TRAJECTORIES" },
  { href: "/camada-historica", labelKey: "HISTORICAL_LAYER" },
  { href: "/sobre", labelKey: "ABOUT" },
];
