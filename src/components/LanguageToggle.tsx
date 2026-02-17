"use client";

import { type Locale, cookieName } from "@/i18n/settings";
import { useParams, usePathname, useSearchParams } from "next/navigation";

function switchLocale(newLocale: Locale, pathname: string, search: string) {
  // 1. Set cookie (365 days)
  document.cookie = `${cookieName}=${newLocale};max-age=31536000;path=/;SameSite=Lax`;

  // 2. Set localStorage
  localStorage.setItem("promptsouq-locale", newLocale);

  // 3. Compute target URL
  let targetPath: string;
  if (newLocale === "ar") {
    // Add /ar prefix
    targetPath = pathname.startsWith("/ar") ? pathname : `/ar${pathname}`;
  } else {
    // Remove /ar prefix
    targetPath = pathname.startsWith("/ar")
      ? pathname.replace(/^\/ar/, "") || "/"
      : pathname;
  }

  // 4. Navigate (full reload so middleware re-processes)
  window.location.href = targetPath + search;
}

export function LanguageToggle() {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = (params?.locale as Locale) ?? "en";
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";

  return (
    <button
      onClick={() =>
        switchLocale(currentLocale === "ar" ? "en" : "ar", pathname, search)
      }
      className="hidden sm:flex items-center gap-1 text-[10px] font-bold bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors"
    >
      <span className={currentLocale === "ar" ? "text-white" : "text-zinc-500"}>
        AR
      </span>
      <span className="text-zinc-700">|</span>
      <span className={currentLocale === "en" ? "text-white" : "text-zinc-500"}>
        EN
      </span>
    </button>
  );
}
