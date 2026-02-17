export const defaultLocale = "en";
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultNS = "common";
export const cookieName = "NEXT_LOCALE";

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
