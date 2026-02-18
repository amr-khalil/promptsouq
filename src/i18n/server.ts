import { createInstance, type i18n, type TFunction } from "i18next";
import { initReactI18next } from "react-i18next/initReactI18next";
import { type Locale, defaultLocale, defaultNS } from "./settings";

// Import all locale resources statically for server-side usage
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enMarket from "./locales/en/market.json";
import enSearch from "./locales/en/search.json";
import enPrompt from "./locales/en/prompt.json";
import enSubscription from "./locales/en/subscription.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";

import arCommon from "./locales/ar/common.json";
import arHome from "./locales/ar/home.json";
import arMarket from "./locales/ar/market.json";
import arSearch from "./locales/ar/search.json";
import arPrompt from "./locales/ar/prompt.json";
import arSubscription from "./locales/ar/subscription.json";
import arAuth from "./locales/ar/auth.json";
import arDashboard from "./locales/ar/dashboard.json";

const allResources: Record<Locale, Record<string, Record<string, unknown>>> = {
  en: {
    common: enCommon,
    home: enHome,
    market: enMarket,
    search: enSearch,
    prompt: enPrompt,
    subscription: enSubscription,
    auth: enAuth,
    dashboard: enDashboard,
  },
  ar: {
    common: arCommon,
    home: arHome,
    market: arMarket,
    search: arSearch,
    prompt: arPrompt,
    subscription: arSubscription,
    auth: arAuth,
    dashboard: arDashboard,
  },
};

export async function getTranslation(
  locale: Locale,
  namespaces: string | string[] = defaultNS,
): Promise<{ t: TFunction; i18n: i18n }> {
  const nsList = Array.isArray(namespaces) ? namespaces : [namespaces];
  if (!nsList.includes("common")) nsList.unshift("common");

  const instance = createInstance();

  await instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: defaultLocale,
    defaultNS,
    ns: nsList,
    resources: {
      [locale]: allResources[locale],
      ...(locale !== defaultLocale ? { [defaultLocale]: allResources[defaultLocale] } : {}),
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

  return { t: instance.t, i18n: instance };
}
