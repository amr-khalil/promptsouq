# Tasks: Multi-Language Support (English & Arabic)

**Input**: Design documents from `/specs/011-i18n-localization/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in feature specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js monolith**: `src/` at repository root, pages under `src/app/[locale]/`

---

## Phase 1: Setup (i18n Infrastructure)

**Purpose**: Create the i18n module, TypeScript types, and shared utilities needed by all user stories

- [x] T001 Create i18n settings with locale config, constants, and helper functions in `src/i18n/settings.ts` — export `defaultLocale`, `locales`, `Locale` type, `defaultNS`, `cookieName`, `getDirection()`, `isValidLocale()` per contracts/i18n-api.md
- [x] T002 Create server-side i18next instance factory in `src/i18n/server.ts` — export `getTranslation(locale, namespaces)` that creates a fresh i18next instance per request, loads JSON resources from `src/i18n/locales/`, configures `fallbackLng: "en"` and `defaultNS: "common"`
- [x] T003 Create client-side I18nProvider component in `src/i18n/client.tsx` — wraps react-i18next `I18nextProvider`, initializes i18next with the current locale and pre-loaded namespace resources passed as props
- [x] T004 Create TypeScript type declarations for i18next in `src/@types/i18next.d.ts` — module augmentation with `CustomTypeOptions` setting `defaultNS: "common"` and `resources` type matching the English common.json structure
- [x] T005 [P] Create locale-aware Link wrapper component in `src/components/LocaleLink.tsx` — wraps Next.js `<Link>`, reads current locale from route params or context, prepends `/ar` for Arabic locale, passes href unchanged for English. Accept optional `locale` prop for explicit override
- [x] T006 [P] Create LanguageToggle component shell in `src/components/LanguageToggle.tsx` — extract the existing AR|EN button markup from `src/components/Header.tsx` into a standalone client component. Include `switchLocale(newLocale)` function that sets `NEXT_LOCALE` cookie (365 days, path=/), sets `localStorage` key `promptsouq-locale`, and navigates to the equivalent URL with/without `/ar` prefix using `useRouter`

---

## Phase 2: Foundational (Route Restructure & Middleware)

**Purpose**: Restructure all page routes under `[locale]` dynamic segment and enhance middleware with locale detection. MUST complete before any translation work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create `src/app/[locale]/` directory and move ALL existing page routes into it — move `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` from `src/app/` into `src/app/[locale]/`. Move all route directories: `market/`, `search/`, `prompt/`, `subscription/`, `(auth)/`, `ranking/`, `seller/`, `dashboard/`, `sell/`, `cart/`, `checkout/`, `purchase/`, `admin/`. Keep `src/app/api/` and `src/app/globals.css` at root. Keep `src/app/layout.tsx` at root
- [x] T008 Add `generateStaticParams` to `src/app/[locale]/layout.tsx` or a shared config — return `[{ locale: "en" }, { locale: "ar" }]` so both locales are statically generated. If a `[locale]/layout.tsx` doesn't exist yet, create it as a pass-through layout that wraps children with the `I18nProvider` from `src/i18n/client.tsx`, passing the current locale and `["common"]` namespace
- [x] T009 Update root layout `src/app/layout.tsx` — make `<html lang>` and `<html dir>` dynamic based on the locale. Read locale from the `[locale]` route param (passed via layout params) or from cookies as fallback. Update `<Toaster>` `dir` prop to match. Ensure `ClerkProvider`, `ThemeProvider`, fonts, and global styles remain intact
- [x] T010 Update middleware `src/proxy.ts` — add locale detection logic BEFORE the Clerk middleware call: 1) Skip locale logic for static files, `/_next/`, and `/api/` routes. 2) If URL starts with `/ar`, set locale="ar" and continue. 3) If URL starts with `/en`, redirect (308) to the same path without `/en` prefix (canonical). 4) If no locale prefix: check `NEXT_LOCALE` cookie → check `Accept-Language` header for Arabic variants → default to "en". 5) For locale="en": rewrite URL to `/en/...` (invisible to user). 6) For locale="ar" (from detection): redirect (307) to `/ar/...`. Update Clerk `isPublicRoute` matcher to include `/ar/` prefixed variants of all public routes (e.g., `/ar/market(.*)`, `/ar/search(.*)`, etc.)
- [x] T011 Update all internal `<Link>` and `<a href>` references across public-facing components to use `LocaleLink` from `src/components/LocaleLink.tsx` instead of Next.js `Link` — start with `src/components/Header.tsx` and `src/components/Footer.tsx`. Ensure links within `[locale]` pages use relative paths or the `LocaleLink` wrapper to preserve locale context (FR-014)
- [x] T012 Run `npm run lint && npm run build` to verify the route restructure compiles correctly with no broken imports, missing pages, or routing errors. Fix any issues before proceeding

**Checkpoint**: Route restructure complete — all pages render at both `/` (English) and `/ar/` (Arabic) paths. No translations yet (pages still show current hardcoded text).

---

## Phase 3: User Story 1 — Browse in Default Language (Priority: P1) 🎯 MVP

**Goal**: All public-facing pages display in English by default at unprefixed routes with LTR layout

**Independent Test**: Navigate to `/`, `/market`, `/search`, `/prompt/[id]` — all static UI text renders in English, page direction is LTR

### English Translation Files

- [x] T013 [P] [US1] Create English common namespace translations in `src/i18n/locales/en/common.json` — extract all hardcoded Arabic text from `src/components/Header.tsx` and `src/components/Footer.tsx` into structured keys. Include: `header.nav.browse`, `header.nav.community`, `header.nav.blog`, `header.auth.signIn`, `header.auth.sellPrompt`, `header.logo`, `footer.tagline`, `footer.sections.discover`, `footer.sections.forSellers`, `footer.newsletter.*`, `footer.legal.*`, all shared button labels (`addToCart`, `buy`, `free`, `viewDetails`, etc.), and shared error/empty state messages
- [x] T014 [P] [US1] Create English home namespace translations in `src/i18n/locales/en/home.json` — extract text from `src/components/Hero.tsx`, `src/components/BestSellersCarousel.tsx`, `src/components/FreePromptsCarousel.tsx`, `src/components/NewArrivalsGrid.tsx`, `src/components/FeaturedBanner.tsx`, `src/components/FeaturedSellers.tsx`, `src/components/HowToSell.tsx`, `src/components/TechCard.tsx`, and the home page `src/app/[locale]/page.tsx`. Include hero headings, section titles, CTA button text, testimonials section labels
- [x] T015 [P] [US1] Create English market namespace translations in `src/i18n/locales/en/market.json` — extract text from `src/app/[locale]/market/page.tsx`. Include filter labels (trending, newest, price range), sort options, category display names, pagination text, empty state messages
- [x] T016 [P] [US1] Create English search namespace translations in `src/i18n/locales/en/search.json` — extract text from `src/app/[locale]/search/page.tsx` and `src/components/SearchInput.tsx`. Include search placeholder, result count labels, filter labels, no-results message
- [x] T017 [P] [US1] Create English prompt namespace translations in `src/i18n/locales/en/prompt.json` — extract text from `src/app/[locale]/prompt/[id]/page.tsx`, `src/components/PromptCard.tsx`, `src/components/prompt/ContentLockOverlay.tsx`, and `src/components/reviews/ReviewForm.tsx`. Include detail page labels, review form labels, purchase/cart buttons, pricing labels, difficulty labels
- [x] T018 [P] [US1] Create English subscription namespace translations in `src/i18n/locales/en/subscription.json` — extract text from `src/app/[locale]/subscription/page.tsx`, `src/components/subscription/PricingCard.tsx`, `src/components/subscription/BillingCycleToggle.tsx`, `src/components/subscription/TopupPackCard.tsx`. Include plan names, feature descriptions, billing toggle labels, CTA buttons
- [x] T019 [P] [US1] Create English auth namespace translations in `src/i18n/locales/en/auth.json` — extract text from `src/app/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx` and `src/app/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx`. Include form labels, OAuth button text, validation messages, links

### Component Integration (English)

- [x] T020 [US1] Integrate i18n into Header — update `src/components/Header.tsx` to use `useTranslation("common")`, replace all hardcoded Arabic strings with `t()` calls matching keys from `en/common.json`. Import and use the `LanguageToggle` component (from T006) in place of the static AR|EN button. Ensure the component is wrapped by `I18nProvider` via the `[locale]/layout.tsx`
- [x] T021 [US1] Integrate i18n into Footer — update `src/components/Footer.tsx` to use `useTranslation("common")`, replace all hardcoded Arabic strings with `t()` calls. Replace all `<Link>` and `<a>` with `LocaleLink` for internal navigation
- [x] T022 [US1] Integrate i18n into Home page components — update `src/components/Hero.tsx`, `src/components/BestSellersCarousel.tsx`, `src/components/FreePromptsCarousel.tsx`, `src/components/NewArrivalsGrid.tsx`, `src/components/FeaturedBanner.tsx`, `src/components/FeaturedSellers.tsx`, `src/components/HowToSell.tsx`, `src/components/TechCard.tsx`, and `src/app/[locale]/page.tsx` to use `useTranslation("home")` (or `getTranslation` for server components). Replace hardcoded text with `t()` calls. Keep user-generated content (prompt data from DB) as-is
- [x] T023 [P] [US1] Integrate i18n into Market page — update `src/app/[locale]/market/page.tsx` to use translations from `market` namespace. Replace filter labels, sort option text, section headings, and empty state messages with `t()` calls. Keep dynamic prompt data unchanged
- [x] T024 [P] [US1] Integrate i18n into Search page — update `src/app/[locale]/search/page.tsx` and `src/components/SearchInput.tsx` to use translations from `search` namespace. Replace placeholder text, result labels, and filter text with `t()` calls
- [x] T025 [P] [US1] Integrate i18n into Prompt detail page — update `src/app/[locale]/prompt/[id]/page.tsx`, `src/components/PromptCard.tsx`, `src/components/prompt/ContentLockOverlay.tsx`, and `src/components/reviews/ReviewForm.tsx` to use translations from `prompt` namespace. Replace static labels with `t()` calls. Keep user-generated prompt content (title, description, reviews) in original language (FR-013)
- [x] T026 [P] [US1] Integrate i18n into Subscription page — update `src/app/[locale]/subscription/page.tsx` and subscription components to use translations from `subscription` namespace
- [x] T027 [P] [US1] Integrate i18n into Auth pages — update sign-in and sign-up pages under `src/app/[locale]/(auth)/` to use translations from `auth` namespace. Replace form labels, headings, OAuth button text, and error messages with `t()` calls
- [x] T028 [US1] Integrate i18n into error and not-found pages — update `src/app/[locale]/error.tsx` and `src/app/[locale]/not-found.tsx` to use translations from `common` namespace for error headings, messages, and retry button text
- [x] T029 [US1] Add translated SEO metadata for English — update `src/app/[locale]/layout.tsx` or individual page `metadata` exports to generate English page titles and descriptions using `getTranslation()`. Include `<html lang="en">` and proper `<meta>` tags for English pages (FR-012)
- [x] T030 [US1] Run `npm run lint && npm run build` — verify the full app compiles with English translations, no broken imports, no missing translation keys. Fix all errors

**Checkpoint**: All public-facing pages render in English at unprefixed routes. LTR layout confirmed. This is the MVP.

---

## Phase 4: User Story 2 — Browse in Arabic via Route Prefix (Priority: P1)

**Goal**: All public-facing pages display in Arabic at `/ar`-prefixed routes with RTL layout

**Independent Test**: Navigate to `/ar`, `/ar/market`, `/ar/search` — all static UI text renders in Arabic, page direction is RTL

### Arabic Translation Files

- [x] T031 [P] [US2] Create Arabic common namespace translations in `src/i18n/locales/ar/common.json` — mirror all keys from `en/common.json` with Arabic translations. Use the current hardcoded Arabic strings from the existing Header/Footer as the source for accurate translations
- [x] T032 [P] [US2] Create Arabic home namespace translations in `src/i18n/locales/ar/home.json` — mirror all keys from `en/home.json` with Arabic translations. Source existing Arabic text from current Hero, carousel, and banner components
- [x] T033 [P] [US2] Create Arabic market namespace translations in `src/i18n/locales/ar/market.json` — mirror all keys from `en/market.json` with Arabic translations from the current market page
- [x] T034 [P] [US2] Create Arabic search namespace translations in `src/i18n/locales/ar/search.json` — mirror all keys from `en/search.json` with Arabic translations
- [x] T035 [P] [US2] Create Arabic prompt namespace translations in `src/i18n/locales/ar/prompt.json` — mirror all keys from `en/prompt.json` with Arabic translations
- [x] T036 [P] [US2] Create Arabic subscription namespace translations in `src/i18n/locales/ar/subscription.json` — mirror all keys from `en/subscription.json` with Arabic translations
- [x] T037 [P] [US2] Create Arabic auth namespace translations in `src/i18n/locales/ar/auth.json` — mirror all keys from `en/auth.json` with Arabic translations
- [x] T038 [US2] Add translated SEO metadata for Arabic — ensure page titles, descriptions, and `<html lang="ar" dir="rtl">` render correctly for `/ar` routes. Verify `<Toaster>` direction is RTL. Confirm `hreflang` alternate links in `<head>` pointing between English and Arabic versions (FR-012)
- [x] T039 [US2] Verify RTL layout renders correctly — manually check that `/ar` pages have proper right-to-left text alignment, mirrored navigation, correct icon placement, and no layout breaks. Confirm all Tailwind CSS logical properties and `dir="rtl"` produce correct results. Fix any LTR/RTL issues
- [x] T040 [US2] Run `npm run lint && npm run build` — verify the full app compiles with both language versions, no missing keys in Arabic files

**Checkpoint**: All public-facing pages render correctly in both English (/) and Arabic (/ar). Both LTR and RTL layouts confirmed.

---

## Phase 5: User Story 3 — Switch Language via Header Toggle (Priority: P1)

**Goal**: Users can click the language toggle to switch between English and Arabic, navigating to the equivalent page in the other language

**Independent Test**: On `/market`, click AR in toggle → navigates to `/ar/market` with Arabic content. On `/ar/market`, click EN → navigates to `/market` with English content. Query params preserved.

- [x] T041 [US3] Implement full switchLocale logic in `src/components/LanguageToggle.tsx` — on click: 1) Determine target locale (opposite of current). 2) Set `document.cookie` for `NEXT_LOCALE` with value, `max-age=31536000`, `path=/`. 3) Set `localStorage.setItem("promptsouq-locale", newLocale)`. 4) Compute target URL: if switching to Arabic, prepend `/ar` to current pathname; if switching to English, remove `/ar` prefix. Preserve query string and hash. 5) Navigate using `router.push(targetUrl)` or `window.location.href` for full page reload (ensures middleware processes the new locale)
- [x] T042 [US3] Ensure toggle is accessible in mobile navigation — update `src/components/Header.tsx` mobile menu (the `mobileMenuOpen` section) to include the `LanguageToggle` component. Verify toggle is reachable without scrolling on mobile viewports (FR-011)
- [x] T043 [US3] Run `npm run lint && npm run build` — verify toggle compiles and functions in both desktop and mobile views

**Checkpoint**: Language toggle switches between English and Arabic. Cookie is set. Subsequent visits respect the toggle choice.

---

## Phase 6: User Story 4 — Automatic Language Detection on First Visit (Priority: P1)

**Goal**: First-time visitors with Arabic browser language are auto-redirected to `/ar`. Saved preference overrides detection.

**Independent Test**: Set browser language to Arabic, clear cookies, visit `/` → redirected to `/ar`. Then manually toggle to English, revisit `/` → stays on English (cookie overrides).

- [x] T044 [US4] Verify and refine browser language detection in `src/proxy.ts` — ensure the middleware `Accept-Language` parsing correctly identifies Arabic variants (`ar`, `ar-SA`, `ar-EG`, `ar-AE`, etc.) using a prefix match on the header value. Confirm the detection only triggers when NO `NEXT_LOCALE` cookie exists. Confirm English and unsupported languages (e.g., `fr`) default to `en` without redirect
- [x] T045 [US4] Verify saved preference override — confirm that when `NEXT_LOCALE` cookie is set (from manual toggle in US3), it takes priority over `Accept-Language` header. Test scenario: Arabic browser user who previously toggled to English → visits `/` → stays on English (no redirect). Test: user clears cookies → auto-redirect resumes
- [x] T046 [US4] Handle edge case: explicit `/ar/` URL with English cookie — confirm that navigating directly to `/ar/market` renders Arabic content regardless of the `NEXT_LOCALE` cookie value. The cookie only governs auto-detection on non-prefixed routes, not explicit locale URLs
- [x] T047 [US4] Run `npm run lint && npm run build`

**Checkpoint**: Browser detection works for first-time visitors. Saved preferences override detection. Edge cases handled.

---

## Phase 7: User Story 5 — Visual Language Indicator (Priority: P2)

**Goal**: The active language in the header toggle is visually distinguished from the inactive one

**Independent Test**: View header on English page → "EN" is highlighted, "AR" is subdued. View header on Arabic page → "AR" is highlighted, "EN" is subdued.

- [x] T048 [US5] Style active/inactive states in `src/components/LanguageToggle.tsx` — read current locale from route params or i18n context. Apply `text-white font-bold` (or similar prominence) to the active language code and `text-zinc-500` (subdued) to the inactive one. Maintain the existing button styling (bg-zinc-900, border, rounded-lg) from the original Header. Ensure styles work in both desktop and mobile views
- [x] T049 [US5] Run `npm run lint && npm run build`

**Checkpoint**: Active language is clearly visible in the toggle on all viewports.

---

## Phase 8: User Story 6 — Fallback for Missing Translations (Priority: P2)

**Goal**: Missing Arabic translations gracefully display the English version

**Independent Test**: Temporarily remove a key from `ar/common.json`, visit `/ar` → the missing text shows in English instead of a raw key or empty space.

- [x] T050 [US6] Verify i18next fallback configuration in `src/i18n/server.ts` and `src/i18n/client.tsx` — confirm both server and client i18next instances have `fallbackLng: "en"` configured. Confirm `returnEmptyString: false` is set so empty strings trigger fallback. Verify that `saveMissing: false` is set for production (no console noise)
- [x] T051 [US6] Validate fallback works end-to-end — temporarily remove one key from `src/i18n/locales/ar/common.json`, verify the English text appears on `/ar` pages for that key, then restore the key. Confirm no console errors or visible translation key strings
- [x] T052 [US6] Run `npm run lint && npm run build`

**Checkpoint**: Fallback confirmed. Incomplete Arabic translations degrade gracefully to English.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, SEO, and cleanup across all stories

- [x] T053 Verify all internal links across public pages use `LocaleLink` — audit `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/PromptCard.tsx`, `src/components/Hero.tsx`, and all page files under `src/app/[locale]/` for any remaining raw `<Link>` or `<a>` tags that should be locale-aware. Replace as needed (FR-014)
- [x] T054 [P] Add `hreflang` alternate link tags — in `src/app/[locale]/layout.tsx` or a shared `<Head>` component, add `<link rel="alternate" hrefLang="en" href="...">` and `<link rel="alternate" hrefLang="ar" href="...">` for each page so search engines discover both language versions (FR-012, SC-006)
- [x] T055 [P] Update TypeScript type declarations in `src/@types/i18next.d.ts` — now that all 7 namespace JSON files exist, update the `resources` type in `CustomTypeOptions` to include all namespaces (common, home, market, search, prompt, subscription, auth) for full key autocomplete across the project
- [x] T056 [P] Verify deferred pages still function — confirm that non-translated pages (dashboard, admin, seller management, sell, cart, checkout) render without errors under the `[locale]` route structure. They should display their current hardcoded text and not break
- [x] T057 Final full build verification — run `npm run lint && npm run build`. Verify zero errors, zero warnings related to i18n. Navigate key pages in both languages to confirm no regressions (SC-003, SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — English translations + component integration
- **US2 (Phase 4)**: Depends on Phase 3 (needs English files as template for Arabic mirrors)
- **US3 (Phase 5)**: Depends on Phase 2 (LanguageToggle shell created in Phase 1, full logic after routing works)
- **US4 (Phase 6)**: Depends on Phase 2 (middleware already has detection logic, this phase verifies/refines it) + Phase 5 (needs cookie persistence from toggle)
- **US5 (Phase 7)**: Depends on Phase 5 (toggle must exist before styling)
- **US6 (Phase 8)**: Depends on Phase 3 + Phase 4 (both language files must exist)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational)
                      │
                      ├→ Phase 3 (US1: English) → Phase 4 (US2: Arabic) → Phase 8 (US6: Fallback)
                      │                                                          │
                      └→ Phase 5 (US3: Toggle) → Phase 6 (US4: Detection)       │
                              │                                                  │
                              └→ Phase 7 (US5: Visual Indicator)                 │
                                                                                 │
                                                           Phase 9 (Polish) ←───┘
```

