import { redirect } from "@/i18n/navigation";

// Explorar moved to /explorar; the home page takes its place in the next change.
export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  redirect({ href: "/explorar", locale });
}
