import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { I18nProvider } from "@/i18n/client";
import { type Locale, defaultLocale, locales } from "@/i18n/settings";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";

// Import all resources for client-side hydration
import enCommon from "@/i18n/locales/en/common.json";
import enHome from "@/i18n/locales/en/home.json";
import enMarket from "@/i18n/locales/en/market.json";
import enSearch from "@/i18n/locales/en/search.json";
import enPrompt from "@/i18n/locales/en/prompt.json";
import enSubscription from "@/i18n/locales/en/subscription.json";
import enAuth from "@/i18n/locales/en/auth.json";

import arCommon from "@/i18n/locales/ar/common.json";
import arHome from "@/i18n/locales/ar/home.json";
import arMarket from "@/i18n/locales/ar/market.json";
import arSearch from "@/i18n/locales/ar/search.json";
import arPrompt from "@/i18n/locales/ar/prompt.json";
import arSubscription from "@/i18n/locales/ar/subscription.json";
import arAuth from "@/i18n/locales/ar/auth.json";

const allResources = {
  en: {
    common: enCommon,
    home: enHome,
    market: enMarket,
    search: enSearch,
    prompt: enPrompt,
    subscription: enSubscription,
    auth: enAuth,
  },
  ar: {
    common: arCommon,
    home: arHome,
    market: arMarket,
    search: arSearch,
    prompt: arPrompt,
    subscription: arSubscription,
    auth: arAuth,
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;

  // Build path without locale prefix (canonical path)
  // We'll use the current path from headers
  const fullUrl = hdrs.get("x-url") ?? hdrs.get("x-invoke-path") ?? "";
  // Strip /ar or /en prefix to get the base path
  const basePath = fullUrl.replace(/^\/(en|ar)/, "") || "/";

  return {
    alternates: {
      languages: {
        en: `${origin}${basePath}`,
        ar: `${origin}/ar${basePath === "/" ? "" : basePath}`,
      },
    },
    openGraph: {
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : defaultLocale;

  const resources = allResources[locale];
  const fallbackResources =
    locale !== defaultLocale ? allResources[defaultLocale] : undefined;

  return (
    <I18nProvider
      locale={locale}
      resources={resources}
      fallbackResources={fallbackResources}
    >
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
