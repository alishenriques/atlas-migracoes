import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NOT_FOUND");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl">{t("TITLE")}</h1>
      <Link href="/" className="text-accent underline-offset-4 hover:underline">
        {t("BACK")}
      </Link>
    </main>
  );
}
