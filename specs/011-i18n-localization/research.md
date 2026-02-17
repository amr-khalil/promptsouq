# Research: Multi-Language Support (English & Arabic)

**Feature Branch**: `011-i18n-localization`
**Date**: 2026-02-17

## Decision 1: Routing Strategy for Locale-Prefixed URLs

**Decision**: Use a `[locale]` dynamic route segment under `src/app/[locale]/` with middleware rewriting. English URLs have no visible prefix; Arabic URLs use `/ar`.

**Rationale**:
- Next.js App Router natively supports dynamic segments, making `[locale]` the standard i18n pattern
- Middleware can transparently rewrite `/market` → `/en/market` internally while keeping the URL clean for English
- Arabic routes like `/ar/market` map directly to the `[locale]` segment
- `generateStaticParams` ensures both locales are pre-rendered
- This approach works with Server Components (locale from params) and Client Components (locale from context/provider)

**Alternatives considered**:
- **Separate route groups `(en)` and `ar/`**: Would duplicate every page file or require complex re-exports. Rejected for maintainability.
- **Cookie/header-only (no route segment)**: Would break SEO (search engines can't discover language variants). Rejected.
- **Subdomain-based (`ar.promptsouq.com`)**: Adds infrastructure complexity (DNS, SSL). Rejected as overkill for 2 languages.

## Decision 2: i18n Library Configuration

**Decision**: Use `i18next` + `react-i18next` (already installed) with separate server and client initialization.

**Rationale**:
- Already in `package.json` (`i18next@^25.8.10`, `react-i18next@^16.5.4`)
- User explicitly chose i18next based on documentation review
- Supports both Server Components (via `createInstance()` per request) and Client Components (via `I18nextProvider` + `useTranslation()`)
- Built-in fallback language support, namespace lazy-loading, and RTL direction detection via `i18next.dir()`

**Alternatives considered**:
- **next-intl**: Popular for App Router but would be a new dependency. User specifically chose i18next. Rejected.
- **next-i18next**: Dropped App Router support in v15+, recommends raw i18next. Rejected.

## Decision 3: Translation File Organization

**Decision**: JSON files per namespace per locale, stored in `src/i18n/locales/{locale}/{namespace}.json`.

**Rationale**:
- i18next best practices recommend namespaces for projects with 300+ translation segments (this project has ~100+ strings across public pages)
- JSON format is the i18next default; works with all tooling (extraction, management UIs)
- Per-namespace files enable lazy loading of page-specific translations
- Structured keys (e.g., `header.nav.browse`) per i18next recommendation — no natural language keys

**Namespace strategy**:
| Namespace | Content | Loaded on |
|-----------|---------|-----------|
| `common` | Header, Footer, shared buttons/labels, error messages | Every page |
| `home` | Hero, featured sections, testimonials, brand carousel | Home page |
| `market` | Filter labels, sort options, category names | Market page |
| `search` | Search input placeholder, result labels, filter text | Search page |
| `prompt` | Detail page labels, review form, purchase UI | Prompt detail |
| `subscription` | Plan names, feature lists, billing toggle | Subscription page |
| `auth` | Sign-in/sign-up form labels, OAuth button text | Auth pages |

**Alternatives considered**:
- **Single file per locale** (`en.json`, `ar.json`): Simple but doesn't scale; no lazy loading. Rejected.
- **TypeScript files with `as const`**: Better type inference but harder to manage with translation tools. JSON chosen for tooling compatibility.

## Decision 4: Middleware Integration with Clerk

**Decision**: Enhance existing `src/proxy.ts` to handle locale detection before Clerk auth, using the same middleware file.

**Rationale**:
- Next.js allows only one middleware file; Clerk already uses `proxy.ts`
- Locale detection (URL prefix check → saved cookie → `Accept-Language` header → default `en`) runs BEFORE Clerk auth
- Middleware sets `x-locale` header and `NEXT_LOCALE` cookie for downstream consumption
- Public route matcher updated to include `/ar/` prefixed variants
- English routes rewritten internally to `/en/...` (URL unchanged for user)
- Arabic browser users visiting non-prefixed routes get 307 redirect to `/ar/...`

**Alternatives considered**:
- **Separate middleware chain**: Not supported in Next.js (single middleware only). Rejected.
- **Client-side detection only**: Misses server-rendered content and SSR. Rejected.

## Decision 5: TypeScript Type Safety for Translations

**Decision**: Create `src/@types/i18next.d.ts` module augmentation with `CustomTypeOptions` for key autocomplete.

**Rationale**:
- i18next v25+ supports full TypeScript type safety via module augmentation
- Requires `resources` type to match actual translation JSON structure
- Enables IDE autocomplete for translation keys, preventing typos
- `defaultNS: "common"` ensures keys from `common.json` work without namespace prefix

**Alternatives considered**:
- **No type safety**: Faster to set up but high risk of runtime key mismatches. Rejected.
- **Generated types from CLI**: i18next-cli can generate types but adds tooling complexity. Deferred — manual type declarations sufficient for 2 languages.

## Decision 6: Language Preference Persistence

**Decision**: Use `localStorage` key `promptsouq-locale` for manual toggle preference, read by middleware via a `NEXT_LOCALE` cookie synced on toggle.

**Rationale**:
- Middleware runs server-side and cannot read `localStorage` directly
- On language toggle: set both `localStorage` (for client reads) and `document.cookie` (for middleware reads)
- Priority chain: cookie → `Accept-Language` header → default `en`
- Cookie name: `NEXT_LOCALE` (common convention, no expiry = session, or set 1-year expiry for persistence)

**Alternatives considered**:
- **localStorage only**: Middleware can't read it for SSR/redirect. Rejected for initial page load.
- **Database user preference**: Requires authentication; spec says persistence for all users including anonymous. Rejected.

## Decision 7: Constitution Principle I Amendment

**Decision**: Principle I ("Arabic-First & RTL") requires amendment. The feature explicitly changes the app from Arabic-first to bilingual with English as default.

**Rationale**:
- The spec states: "English becomes the new default language (the root route `/` serves English)"
- Constitution says: "All user-facing text MUST be in Arabic as the primary language" and "root HTML element MUST set `lang='ar'` and `dir='rtl'`"
- This is a deliberate, user-requested change to support a bilingual audience
- The amendment should update Principle I to: "The app MUST support both Arabic (RTL) and English (LTR) with English as the default language. Arabic is served at the `/ar` route prefix."

**Impact**: Root HTML `lang` and `dir` attributes become dynamic based on the active locale. All RTL/LTR styling already works via Tailwind's logical properties and the `dir` attribute.
