# Data Model: API Layer with Mock Data

**Feature**: 001-api-mock-data | **Date**: 2026-02-11

## Entities

### Prompt

The core marketplace product. Contains bilingual content, pricing, and seller information.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Unique identifier ("1", "2", ...) |
| title | string | yes | Arabic title |
| titleEn | string | yes | English title |
| description | string | yes | Arabic description |
| descriptionEn | string | yes | English description |
| price | number | yes | USD decimal (e.g., 29.99). Range: 0–100 in current data |
| category | string | yes | Category ID reference (e.g., "marketing", "gpt") |
| aiModel | string | yes | AI model name: "ChatGPT", "Midjourney", "DALL·E" |
| rating | number | yes | Decimal 0–5 (e.g., 4.8) |
| reviews | number | yes | Review count |
| sales | number | yes | Sales count |
| thumbnail | string | yes | Image URL (Unsplash) |
| seller | Seller (object) | yes | Nested seller object |
| tags | string[] | yes | Array of Arabic/mixed tag strings |
| difficulty | "مبتدئ" \| "متقدم" | yes | Beginner or Advanced |
| samples | string[] | yes | Array of sample strings (may be empty) |
| fullContent | string | no | Optional full prompt content |

#### Seller (nested object)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | Arabic seller name |
| avatar | string | yes | Avatar URL |
| rating | number | yes | Seller rating 0–5 |

### Category

Classification grouping for prompts.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Unique ID: "gpt", "midjourney", "dalle", "business", "education", "marketing", "writing", "design" |
| name | string | yes | Arabic name |
| nameEn | string | yes | English name |
| icon | string | yes | Lucide React icon name (e.g., "MessageSquare", "Image") |
| count | number | yes | Number of prompts in category |

### Review

User feedback on a specific prompt.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Unique identifier |
| userName | string | yes | Arabic reviewer name |
| userAvatar | string | yes | Avatar URL |
| rating | number | yes | Integer 1–5 |
| date | string | yes | ISO date format "YYYY-MM-DD" |
| comment | string | yes | Arabic review text |

### Testimonial

Site-wide user endorsement displayed on the homepage.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Unique identifier |
| name | string | yes | Arabic name |
| role | string | yes | Arabic role/title |
| content | string | yes | Arabic testimonial text |
| avatar | string | yes | Avatar URL |
| rating | number | yes | Integer 1–5 |

## Relationships

```text
Category 1──────∞ Prompt        (prompt.category → category.id)
Prompt   1──────∞ Review        (reviews associated by prompt ID)
Prompt   ∞──────∞ Prompt        (related: same category, excluding self)
```

**Note**: In the current mock data phase, reviews are not explicitly linked to prompts by ID. The `reviews` array is returned for any valid prompt. This will change when a database is introduced.

## Data Volumes (Mock Phase)

| Entity | Count |
|--------|-------|
| Prompt | 8 |
| Category | 8 |
| Review | 3 |
| Testimonial | 3 |

## Validation Rules (Zod)

### Query Parameter Schemas

**Prompts List** (`GET /api/prompts`):
- `category`: optional string, comma-separated category IDs
- `aiModel`: optional string, comma-separated model names
- `priceMin`: optional number, coerced from string, min 0
- `priceMax`: optional number, coerced from string, min 0
- `sortBy`: optional enum `"bestselling" | "newest" | "rating" | "price-low" | "price-high"`, default `"bestselling"`
- `limit`: optional integer, positive, coerced from string

**Prompts Search** (`GET /api/prompts/search`):
- `q`: required string, min length 1

**Prompt by ID** (`GET /api/prompts/[id]`):
- `id`: required string (path parameter)

**Prompt Reviews** (`GET /api/prompts/[id]/reviews`):
- `id`: required string (path parameter)

**Prompt Related** (`GET /api/prompts/[id]/related`):
- `id`: required string (path parameter)
- `limit`: optional integer, default 3

**Categories** (`GET /api/categories`):
- No parameters

**Testimonials** (`GET /api/testimonials`):
- No parameters

## State Transitions

None for this phase. All data is read-only from mock arrays.