### Parallel Opportunities

**Phase 1**: T005 and T006 can run in parallel (different files, no dependencies)
**Phase 3**: T013–T019 (all 7 English translation files) can run in parallel. T023–T027 (page integrations) can run in parallel after T020–T022 establish the pattern
**Phase 4**: T031–T037 (all 7 Arabic translation files) can run in parallel
**Phase 5 + Phase 3**: US3 (toggle) can start after Phase 2 in parallel with US1 (English translations) if the toggle doesn't need translations yet
**Phase 9**: T054, T055, T056 can run in parallel

---

## Parallel Example: Phase 3 (US1 Translation Files)

```bash
# Launch all 7 English translation files in parallel:
Task: T013 "Create en/common.json"
Task: T014 "Create en/home.json"
Task: T015 "Create en/market.json"
Task: T016 "Create en/search.json"
Task: T017 "Create en/prompt.json"
Task: T018 "Create en/subscription.json"
Task: T019 "Create en/auth.json"

# Then launch page integrations in parallel (after Header/Footer done):
Task: T023 "Integrate i18n into Market page"
Task: T024 "Integrate i18n into Search page"
Task: T025 "Integrate i18n into Prompt detail page"
Task: T026 "Integrate i18n into Subscription page"
Task: T027 "Integrate i18n into Auth pages"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 2: Foundational route restructure (T007–T012)
3. Complete Phase 3: US1 English translations + integration (T013–T030)
4. **STOP and VALIDATE**: All public pages render in English at unprefixed routes with LTR layout
5. This is a deployable MVP — the app works fully in English

### Incremental Delivery

1. Setup + Foundational → Route structure ready
2. Add US1 (English) → Test → Deploy (**MVP!**)
3. Add US2 (Arabic) → Test → Deploy (bilingual content live)
4. Add US3 (Toggle) → Test → Deploy (users can switch)
5. Add US4 (Detection) → Test → Deploy (auto-redirect for Arabic users)
6. Add US5 (Visual Indicator) → Test → Deploy (polished toggle)
7. Add US6 (Fallback) → Verify → Deploy (graceful degradation)
8. Polish → Final verification → Ship

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Translation files should be created by reading the CURRENT hardcoded Arabic text from each component, translating to English for `en/*.json`, and preserving the original Arabic in `ar/*.json`
- Keep user-generated content (prompt titles, descriptions, reviews, seller names) in their original language — only translate static UI chrome
- Commit after each task or logical group
- Run `npm run lint && npm run build` at every checkpoint (T012, T030, T040, T043, T047, T049, T052, T057)
- Deferred pages (dashboard, admin, sell, cart, checkout) keep their current text but must not break under the new `[locale]` routing
