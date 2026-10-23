import { z } from "zod";

import table from "../../public/cartography/state-names.json";

/**
 * CShapes gives a state one English name for its whole existence ("Russia
 * (Soviet Union)" from 1886 to 2019). public/cartography/state-names.json
 * names it as it was on each day instead: per source name, the periods in
 * order, each valid through `until` (inclusive) and the last one open-ended.
 * The API reads the same file for the IA Relacional prompt.
 */

export type StateNameLocale = "pt" | "en";

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const periodSchema = z.object({ until: isoDay.optional(), pt: z.string().min(1), en: z.string().min(1) });

export const stateNamesSchema = z.record(
  z.string(),
  z
    .array(periodSchema)
    .min(1)
    .refine(
      (periods) =>
        periods.every(({ until }, index) => {
          const next = periods[index + 1];
          if (!next) return until === undefined;
          return until !== undefined && (next.until === undefined || until < next.until);
        }),
      "periods must be in order, every one but the last with an `until`",
    ),
);

export type StateNames = z.infer<typeof stateNamesSchema>;

export const STATE_NAMES: StateNames = stateNamesSchema.parse(table);

/** The app's locale as one the table has: English for "en", Portuguese otherwise. */
export const stateNameLocale = (locale: string): StateNameLocale => (locale === "en" ? "en" : "pt");

/** The name of the state on a day, or the source's name when the table does not know it. */
export function periodName(source: string, day: string, locale: StateNameLocale, names: StateNames = STATE_NAMES): string {
  const period = names[source]?.find(({ until }) => until === undefined || day <= until);
  return period?.[locale] ?? source;
}
