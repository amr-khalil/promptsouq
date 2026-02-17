# Feature Specification: Multi-Language Support (English & Arabic)

**Feature Branch**: `011-i18n-localization`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "Make the app multi-language with English as default and Arabic. Activate the language toggle button in the header. Arabic is served at the /ar route prefix, English is the default (no prefix). Use translation files organized by language."

## Clarifications

### Session 2026-02-17

- Q: When a user with an Arabic browser language visits `/`, what should happen? → A: Auto-redirect to `/ar` if browser language is Arabic (seamless, no user action needed).
- Q: After a user manually switches language via the toggle, should that choice persist across visits? → A: Yes, persist in browser storage — manual toggle overrides auto-detection on all future visits.
- Q: Should all pages be translated in this phase, or prioritize public-facing pages? → A: Public pages first — Home, Market, Search, Prompt detail, Header, Footer. Dashboard, Admin, and Seller pages deferred to a subsequent phase.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse in Default Language (Priority: P1)

A visitor arrives at the site and sees all content displayed in English by default. All navigation, headings, buttons, labels, and static text appear in English. The page layout flows left-to-right.

**Why this priority**: The foundation of multi-language support — without a working default language, no other i18n functionality is useful. This story delivers a fully functional English experience.

**Independent Test**: Can be fully tested by navigating to any page (e.g., `/`, `/market`, `/search`) and verifying all static UI text renders in English with left-to-right layout.

**Acceptance Scenarios**:

1. **Given** a user visits the root URL `/`, **When** the page loads, **Then** all static text (header links, hero content, buttons, footer) displays in English and the page direction is left-to-right.
2. **Given** a user navigates to `/market`, **When** the page loads, **Then** all UI labels and navigation elements display in English.
3. **Given** a user visits any page without a language prefix, **When** the page loads, **Then** the document language is set to English and the layout direction is LTR.

---

### User Story 2 - Browse in Arabic via Route Prefix (Priority: P1)

A user navigates to any page prefixed with `/ar` (e.g., `/ar`, `/ar/market`) and sees all content in Arabic. The page layout switches to right-to-left. All navigation, headings, buttons, and static text appear in Arabic.

**Why this priority**: Equally critical as Story 1 — Arabic support is the core purpose of this feature. Without route-based Arabic pages, the bilingual goal is unmet.

**Independent Test**: Can be fully tested by navigating to `/ar` and verifying all static text renders in Arabic with right-to-left layout.

**Acceptance Scenarios**:

1. **Given** a user visits `/ar`, **When** the page loads, **Then** all static text displays in Arabic and the page direction is right-to-left.
2. **Given** a user visits `/ar/market`, **When** the page loads, **Then** all UI labels and navigation appear in Arabic with RTL layout.
3. **Given** a user visits `/ar/prompt/[id]`, **When** the page loads, **Then** static chrome (header, footer, buttons) displays in Arabic while user-generated content (prompt title, description) displays in its original language.

---

### User Story 3 - Switch Language via Header Toggle (Priority: P1)

A user clicks the language toggle button in the header (currently showing "AR | EN") to switch between English and Arabic. The app navigates to the equivalent page in the selected language.

**Why this priority**: The toggle is the primary user-facing mechanism for language switching. Without it, users must manually edit URLs to change language.

**Independent Test**: Can be fully tested by clicking the language toggle on any page and verifying the page reloads in the other language with the correct route prefix.

**Acceptance Scenarios**:

1. **Given** a user is viewing `/market` in English, **When** they click the Arabic option in the language toggle, **Then** the app navigates to `/ar/market` and displays content in Arabic with RTL layout.
2. **Given** a user is viewing `/ar/market` in Arabic, **When** they click the English option in the language toggle, **Then** the app navigates to `/market` and displays content in English with LTR layout.
3. **Given** a user is on the homepage `/`, **When** they click the language toggle, **Then** the active language in the toggle updates visually to indicate the current language.
4. **Given** a user is viewing a page with URL parameters (e.g., `/search?q=gpt`), **When** they switch language, **Then** the query parameters are preserved in the new URL (e.g., `/ar/search?q=gpt`).

---

### User Story 4 - Automatic Language Detection on First Visit (Priority: P1)

