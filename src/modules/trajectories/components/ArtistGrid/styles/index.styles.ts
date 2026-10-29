import { styles as page } from "../../../styles/index.styles";

export const styles = {
  list: "flex flex-col gap-5",
  // The search box, and the count beside it from sm up.
  toolbar: "flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-5",
  search: "w-full sm:max-w-sm",
  count: "text-xs text-muted sm:pb-2.5",
  // The cards keep the page's grid, which its skeleton shares.
  grid: page.grid,
  card: page.card,
  cardText: page.cardText,
  cardName: page.cardName,
  cardMeta: page.itemMeta,
  empty: page.muted,
};
