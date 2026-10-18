import type { AppPathname } from "@/i18n/routing";

/** Menu entries link to static screens, never to a record route like /trajetorias/[slug]. */
type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;

export type MenuItem = { href: StaticPathname; labelKey: "HOME" | "TRAJECTORIES" | "HISTORICAL_LAYER" | "NETWORK" | "ABOUT" };

// The screens of the MVP, in the order of the deck's navigation bar.
export const menuItems: MenuItem[] = [
  { href: "/", labelKey: "HOME" },
  { href: "/trajetorias", labelKey: "TRAJECTORIES" },
  { href: "/camada-historica", labelKey: "HISTORICAL_LAYER" },
  { href: "/rede", labelKey: "NETWORK" },
  { href: "/sobre", labelKey: "ABOUT" },
];
