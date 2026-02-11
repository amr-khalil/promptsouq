# Quickstart: API Layer with Mock Data

**Feature**: 001-api-mock-data | **Date**: 2026-02-11

## Prerequisites

- Node.js 18+ installed
- npm installed
- Repository cloned and on branch `001-api-mock-data`
- `.env.local` with Clerk keys configured

## Setup

```bash
# Install dependencies
npm install

# Verify clean build before starting
npm run lint && npm run build
```

## Running the Application

```bash
npm run dev
```

Application runs at `http://localhost:3000`.

## Verifying the Feature

### 1. API Endpoints (direct)

Open a browser or use curl to test each endpoint:

```bash
# List all prompts (default: sorted by bestselling)
curl http://localhost:3000/api/prompts

# Filter by category
curl "http://localhost:3000/api/prompts?category=marketing"

# Filter by AI model + sort by rating
curl "http://localhost:3000/api/prompts?aiModel=ChatGPT&sortBy=rating"

# Filter by price range
curl "http://localhost:3000/api/prompts?priceMin=25&priceMax=40"

# Limit results
curl "http://localhost:3000/api/prompts?sortBy=bestselling&limit=6"

# Get single prompt
curl http://localhost:3000/api/prompts/1

# Get prompt reviews
curl http://localhost:3000/api/prompts/1/reviews

# Get related prompts
curl http://localhost:3000/api/prompts/1/related

# Search prompts
curl "http://localhost:3000/api/prompts/search?q=تسويق"

# List categories
curl http://localhost:3000/api/categories

# List testimonials
curl http://localhost:3000/api/testimonials
```

### 2. Error Cases

```bash
# Invalid prompt ID → 404
curl http://localhost:3000/api/prompts/999

# Invalid price param → 400 validation error
curl "http://localhost:3000/api/prompts?priceMin=abc"

# Empty search → 400 validation error
curl "http://localhost:3000/api/prompts/search?q="

# Missing search query → 400 validation error
curl http://localhost:3000/api/prompts/search
```

### 3. Page Verification

Visit each page and confirm it renders identically to before:

| Page | URL | What to Check |
|------|-----|---------------|
| Home | `http://localhost:3000/` | Categories grid, 6 trending prompts, testimonials |
| Market | `http://localhost:3000/market` | All prompts listed, filters work, sorting works |
| Prompt Detail | `http://localhost:3000/prompt/1` | Full prompt info, reviews, 3 related prompts |
| Search | `http://localhost:3000/search?q=تسويق` | Matching prompts appear |
| Cart | `http://localhost:3000/cart` | 3 cart items with pricing |
| Checkout | `http://localhost:3000/checkout` | Order summary with totals |
| Profile | `http://localhost:3000/profile` | Purchases and saved prompts |
| Seller | `http://localhost:3000/seller` | Product listings, category dropdown |

### 4. Error Pages

| Page | URL | What to Check |
|------|-----|---------------|
| 404 | `http://localhost:3000/nonexistent` | Arabic not-found message |
| Invalid Prompt | `http://localhost:3000/prompt/999` | Arabic not-found message |

### 5. Loading States

- Throttle network in browser DevTools (Slow 3G)
- Navigate between pages
- Verify skeleton/spinner appears during loading (no blank screens)

## Success Criteria Checklist

- [ ] SC-001: No page imports from `src/data/mockData.ts` (verify with `grep -r "from.*mockData" src/app/ src/components/`)
- [ ] SC-002: All 8 pages render identically to before migration
- [ ] SC-003: Marketplace filter/sort results appear in under 1 second
- [ ] SC-004: Search results appear instantly
- [ ] SC-005: Invalid prompt IDs show Arabic 404 page
- [ ] SC-006: `npm run lint && npm run build` passes with zero errors

## Build Verification

After all changes:

```bash
# Must pass with zero errors
npm run lint
npm run build

# Verify no remaining mock data imports in pages
grep -r "from.*mockData" src/app/ src/components/
# Expected: no matches (or only type imports in PromptCard if kept temporarily)
```
