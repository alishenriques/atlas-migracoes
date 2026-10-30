"use client";

import { Button } from "@alishenriques/atlas-design-system";

import { Link } from "@/i18n/navigation";

export type ProfileActionsProps = {
  slug: string;
  networkLabel: string;
  researchLabel: string;
};

/**
 * The record's way onward, as buttons. A client component on purpose: Button
 * `asChild` restyles the link it is handed, and an element sent from a server
 * component reaches it unresolved, so the link would end up inside a <button>.
 */
export function ProfileActions({ slug, networkLabel, researchLabel }: ProfileActionsProps) {
  return (
    <>
      <Button asChild>
        <Link href={{ pathname: "/rede", query: { artista: slug } }}>{networkLabel}</Link>
      </Button>
      <Button asChild variant="ghost">
        <Link href={{ pathname: "/ia-relacional", query: { artista: slug } }}>{researchLabel}</Link>
      </Button>
    </>
  );
}
