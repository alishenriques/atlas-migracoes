export const styles = {
  // Desktop: fills the screen under the top bar, with no page scroll.
  root: "relative flex flex-col md:flex-1 md:min-h-[560px] md:overflow-hidden",
  map: "relative h-[60svh] min-h-[360px] md:absolute md:inset-0 md:h-auto",
  // A grid laid over the map: the left column (intro over the panel) | free map, then the
  // footer along the bottom. Only the blocks take pointer events, so the map stays draggable.
  overlay:
    "flex flex-col gap-4 p-4 md:pb-8 md:pointer-events-none md:absolute md:inset-0 md:grid md:grid-cols-[336px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_auto]",
  side: "flex flex-col gap-4 md:col-start-1 md:row-start-1 md:min-h-0",
  intro: "md:pointer-events-auto md:shrink-0",
  // Takes what the intro leaves of the column and scrolls inside it.
  panel: "md:pointer-events-auto md:min-h-0 md:overflow-y-auto scrollbar-atlas",
  // Stops short of the right edge, and the overlay leaves a strip under it, so MapLibre's zoom
  // buttons and the map attribution stay visible.
  footer: "md:pointer-events-auto md:col-span-2 md:row-start-2 md:mr-12",
};
