import type { SlideFocus } from "../constants/slides";

const dot = "h-2 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const control =
  "inline-flex size-10 flex-none items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const styles = {
  // Fills the first screen under the top bar, without growing past a comfortable height on tall monitors.
  root: "relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden border-b border-line px-4 py-16 sm:px-6 lg:max-h-[60rem]",
  illustration:
    "absolute inset-0 -z-20 bg-[url(/home/hero.svg)] bg-cover bg-center transition-[transform,transform-origin] duration-[1800ms] ease-out motion-reduce:transition-none",
  // Darkens the middle, where the text sits, and fades into the page at the bottom.
  shade:
    "absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgb(7_13_24/0.86)_0%,rgb(7_13_24/0.6)_45%,rgb(7_13_24/0.15)_80%),linear-gradient(to_bottom,transparent_70%,var(--atlas-color-bg))]",
  progressTrack: "absolute inset-x-0 top-0 h-0.5 bg-line motion-reduce:hidden",
  progressFill: "h-full w-0 bg-accent [animation-fill-mode:forwards] [animation-name:atlas-hero-progress] [animation-timing-function:linear]",
  content: "flex w-full max-w-3xl flex-col items-center gap-5 text-center",
  brand: "flex items-center gap-3 font-serif text-2xl font-semibold sm:text-3xl",
  mark: "size-10 sm:size-12",
  // Tall enough for the longest slide, so the controls under it stay in place.
  slide: "flex min-h-[19rem] flex-col items-center gap-4 pt-4 animate-[atlas-slide-reveal_0.6s_ease-out] motion-reduce:animate-none sm:min-h-[17rem]",
  slideEyebrow: "text-[11px] font-medium uppercase tracking-[0.2em] text-muted",
  headline: "max-w-[22ch] font-serif text-[clamp(2rem,5vw,3.6rem)] leading-[1.05] text-balance",
  highlight: "text-accent italic",
  body: "max-w-[56ch] text-base leading-relaxed text-foreground/80 sm:text-lg",
  cta: "mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--atlas-color-accent-ink)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_circle]:fill-current",
  controls: "flex items-center gap-3",
  arrow: control,
  arrowIcon: "size-5",
  arrowDot: "fill-accent",
  dots: "flex items-center gap-2 px-1",
  dot: `${dot} w-2 bg-foreground/30 hover:bg-foreground/60`,
  dotActive: `${dot} w-6 bg-accent`,
  // Nothing to pause where there is no autoplay.
  pause: `${control} size-8 motion-reduce:hidden`,
  pauseIcon: "size-3.5",
};

// Each slide zooms into the part of the illustration it talks about (public/home/hero.svg).
export const focusStyles: Record<SlideFocus, string> = {
  whole: "scale-100 origin-center",
  collections: "scale-[1.18] origin-[88%_50%]",
  globe: "scale-[1.12] origin-center",
  researcher: "scale-[1.2] origin-[8%_90%]",
};
