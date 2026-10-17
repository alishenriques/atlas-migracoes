import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Locale-aware wrappers around Next.js navigation APIs (auto-prefixes /pt or /en).
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
