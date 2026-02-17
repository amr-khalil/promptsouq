# i18n Internal API Contract

**Feature Branch**: `011-i18n-localization`
**Date**: 2026-02-17

## Module Structure

```
src/i18n/
├── settings.ts          # Shared config: locales, namespaces, defaults
├── server.ts            # Server-side i18next instance factory
├── client.ts            # Client-side i18next provider + init
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── home.json
    │   ├── market.json
    │   ├── search.json
    │   ├── prompt.json
    │   ├── subscription.json
    │   └── auth.json
    └── ar/
        ├── common.json
        ├── home.json
        ├── market.json
        ├── search.json
        ├── prompt.json
        ├── subscription.json
        └── auth.json
```

## Settings (`src/i18n/settings.ts`)

```typescript
export const defaultLocale = "en";
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultNS = "common";
export const cookieName = "NEXT_LOCALE";

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
```

## Server-Side Usage (Server Components)

```typescript
// src/i18n/server.ts
// Creates a new i18next instance per request (no shared state)

import { createInstance } from "i18next";

export async function getTranslation(
  locale: Locale,
  namespaces?: string | string[]
): Promise<{ t: TFunction; i18n: i18n }>;
```

**Usage in Server Components**:
```tsx
// src/app/[locale]/page.tsx
export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const { t } = await getTranslation(params.locale, ["common", "home"]);
  return <h1>{t("home:hero.title")}</h1>;
}
```

## Client-Side Usage (Client Components)

```typescript
// src/i18n/client.ts
// Provides I18nextProvider wrapper initialized for the current locale

export function I18nProvider({
  locale,
  namespaces,
  children
}: {
  locale: Locale;
  namespaces: string[];
  children: React.ReactNode;
}): JSX.Element;
```

**Usage in Client Components**:
```tsx
// Any "use client" component
import { useTranslation } from "react-i18next";

function Header() {
  const { t } = useTranslation("common");
  return <nav>{t("header.nav.browse")}</nav>;
}
```

## Locale-Aware Link Component

```typescript
// src/components/LocaleLink.tsx
// Wraps Next.js Link to prepend locale prefix

interface LocaleLinkProps extends LinkProps {
  locale?: Locale; // Override current locale
}

export function LocaleLink({ href, locale, ...props }: LocaleLinkProps): JSX.Element;
```

**Behavior**:
- If current locale is `ar`: prepends `/ar` to `href`
- If current locale is `en`: passes `href` unchanged
- `locale` prop allows explicit override (used by language toggle)

## Language Toggle API

```typescript
// Exposed by Header component

function switchLocale(newLocale: Locale): void {
  // 1. Set NEXT_LOCALE cookie (365 days, path=/)
  // 2. Set localStorage "promptsouq-locale"
  // 3. Navigate to equivalent URL with/without /ar prefix
}
```

## Translation Key Convention

Keys follow dot-notation nesting matching JSON structure:

```
{namespace}:{section}.{subsection}.{key}

Examples:
  common:header.nav.browse        → "Browse" / "تصفح"
  common:header.auth.signIn       → "Sign In" / "تسجيل دخول"
  common:footer.tagline           → "The first Arabic platform..." / "المنصة العربية الأولى..."
  home:hero.title                 → "Welcome to SouqPrompt" / "مرحباً في سوقبرومبت"
  market:filters.trending         → "Trending" / "الأكثر رواجاً"
  search:placeholder              → "Search for a prompt..." / "ابحث عن برومبت..."
```

When using `defaultNS: "common"`, the namespace prefix can be omitted for common keys:
```
t("header.nav.browse")  // Resolves from common namespace
t("home:hero.title")    // Explicit namespace required for non-default
```
