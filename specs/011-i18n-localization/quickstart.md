# Quickstart: Multi-Language Support Development

**Feature Branch**: `011-i18n-localization`
**Date**: 2026-02-17

## Prerequisites

- Node.js 18+, npm
- i18next and react-i18next already in `package.json`
- Access to the PromptSouq development environment

## Getting Started

### 1. Install & Run

```bash
git checkout 011-i18n-localization
npm install
npm run dev
```

### 2. Verify Locale Routing

After implementation, test these URLs:

| URL | Expected |
|-----|----------|
| `http://localhost:3000/` | English content, LTR layout |
| `http://localhost:3000/ar` | Arabic content, RTL layout |
| `http://localhost:3000/market` | English market page |
| `http://localhost:3000/ar/market` | Arabic market page |

### 3. Adding a New Translation Key

1. Add the key to `src/i18n/locales/en/{namespace}.json`
2. Add the Arabic translation to `src/i18n/locales/ar/{namespace}.json`
3. Use in component:
   - Server Component: `const { t } = await getTranslation(locale, "namespace");`
   - Client Component: `const { t } = useTranslation("namespace");`
4. Reference key: `t("section.key")`

### 4. Testing Language Toggle

1. Visit `http://localhost:3000/`
2. Click the language toggle in the header
3. Verify redirect to `/ar` with Arabic content and RTL layout
4. Click toggle again to return to English

### 5. Testing Browser Detection

1. Set browser language to Arabic (Chrome: Settings → Languages → Arabic first)
2. Clear cookies for `localhost`
3. Visit `http://localhost:3000/`
4. Should auto-redirect to `/ar`

## Key Files

| File | Purpose |
|------|---------|
| `src/i18n/settings.ts` | Locale config, defaults, helpers |
| `src/i18n/server.ts` | Server-side i18next factory |
| `src/i18n/client.ts` | Client-side provider |
| `src/i18n/locales/en/*.json` | English translations |
| `src/i18n/locales/ar/*.json` | Arabic translations |
| `src/proxy.ts` | Middleware (locale detection + Clerk) |
| `src/app/[locale]/layout.tsx` | Locale-specific layout |
| `src/components/LocaleLink.tsx` | Locale-aware Link wrapper |
| `src/@types/i18next.d.ts` | TypeScript type declarations |

## Common Tasks

### Add a new page with translations

1. Create page at `src/app/[locale]/your-page/page.tsx`
2. Create namespace file: `src/i18n/locales/en/your-page.json`
3. Copy and translate to: `src/i18n/locales/ar/your-page.json`
4. Import translations in page component using `getTranslation(locale, "your-page")`

### Fix a missing translation

1. Check browser console for i18next missing key warnings
2. Add the key to both `en` and `ar` namespace files
3. If only Arabic is missing, English fallback displays automatically

## Verification Commands

```bash
npm run lint      # Check for linting errors
npm run build     # Verify production build succeeds
```

Both must pass with zero errors after any changes.
