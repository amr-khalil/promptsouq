# Implementation Plan: Multi-Language Support (English & Arabic)

**Branch**: `011-i18n-localization` | **Date**: 2026-02-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-i18n-localization/spec.md`

## Summary

Add bilingual support (English default + Arabic at `/ar`) to PromptSouq using i18next + react-i18next with Next.js App Router. The implementation restructures routing to use a `[locale]` dynamic segment, enhances the existing Clerk middleware with locale detection and browser language auto-redirect, extracts all hardcoded Arabic text into structured JSON translation files, and activates the existing language toggle button in the Header. Translation scope covers public-facing pages only (Home, Market, Search, Prompt detail, Header, Footer, Subscription, Auth).

## Technical Context

**Language/Version**: TypeScript 5.x (strict) + Next.js 16.x (App Router), React 19.x
**Primary Dependencies**: i18next 25.x, react-i18next 16.x (already installed), Clerk 6.x, Tailwind CSS 4.x
**Storage**: JSON translation files (no database changes)
**Testing**: Playwright (E2E: locale routing, language toggle, browser detection)
**Target Platform**: Web (desktop + mobile browsers)
**Project Type**: Web application (Next.js monolith)
**Performance Goals**: Language switch < 2 seconds; no additional network requests for pre-loaded namespaces
**Constraints**: Only 2 locales (en, ar); English default with no URL prefix; Arabic at `/ar`; ~145 translation keys per locale
**Scale/Scope**: ~26 page routes, ~50+ client components, ~7 translation namespaces, ~290 total translation keys

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | **VIOLATION** | Feature changes app from Arabic-only to bilingual with English default. Amendment required. See Complexity Tracking. |
| II. Mobile-First | PASS | Language toggle includes mobile menu. All changes are responsive. |
| III. Server Components — No Server Actions | PASS | Server Components use `getTranslation()` directly. Client Components use `useTranslation()` hook. No server actions. |
| IV. Supabase / Drizzle | PASS (N/A) | No database changes. Translation data in JSON files. |
| V. Stripe | PASS (N/A) | Payment flows unchanged. |
| VI. shadcn/ui Components | PASS | Language toggle uses existing button patterns. `cn()` for class merging. |
| VII. Playwright E2E | PASS | Tests planned for locale routing, toggle, and browser detection. |
| VIII. Zod Validation | PASS (N/A) | No new API boundaries. |
| IX. React Hook Form | PASS (N/A) | No new forms. |
| X. Page Loading States | PASS | Existing `loading.tsx` files move with pages into `[locale]` segment. |

### Post-Design Re-Check

All gates pass. Principle I violation is justified and documented in Complexity Tracking. Constitution amendment proposed in research.md (Decision 7).

## Project Structure

### Documentation (this feature)

```text
specs/011-i18n-localization/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0: 7 technical decisions
├── data-model.md        # Phase 1: Translation file structure
├── quickstart.md        # Phase 1: Developer guide
├── contracts/
│   ├── routing.md       # Phase 1: URL mapping & middleware behavior
│   └── i18n-api.md      # Phase 1: Internal API contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                  # Root layout (dynamic lang/dir from locale)
│   ├── globals.css                 # Unchanged
│   ├── [locale]/                   # NEW: All pages move here
│   │   ├── page.tsx                # Home
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── market/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── search/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── prompt/[id]/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── subscription/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-in/sso-callback/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── sign-up/sso-callback/page.tsx
│   │   ├── ranking/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── seller/
│   │   │   ├── page.tsx
│   │   │   ├── [sellerId]/page.tsx
│   │   │   ├── [sellerId]/loading.tsx
│   │   │   └── onboarding/complete/page.tsx
│   │   ├── dashboard/              # Deferred translation, but route moves here
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── ... (all dashboard sub-routes)
│   │   ├── sell/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── purchase/[id]/
│   │   └── admin/
│   └── api/                        # API routes stay here (no locale segment)
│       └── ... (unchanged)
├── i18n/                           # NEW: i18n infrastructure
│   ├── settings.ts                 # Locale config, constants, helpers
│   ├── server.ts                   # Server-side i18next instance factory
│   ├── client.tsx                  # Client-side I18nProvider component
│   └── locales/
│       ├── en/
│       │   ├── common.json         # Header, Footer, shared UI (~40 keys)
│       │   ├── home.json           # Home page (~30 keys)
│       │   ├── market.json         # Market page (~15 keys)
│       │   ├── search.json         # Search page (~10 keys)
│       │   ├── prompt.json         # Prompt detail (~20 keys)
│       │   ├── subscription.json   # Subscription page (~15 keys)
│       │   └── auth.json           # Sign-in/up (~15 keys)
│       └── ar/
│           └── ... (mirror of en/)
├── @types/
│   └── i18next.d.ts                # NEW: TypeScript type declarations
├── components/
│   ├── LocaleLink.tsx              # NEW: Locale-aware Link wrapper
│   ├── LanguageToggle.tsx          # NEW: Extracted from Header
│   ├── Header.tsx                  # MODIFIED: Uses useTranslation
│   ├── Footer.tsx                  # MODIFIED: Uses useTranslation
│   └── ... (other components modified incrementally)
├── proxy.ts                        # MODIFIED: Locale detection + Clerk auth
└── lib/
    └── ... (unchanged)
```

**Structure Decision**: Next.js App Router monolith with `[locale]` dynamic segment. All page routes move under `src/app/[locale]/`. API routes remain at `src/app/api/` (no locale). New `src/i18n/` directory for translation infrastructure. This follows the standard Next.js App Router i18n pattern.

## Complexity Tracking

> **Constitution Principle I violation justification**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle I: Arabic-First changed to bilingual English-default | User explicitly requested English as default with Arabic at `/ar`. The app serves an international audience where English broadens reach. Arabic remains fully supported as a first-class language via `/ar` prefix and browser auto-detection. | Keeping Arabic-only would not meet the bilingual requirement. Making Arabic default with `/en` prefix was considered but rejected — user specified English as default. |

**Proposed constitution amendment**: Update Principle I to:
> "The app MUST support both Arabic (RTL) and English (LTR). English is the default language served at root routes. Arabic is served at `/ar`-prefixed routes. Both languages are first-class: all public-facing static text MUST have translations in both languages. Layout direction and HTML attributes MUST adapt dynamically based on the active locale."
