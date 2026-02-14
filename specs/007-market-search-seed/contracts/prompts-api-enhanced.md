# API Contract: Enhanced Prompts Endpoint

## GET /api/prompts (Enhanced)

Returns paginated, filterable, sortable marketplace prompts.

### Request (Query Parameters)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search | string | no | — | Free-text search across title, description, tags |
| category | string | no | — | Comma-separated category slugs |
| aiModel | string | no | — | Comma-separated AI model values |
| generationType | string | no | — | Single generation type: "text", "image", "code", "marketing", "design" |
| priceMin | number | no | — | Minimum price filter |
| priceMax | number | no | — | Maximum price filter |
| sortBy | string | no | "trending" | Sort order (see below) |
| limit | number | no | 20 | Results per page (1-100) |
| offset | number | no | 0 | Pagination offset |

### Sort Options

| Value | Description |
|-------|-------------|
| trending | Weighted combination: `sales * 2 + (recency_score)` — newer prompts with sales rank higher |
| popular | By `sales` descending |
| newest | By `createdAt` descending |
| price-low | By `price` ascending |
| price-high | By `price` descending |
| relevant | By search relevance (title match > description match > tag match). Only meaningful when `search` is provided; falls back to `trending` if no search query. |
| rating | By `rating` descending |
| bestselling | Alias for `popular` (backward compat) |

### Response (200 OK)

```json
{
  "data": [ /* array of prompt objects via mapPromptRow */ ],
  "total": 87
}
```

The `total` field is the count of ALL matching prompts (ignoring limit/offset), used by the client to determine if "Load more" should be shown.

### Response (400 Bad Request)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "معطيات البحث غير صالحة",
    "details": { ... }
  }
}
```

### Behavior

- Always filters `status = 'approved'`
- `search` uses `ILIKE '%query%'` across title, titleEn, description, descriptionEn, and array_to_string(tags, ' ')
- `generationType` is a single-value filter (not comma-separated)
- `category` and `aiModel` support comma-separated multi-values
- When `search` is provided and `sortBy` is not explicitly set, default to `relevant`
- The `total` count query runs separately (SELECT COUNT) for pagination metadata

### Updated Zod Schema

```typescript
export const promptsQuerySchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().optional(),
  aiModel: z.string().optional(),
  generationType: z.enum(["text", "image", "code", "marketing", "design"]).optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  sortBy: z.enum([
    "trending", "popular", "newest", "price-low", "price-high",
    "relevant", "rating", "bestselling"
  ]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
```
