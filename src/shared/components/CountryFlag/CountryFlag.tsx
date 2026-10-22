import type { ComponentProps } from "react";

import {
  AL,
  AT,
  BA,
  BG,
  BR,
  BY,
  CZ,
  EE,
  HR,
  HU,
  LT,
  LV,
  MD,
  ME,
  MK,
  PL,
  RO,
  RS,
  RU,
  SI,
  SK,
  UA,
} from "country-flag-icons/react/3x2";

import { styles } from "./styles/index.styles";

type Flag = typeof PL;

// Countries as the base names them: today's country of each place (e.g. "Tchéquia"), so the
// flag is today's flag too, not the period's (no Austria-Hungary or USSR flags).
const FLAGS: Record<string, Flag> = {
  Albânia: AL,
  Áustria: AT,
  Belarus: BY,
  Bielorrússia: BY,
  "Bósnia e Herzegovina": BA,
  Brasil: BR,
  Bulgária: BG,
  Croácia: HR,
  Eslováquia: SK,
  Eslovênia: SI,
  Estônia: EE,
  Hungria: HU,
  Letônia: LV,
  Lituânia: LT,
  "Macedônia do Norte": MK,
  Moldávia: MD,
  Montenegro: ME,
  Polônia: PL,
  Romênia: RO,
  Rússia: RU,
  Sérvia: RS,
  Tchéquia: CZ,
  Ucrânia: UA,
};

export type CountryFlagProps = {
  /** Country name as stored in the base. Unknown or missing names render nothing. */
  country: string | null | undefined;
} & Omit<ComponentProps<Flag>, "children">;

/** A small decorative flag for a country name; the name itself stays as text beside it. */
export function CountryFlag({ country, className, ...props }: CountryFlagProps) {
  const Flag = country ? FLAGS[country] : undefined;
  if (!Flag) return null;
  return (
    <Flag
      aria-hidden
      data-country={country}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