A first-time visitor arrives at the site without a language prefix. The system detects the browser's preferred language. If the browser language is Arabic, the user is automatically redirected to the `/ar` equivalent of the requested page. If the browser language is English or any other language, the user remains on the English (default) version.

**Why this priority**: Ensures Arabic-speaking users — a primary audience — land in their preferred language without manual intervention. Critical for user retention and first-impression experience.

**Independent Test**: Can be fully tested by setting browser language to Arabic, visiting `/`, and verifying automatic redirect to `/ar`.

**Acceptance Scenarios**:

1. **Given** a user's browser language is set to Arabic (`ar`, `ar-SA`, `ar-EG`, etc.), **When** they visit `/`, **Then** they are automatically redirected to `/ar`.
2. **Given** a user's browser language is set to Arabic, **When** they visit `/market`, **Then** they are automatically redirected to `/ar/market`.
3. **Given** a user's browser language is set to English or any non-Arabic language, **When** they visit `/`, **Then** they remain on `/` with English content.
4. **Given** a user's browser language is set to French (unsupported), **When** they visit `/`, **Then** they remain on `/` with English content (default fallback).
5. **Given** a user was previously auto-redirected to `/ar` but manually switched to English via the toggle, **When** they visit `/` on a subsequent visit, **Then** they remain on `/` in English (saved preference overrides browser detection).
6. **Given** a user has no saved language preference, **When** they visit `/` with an Arabic browser, **Then** auto-redirect to `/ar` applies.

---

### User Story 5 - Visual Language Indicator (Priority: P2)

The language toggle button in the header clearly indicates which language is currently active. The active language text is visually prominent (e.g., bold or highlighted) while the inactive language appears subdued.

**Why this priority**: Provides user orientation — users should always know which language mode they're in. Important for usability but the app functions without it.

**Independent Test**: Can be tested by loading pages in each language and verifying the toggle reflects the correct active state.

**Acceptance Scenarios**:

1. **Given** a user is browsing in English, **When** they look at the header toggle, **Then** "EN" appears highlighted/active and "AR" appears subdued.
2. **Given** a user is browsing in Arabic, **When** they look at the header toggle, **Then** "AR" appears highlighted/active and "EN" appears subdued.

---

### User Story 6 - Fallback for Missing Translations (Priority: P2)

When a translation string is missing in Arabic, the system gracefully falls back to displaying the English version of that text rather than showing a broken key or empty space.

**Why this priority**: Ensures a complete user experience even during incremental translation work. Prevents broken UI during development and content updates.

**Independent Test**: Can be tested by intentionally omitting an Arabic translation key and verifying the English fallback text appears on the Arabic page.

**Acceptance Scenarios**:

1. **Given** a translation key exists in English but not in Arabic, **When** a user views the Arabic version of that page, **Then** the English text displays as a fallback.
2. **Given** all translations exist for both languages, **When** a user views any page, **Then** no fallback is triggered and all text appears in the correct language.

---

### Edge Cases

