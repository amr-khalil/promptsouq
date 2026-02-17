# Routing Contract: Locale-Aware URL Mapping

**Feature Branch**: `011-i18n-localization`
**Date**: 2026-02-17

## URL Schema

### English (Default — No Prefix)

| User-Facing URL | Internal Route | Locale |
|-----------------|---------------|--------|
| `/` | `/en/` | `en` |
| `/market` | `/en/market` | `en` |
| `/search?q=gpt` | `/en/search?q=gpt` | `en` |
| `/prompt/abc-123` | `/en/prompt/abc-123` | `en` |
| `/subscription` | `/en/subscription` | `en` |
| `/sign-in` | `/en/sign-in` | `en` |
| `/dashboard` | `/en/dashboard` | `en` |

### Arabic (`/ar` Prefix)

| User-Facing URL | Internal Route | Locale |
|-----------------|---------------|--------|
| `/ar` | `/ar/` | `ar` |
| `/ar/market` | `/ar/market` | `ar` |
| `/ar/search?q=gpt` | `/ar/search?q=gpt` | `ar` |
| `/ar/prompt/abc-123` | `/ar/prompt/abc-123` | `ar` |
| `/ar/subscription` | `/ar/subscription` | `ar` |
| `/ar/sign-in` | `/ar/sign-in` | `ar` |
| `/ar/dashboard` | `/ar/dashboard` | `ar` |

### Non-Locale Routes (No Rewriting)

| URL | Behavior |
|-----|----------|
| `/api/*` | Passed through unchanged |
| `/_next/*` | Static assets, no locale |
| `/favicon.ico` | Static file, no locale |

## Middleware Behavior

### Request Flow

```
Incoming Request
  │
  ├─ Is static file or API route? → Pass through (no locale logic)
  │
  ├─ URL starts with /ar? → locale = "ar", continue to Clerk
  │
  ├─ URL starts with /en? → Redirect to same path without /en (canonical URL)
  │
  └─ No locale prefix:
      ├─ Has NEXT_LOCALE cookie? → Use cookie value
      ├─ Accept-Language contains ar-*? → locale = "ar", REDIRECT to /ar/...
      └─ Otherwise → locale = "en", REWRITE to /en/... (URL unchanged)
```

### Redirect vs Rewrite

| Scenario | Action | HTTP Code | URL Changes? |
|----------|--------|-----------|-------------|
| English user, no prefix | **Rewrite** to `/en/...` | — | No (URL stays `/market`) |
| Arabic browser, no prefix, no cookie | **Redirect** to `/ar/...` | 307 | Yes (URL becomes `/ar/market`) |
| Arabic prefix already present | **Pass through** | — | No |
| `/en/...` explicit | **Redirect** to `/...` | 308 | Yes (remove `/en` prefix) |
| Unsupported prefix (e.g., `/fr/...`) | **Pass through** (404 from Next.js) | — | No |

### Cookie Management

| Cookie | Set By | Read By | Max-Age |
|--------|--------|---------|---------|
| `NEXT_LOCALE` | Language toggle (client JS) | Middleware (server) | 365 days |

## HTML Attributes per Locale

| Locale | `<html lang>` | `<html dir>` | Font |
|--------|--------------|-------------|------|
| `en` | `en` | `ltr` | Cairo (same font, supports Latin) |
| `ar` | `ar` | `rtl` | Cairo (Arabic-optimized) |

## Link Generation

All internal `<Link>` components must be locale-aware:

```
Current locale: en → href="/market"
Current locale: ar → href="/ar/market"
```

A helper function or custom `Link` component wraps Next.js `<Link>` to prepend `/ar` when the active locale is Arabic.
