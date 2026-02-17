"use client";

import i18next, { type Resource } from "i18next";
import { useEffect, useState } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { type Locale, defaultLocale, defaultNS } from "./settings";

function createI18nClient(
  locale: Locale,
  localeResources: Record<string, Record<string, unknown>>,
  fallbackResources?: Record<string, Record<string, unknown>>,
) {
  const instance = i18next.createInstance();
  const resources: Resource = {
    [locale]: localeResources,
    ...(fallbackResources && locale !== defaultLocale
      ? { [defaultLocale]: fallbackResources }
      : {}),
  };
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: defaultLocale,
    defaultNS,
    resources,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
  return instance;
}

export function I18nProvider({
  locale,
  resources,
  fallbackResources,
  children,
}: {
  locale: Locale;
  resources: Record<string, Record<string, unknown>>;
  fallbackResources?: Record<string, Record<string, unknown>>;
  children: React.ReactNode;
}) {
  const [instance] = useState(() =>
    createI18nClient(locale, resources, fallbackResources),
  );

  useEffect(() => {
    if (instance.language !== locale) {
      instance.changeLanguage(locale);
    }
  }, [locale, instance]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
