# API Route Contracts: API Layer with Mock Data

**Feature**: 001-api-mock-data | **Date**: 2026-02-11

## Common Response Envelope

### Success Response

```json
{
  "data": <T>
}
```

### Error Response

```json
{
  "error": {
    "code": "NOT_FOUND | VALIDATION_ERROR | INTERNAL_ERROR",
    "message": "Arabic user-facing message",
    "details": {}
  }
}
```

- `code`: Machine-readable error classification
- `message`: Arabic text suitable for display to users
- `details`: Optional. For `VALIDATION_ERROR`, contains Zod `.flatten()` output with field-level errors

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful response |
| 400 | Validation error (invalid query params) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Endpoint 1: List Prompts

**FR**: FR-001 | **Priority**: P1 (US1)

```
GET /api/prompts
```

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| category | string | no | — | Comma-separated category IDs (e.g., `marketing,design`) |
| aiModel | string | no | — | Comma-separated AI model names (e.g., `ChatGPT,Midjourney`) |
| priceMin | number | no | — | Minimum price (inclusive) |
| priceMax | number | no | — | Maximum price (inclusive) |
| sortBy | enum | no | `bestselling` | One of: `bestselling`, `newest`, `rating`, `price-low`, `price-high` |
| limit | integer | no | — | Maximum number of results to return |

### Zod Schema

```typescript
const promptsQuerySchema = z.object({
  category: z.string().optional(),
  aiModel: z.string().optional(),
  priceMin: z.coerce.number().min(0, { message: "الحد الأدنى للسعر يجب أن يكون 0 أو أكثر" }).optional(),
  priceMax: z.coerce.number().min(0, { message: "الحد الأقصى للسعر يجب أن يكون 0 أو أكثر" }).optional(),
  sortBy: z.enum(["bestselling", "newest", "rating", "price-low", "price-high"]).optional().default("bestselling"),
  limit: z.coerce.number().int().positive({ message: "الحد يجب أن يكون رقم صحيح موجب" }).optional(),
});
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": "1",
      "title": "برومبت كتابة محتوى تسويقي احترافي",
      "titleEn": "Professional Marketing Content Writer",
      "description": "...",
      "descriptionEn": "...",
      "price": 29.99,
      "category": "marketing",
      "aiModel": "ChatGPT",
      "rating": 4.8,
      "reviews": 124,
      "sales": 567,
      "thumbnail": "https://images.unsplash.com/...",
      "seller": {
        "name": "أحمد محمود",
        "avatar": "https://images.unsplash.com/...",
        "rating": 4.9
      },
      "tags": ["تسويق", "محتوى", "إعلانات", "SEO"],
      "difficulty": "متقدم",
      "samples": ["مثال على محتوى تسويقي..."],
      "fullContent": null
    }
  ]
}
```

### Sorting Logic

| sortBy | Implementation |
|--------|---------------|
| `bestselling` | Sort by `sales` descending |
| `newest` | Preserve original array order |
| `rating` | Sort by `rating` descending |
| `price-low` | Sort by `price` ascending |
| `price-high` | Sort by `price` descending |

### Filtering Logic

1. If `category` provided: split on commas, keep prompts where `prompt.category` is in the list
2. If `aiModel` provided: split on commas, keep prompts where `prompt.aiModel` is in the list
3. If `priceMin` provided: keep prompts where `prompt.price >= priceMin`
4. If `priceMax` provided: keep prompts where `prompt.price <= priceMax`
5. Apply sorting
6. If `limit` provided: return first N results

### Error Response (400)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "معطيات البحث غير صالحة",
    "details": {
      "fieldErrors": {
        "priceMin": ["الحد الأدنى للسعر يجب أن يكون 0 أو أكثر"]
      }
    }
  }
}
```

---

## Endpoint 2: Get Prompt by ID

**FR**: FR-002 | **Priority**: P2 (US2)

```
GET /api/prompts/[id]
```

### Path Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Prompt unique identifier |

### Success Response (200)

```json
{
  "data": {
    "id": "1",
    "title": "...",
    "titleEn": "...",
    "description": "...",
    "descriptionEn": "...",
    "price": 29.99,
    "category": "marketing",
    "aiModel": "ChatGPT",
    "rating": 4.8,
    "reviews": 124,
    "sales": 567,
    "thumbnail": "...",
    "seller": { "name": "...", "avatar": "...", "rating": 4.9 },
    "tags": ["..."],
    "difficulty": "متقدم",
    "samples": ["..."],
    "fullContent": "..."
  }
}
```

### Error Response (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "البرومبت غير موجود"
  }
}
```

---

## Endpoint 3: Get Prompt Reviews

**FR**: FR-003 | **Priority**: P2 (US2)

