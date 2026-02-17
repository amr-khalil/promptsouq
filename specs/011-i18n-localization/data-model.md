# Data Model: Multi-Language Support (English & Arabic)

**Feature Branch**: `011-i18n-localization`
**Date**: 2026-02-17

## Overview

This feature has **no database schema changes**. All translation data is stored in static JSON files bundled with the application. The data model describes the structure of translation files and the locale configuration.

## Entities

### Locale Configuration

Represents a supported language in the application.

| Field | Type | Description |
|-------|------|-------------|
| code | string | ISO 639-1 language code (`en`, `ar`) |
| name | string | Display name in the language itself (`English`, `العربية`) |
| dir | `"ltr"` \| `"rtl"` | Text direction |
| routePrefix | string \| null | URL prefix (`null` for English, `"ar"` for Arabic) |
| isDefault | boolean | Whether this is the fallback language |

**Supported locales** (hardcoded in config):

```
en: { name: "English", dir: "ltr", routePrefix: null, isDefault: true }
ar: { name: "العربية", dir: "rtl", routePrefix: "ar", isDefault: false }
```

### Translation Resource

A JSON file containing key-value pairs for a specific namespace and locale.

| Field | Type | Description |
|-------|------|-------------|
| namespace | string | Logical grouping (e.g., `common`, `home`, `market`) |
| locale | string | Language code (`en`, `ar`) |
| keys | Record<string, string \| object> | Nested key-value translation pairs |

**File path pattern**: `src/i18n/locales/{locale}/{namespace}.json`

**Example** (`src/i18n/locales/en/common.json`):
```json
{
  "header": {
    "nav": {
      "browse": "Browse",
      "community": "Community",
      "blog": "Blog"
    },
    "auth": {
      "signIn": "Sign In",
      "sellPrompt": "Sell Prompt"
    },
    "logo": "SouqPrompt"
  },
  "footer": {
    "tagline": "The first Arabic platform for buying and selling AI prompts",
    "sections": {
      "discover": "Discover",
      "forSellers": "For Sellers"
    }
  }
}
```

### Language Preference (Client-Side)

The user's manually chosen language, persisted in the browser.

| Storage | Key | Value | Purpose |
|---------|-----|-------|---------|
| Cookie | `NEXT_LOCALE` | `en` \| `ar` | Read by middleware for server-side routing |
| localStorage | `promptsouq-locale` | `en` \| `ar` | Read by client for instant toggle state |

**Priority chain for locale resolution**:
1. URL path prefix (`/ar/...` → `ar`)
2. `NEXT_LOCALE` cookie (set by manual toggle)
3. `Accept-Language` header (browser detection, Arabic variants → `ar`)
4. Default: `en`

## Namespace Inventory

| Namespace | Key Count (est.) | Pages | Load Strategy |
|-----------|-----------------|-------|---------------|
| `common` | ~40 | All pages | Always loaded |
| `home` | ~30 | Home | Page entry |
| `market` | ~15 | Market | Page entry |
| `search` | ~10 | Search | Page entry |
| `prompt` | ~20 | Prompt detail | Page entry |
| `subscription` | ~15 | Subscription | Page entry |
| `auth` | ~15 | Sign-in, Sign-up | Page entry |

**Total estimated keys**: ~145 per locale, ~290 across both languages.

## Relationships

```
Locale (en/ar)
  └── has many → Translation Resources (one per namespace)
       └── contains → Translation Keys (nested key-value pairs)

User Visit
  └── resolved by → Locale Resolution Chain
       ├── 1. URL prefix
       ├── 2. Saved cookie
       ├── 3. Browser language
       └── 4. Default (en)
```

## No Database Changes Required

- Existing database tables (prompts, categories, reviews, etc.) are unchanged
- User-generated content remains in its original language (per spec FR-013)
- Some DB fields already support bilingual data (`titleAr`/`titleEn`, `descriptionAr`/`descriptionEn`) — these are used as-is
- No migration files needed for this feature
