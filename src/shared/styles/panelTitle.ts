/**
 * Sets a DS Panel's title apart in gold serif, for panels whose title is the subject of the block
 * ("Fronteiras de 1925", "Fatos históricos"). The DS's CSS is not in a layer, so the overrides need "!".
 */
export const PANEL_TITLE =
  "[&>header>[role=heading]]:font-serif! [&>header>[role=heading]]:text-2xl! [&>header>[role=heading]]:normal-case! [&>header>[role=heading]]:tracking-normal! [&>header>[role=heading]]:text-accent!";