```
GET /api/prompts/[id]/reviews
```

### Path Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Prompt unique identifier (must exist) |

### Success Response (200)

```json
{
  "data": [
    {
      "id": "1",
      "userName": "عبدالله محمد",
      "userAvatar": "https://images.unsplash.com/...",
      "rating": 5,
      "date": "2026-02-05",
      "comment": "برومبت رائع جداً!..."
    }
  ]
}
```

**Note**: In mock phase, all 3 reviews are returned for any valid prompt ID. Future database implementation will filter by prompt foreign key.

### Error Response (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "البرومبت غير موجود"
  }
}
```

---

## Endpoint 4: Get Related Prompts

**FR**: FR-006 | **Priority**: P2 (US2)

```
GET /api/prompts/[id]/related
```

### Path Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Current prompt ID (excluded from results) |

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| limit | integer | no | 3 | Maximum related prompts to return |

### Zod Schema

```typescript
const relatedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(3),
});
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": "4",
      "title": "...",
      "price": 34.99,
      "category": "design",
      "aiModel": "DALL·E",
      "rating": 4.6,
      "reviews": 98,
      "sales": 345,
      "thumbnail": "...",
      "seller": { "name": "...", "avatar": "...", "rating": 4.7 },
      "tags": ["..."],
      "difficulty": "مبتدئ",
      "samples": []
    }
  ]
}
```

### Logic

1. Find prompt by `id`. If not found, return 404.
2. Filter prompts where `prompt.category === currentPrompt.category` AND `prompt.id !== id`.
3. Return first `limit` results (default 3).

### Error Response (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "البرومبت غير موجود"
  }
}
```

---

## Endpoint 5: Search Prompts

**FR**: FR-005 | **Priority**: P3 (US3)

```
GET /api/prompts/search
```

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| q | string | yes | — | Search query (min 1 character) |

### Zod Schema

```typescript
const searchQuerySchema = z.object({
  q: z.string().min(1, { message: "يرجى إدخال كلمة بحث" }),
});
```

### Success Response (200)

```json
{
  "data": [
    { /* Full Prompt object */ }
  ]
}
```

### Search Logic

Case-insensitive substring matching. A prompt matches if the query appears in ANY of:
- `prompt.title` (Arabic)
- `prompt.titleEn` (English)
- `prompt.description` (Arabic)
- Any element in `prompt.tags[]`

### Error Response (400)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "يرجى إدخال كلمة بحث",
    "details": {
      "fieldErrors": {
        "q": ["يرجى إدخال كلمة بحث"]
      }
    }
  }
}
```

---

## Endpoint 6: List Categories

**FR**: FR-004 | **Priority**: P1 (US1)

```
GET /api/categories
```

### Query Parameters

None.

### Success Response (200)

```json
{
  "data": [
    {
      "id": "gpt",
      "name": "ChatGPT",
      "nameEn": "ChatGPT",
      "icon": "MessageSquare",
      "count": 234
    }
  ]
}
```

---

## Endpoint 7: List Testimonials

**FR**: FR-007 | **Priority**: P1 (US1)

```
GET /api/testimonials
```

### Query Parameters

None.

### Success Response (200)

```json
{
  "data": [
    {
      "id": "1",
      "name": "محمد السعيد",
      "role": "مسوق رقمي",
      "content": "وجدت البرومبتات التي أحتاجها...",
      "avatar": "https://images.unsplash.com/...",
      "rating": 5
    }
  ]
}
```

---

## Page-to-Endpoint Mapping

| Page | Endpoints Called | Notes |
|------|----------------|-------|
| Home (`/`) | `GET /api/prompts?sortBy=bestselling&limit=6`, `GET /api/categories`, `GET /api/testimonials` | Trending = first 6 by sales |
| Market (`/market`) | `GET /api/prompts?category=X&aiModel=Y&priceMin=Z&priceMax=W&sortBy=S`, `GET /api/categories` | Full filter/sort |
| Prompt Detail (`/prompt/[id]`) | `GET /api/prompts/[id]`, `GET /api/prompts/[id]/reviews`, `GET /api/prompts/[id]/related` | Three parallel fetches |
| Search (`/search`) | `GET /api/prompts/search?q=X` | Triggered when `q` param present |
| Cart (`/cart`) | `GET /api/prompts?limit=3` | Mock: first 3 prompts as cart items |
| Checkout (`/checkout`) | `GET /api/prompts?limit=3` | Mock: same cart items |
| Profile (`/profile`) | `GET /api/prompts` | Mock: slices for purchases (0-4) and saved (4-7) |
| Seller (`/seller`) | `GET /api/prompts?limit=3`, `GET /api/categories` | Mock: first 3 as seller listings |
