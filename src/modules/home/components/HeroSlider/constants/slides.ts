import type { AppPathname } from "@/i18n/routing";

export type SlideKey = "COLLECTION" | "PROBLEM" | "RELATIONS" | "AI";

/** The part of the background map a slide zooms into. */
export type SlideFocus = "whole" | "europe" | "atlantic" | "brazil";

export type Slide = {
  key: SlideKey;
  /** The screen the slide's call to action opens. */
  href: Exclude<AppPathname, `${string}[${string}`>;
  focus: SlideFocus;
};

// The project's argument in four steps (deck, slides 3–4), each leading to the screen that answers it.
export const SLIDES: Slide[] = [
  { key: "COLLECTION", href: "/explorar", focus: "whole" },
  { key: "PROBLEM", href: "/trajetorias", focus: "europe" },
  { key: "RELATIONS", href: "/rede", focus: "atlantic" },
  { key: "AI", href: "/ia-relacional", focus: "brazil" },
];

export const AUTOPLAY_INTERVAL_MS = 9000;