- What happens when a user navigates to `/ar/ar/market` (double prefix)? The system should treat this as a 404 or redirect to `/ar/market`.
- What happens when a user bookmarks an Arabic URL and the translation for that page is later removed? The page should still render using English fallback text.
- What happens with dynamic content (user-generated prompt titles, descriptions, reviews)? These remain in their original language — only static UI chrome is translated.
- What happens on mobile where the header toggle may be hidden? The toggle should be accessible in the mobile menu as well.
- What happens with SEO metadata (page titles, meta descriptions)? These should also be translated per language for proper search engine indexing.
- What happens if a user directly types a URL with an unsupported language prefix (e.g., `/fr/market`)? The system should return a 404 or redirect to the English default.
- What happens if a user clears their browser storage? The saved language preference is lost and browser language auto-detection resumes on next visit.
- What happens if a user with a saved English preference directly navigates to `/ar/market`? The explicit URL takes precedence — they see Arabic. The saved preference only governs auto-detection on non-prefixed routes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support exactly two languages: English (default) and Arabic.
- **FR-002**: English pages MUST be served at standard routes without any language prefix (e.g., `/`, `/market`, `/search`).
- **FR-003**: Arabic pages MUST be served at routes prefixed with `/ar` (e.g., `/ar`, `/ar/market`, `/ar/search`).
- **FR-004**: The language toggle button in the header MUST navigate the user to the equivalent page in the other language, preserving the current path and query parameters.
- **FR-005**: The language toggle MUST visually indicate which language is currently active.
- **FR-006**: The page document language attribute MUST reflect the active language (`en` for English, `ar` for Arabic).
- **FR-007**: The page layout direction MUST be LTR for English and RTL for Arabic.
- **FR-008**: All static UI text on public-facing pages (Home, Market, Search, Prompt detail, Header, Footer) MUST be translatable and served in the active language. This includes navigation labels, button text, headings, form labels, placeholder text, error messages, and footer content.
- **FR-009**: The system MUST fall back to English when an Arabic translation is missing for a given text.
- **FR-010**: Translation strings MUST be organized in separate files per language for maintainability.
- **FR-011**: The language toggle MUST be accessible in both desktop and mobile navigation views.
- **FR-012**: SEO metadata (page titles, meta descriptions) MUST be translated per language.
- **FR-013**: Dynamic user-generated content (prompt titles, descriptions, reviews, seller names) MUST remain in their original language regardless of the active UI language.
- **FR-014**: Internal navigation links MUST preserve the current language context (e.g., clicking a link while on `/ar/market` should lead to another `/ar/...` page, not drop the prefix).
- **FR-015**: Only `/ar` is a valid language prefix. Any other prefix (e.g., `/fr`, `/de`) MUST be treated as a standard route (likely resulting in a 404).
- **FR-016**: The system MUST detect the user's browser language on first visit to a non-prefixed route and automatically redirect to `/ar` if the browser language is any Arabic variant (`ar`, `ar-SA`, `ar-EG`, etc.).
- **FR-017**: If the browser language is not Arabic, the system MUST serve the English default without redirection.
- **FR-018**: When a user manually switches language via the header toggle, the system MUST persist that choice in the browser so it overrides auto-detection on all future visits.
- **FR-019**: A saved language preference MUST take priority over browser language detection. Auto-detection MUST only apply when no saved preference exists.

### Key Entities

- **Translation String**: A key-value pair mapping a unique identifier to localized text for a specific language. Organized by language and optionally grouped by namespace (e.g., common UI, page-specific).
- **Language**: A supported locale with a code (`en`, `ar`), display name, text direction (LTR/RTL), and route prefix (none for English, `/ar` for Arabic).
- **Language Preference**: The user's currently active language. Determined by (in priority order): 1) saved browser preference from manual toggle, 2) browser language detection (Arabic variants trigger `/ar`), 3) URL route prefix default (English).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of static UI text on public-facing pages (Home, Market, Search, Prompt detail, Header, Footer) displays in the correct language based on the active route.
- **SC-002**: Users can switch languages in under 2 seconds via the header toggle, with the page rendering fully in the new language.
- **SC-003**: Zero broken UI elements (no visible translation keys, empty strings, or layout breaks) when browsing in either language.
- **SC-004**: All existing pages and features continue to function identically in both language modes — no regression in functionality.
- **SC-005**: The language toggle is discoverable and usable on both desktop and mobile viewports without requiring scrolling or extra navigation steps.
- **SC-006**: Search engines can index both English and Arabic versions of all pages with correct language-specific metadata.
- **SC-007**: Missing Arabic translations gracefully fall back to English with no user-visible errors or broken layouts.

## Assumptions

- The current Arabic-first hardcoded text throughout the app will be extracted into translation files for both English and Arabic.
- English becomes the new default language (the root route `/` serves English), reversing the current Arabic-first approach.
- User-generated content (prompts, reviews, etc.) stored in the database is not translated — only static UI chrome is within scope.
- The two languages (English and Arabic) are the complete scope — no additional languages will be added in this phase.
- Translation files will use structured keys (e.g., `header.navigation.browse`) rather than natural language keys for maintainability.
- The language preference is determined by the URL route, supplemented by browser language detection for automatic redirection on first visit to non-prefixed routes.
- Existing authenticated routes and API endpoints are not affected by the language prefix — only user-facing pages receive language routing.
- Translation of authenticated pages (User Dashboard, Admin panel, Seller storefront management) is deferred to a subsequent phase. These pages will continue to display in their current language until translated.
- The i18n infrastructure (routing, toggle, detection) will be in place for all pages, but actual translation strings are only required for public-facing pages in this phase.
