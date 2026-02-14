# Data Model: 007-market-search-seed

## Existing Entities (No Schema Changes)

### Prompt (table: `prompts`)

The existing schema supports all fields needed for this feature. No migration required.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key, auto-generated |
| title | text | Arabic title (search target) |
| titleEn | text | English title (search target) |
| description | text | Arabic description (search target) |
| descriptionEn | text | English description (search target) |
| price | real | Display currency, not cents ($1.99-$29.99 for seed) |
| category | text | References categories.slug |
| aiModel | text | "chatgpt", "claude", "midjourney", etc. |
| generationType | text | "text", "image", "code", "marketing", "design" |
| rating | real | 0-5 (3.0-5.0 for seed data) |
| reviewsCount | integer | Maps to `reviews` in API response |
| sales | integer | Used for "popular" and "trending" sort |
| thumbnail | text | URL (picsum.photos for seed) |
| tags | text[] | Array of tags (search target) |
| difficulty | text | "مبتدئ" or "متقدم" |
| sellerName | text | Flat embedded seller info |
| sellerAvatar | text | Flat embedded seller info |
| sellerRating | real | Flat embedded seller info |
| sellerId | text | Nullable (null for seed data) |
| status | text | "approved" for all seed data |
| samples | text[] | Example output snippets |
| fullContent | text | Full prompt template |
| instructions | text | Usage instructions |
| exampleOutputs | text[] | 4 example outputs |
| examplePrompts | jsonb | 4 sets of variable values |
| createdAt | timestamp | Varied for seed (spread over 30 days) |
| updatedAt | timestamp | Same as createdAt for seed |

### Category (table: `categories`)

Existing categories remain unchanged. Seed prompts reference existing category slugs.

### Seller Persona (NOT a DB entity)

Used only in the seed script. Each persona is a plain object:

| Field | Value Pattern |
|-------|--------------|
| name | Arabic name (e.g., "أحمد الخالدي") |
| avatar | `https://ui-avatars.com/api/?name=...&background=random` |
| rating | 3.5 - 5.0 |

10 personas, each assigned ~10 prompts.

## Search Query Model (runtime, not persisted)

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| search | string | "" | Free text, min 2 chars for suggestions |
| generationType | string | "all" | "all", "text", "image", "code", "marketing", "design" |
| aiModel | string | "all" | "all", "chatgpt", "claude", "midjourney", etc. |
| sortBy | string | "trending" | "trending", "popular", "newest", "price-low", "price-high", "relevant" |
| offset | number | 0 | For pagination, increments of 20 |
| limit | number | 20 | Results per page |

## Indexes

No new indexes needed for 100 prompts. Existing indexes on `status`, `seller_id` are sufficient. If performance becomes an issue at scale, add:
- GIN index on `tags` array
- GIN trigram index on `title` for fuzzy matching
