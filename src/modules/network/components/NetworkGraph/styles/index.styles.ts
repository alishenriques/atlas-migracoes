export const styles = {
  root: "relative h-full w-full",
  svg: "block h-full w-full cursor-grab select-none active:cursor-grabbing",
  guide: "fill-none stroke-line",
  heading: "pointer-events-none fill-muted font-sans uppercase tracking-[0.12em]",
  edge: "fill-none stroke-muted transition-opacity",
  edgeActive: "fill-none stroke-accent",
  node: "cursor-pointer outline-none transition-opacity [&:focus-visible>circle:first-of-type]:stroke-accent",
  ring: "fill-none stroke-accent",
  // A halo in the background colour keeps labels legible over the lines behind them.
  label: "pointer-events-none fill-foreground stroke-raised font-sans [paint-order:stroke]",
  controls: "absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-md border border-line bg-background/80 backdrop-blur",
  control:
    "flex size-8 items-center justify-center text-base text-foreground hover:bg-white/5 focus-visible:outline focus-visible:outline-accent disabled:cursor-default disabled:text-muted disabled:hover:bg-transparent [&+&]:border-t [&+&]:border-line",
};
