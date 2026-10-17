"use client";

import { Button } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("ERROR");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl">{t("TITLE")}</h1>
      <Button onClick={reset}>{t("RETRY")}</Button>
    </main>
  );
}
