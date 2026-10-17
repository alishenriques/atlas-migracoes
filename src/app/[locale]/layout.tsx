import { Cormorant_Garamond, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import "@alishenriques/atlas-design-system/styles.css";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { loadPublicEnv } from "@/lib/env";
import { Layout } from "@/modules/layout";

import type { Metadata } from "next";

// Self-hosted via next/font (no external request at runtime, no layout shift).
// globals.css points the design system's --atlas-font-* tokens at these.
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
});

const inter = Inter({
  weight: "variable",
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SEO" });
  const siteName = t("SITE_NAME");

  return {
    metadataBase: new URL(loadPublicEnv().NEXT_PUBLIC_SITE_URL),
    title: { default: siteName, template: `%s | ${siteName}` },
    description: t("DEFAULT_DESCRIPTION"),
    applicationName: siteName,
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${cormorant.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Layout>{children}</Layout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
