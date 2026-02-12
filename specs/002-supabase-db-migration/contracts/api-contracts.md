# API Contracts: Supabase Database Migration

**Feature**: 002-supabase-db-migration
**Date**: 2026-02-12

All endpoints return JSON. Success responses wrap data in `{ data: ... }`. Error responses use `{ error: { code, message, details? } }`.

These contracts are **unchanged from the current mock data implementation**. The migration replaces the data source, not the API shape.

---

## GET /api/categories

Returns all categories.

**Request**: No parameters.

**Response 200**:
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

**Notes**: `id` in the response maps to `categories.slug` in the database (not the serial PK).

---

## GET /api/prompts

Returns filtered, sorted prompts.

**Query Parameters**:

| Param    | Type   | Required | Default       | Description                          |
|----------|--------|----------|---------------|--------------------------------------|
| category | string | No       | —             | Comma-separated category slugs       |
| aiModel  | string | No       | —             | Comma-separated AI model names       |
| priceMin | number | No       | —             | Minimum price (>= 0)                |
| priceMax | number | No       | —             | Maximum price (>= 0)                |
| sortBy   | string | No       | "bestselling" | One of: bestselling, newest, rating, price-low, price-high |
| limit    | number | No       | —             | Max results (positive integer)       |

**Response 200**:
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
      "thumbnail": "https://...",
      "seller": {
        "name": "أحمد محمود",
        "avatar": "https://...",
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

**Response 400** (invalid params):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "معطيات البحث غير صالحة",
    "details": { "fieldErrors": {}, "formErrors": [] }
  }
}
```

---

## GET /api/prompts/[id]

Returns a single prompt by ID.

**Path Parameters**: `id` — prompt ID (string, e.g., "1")

**Response 200**:
```json
{
  "data": { /* same shape as prompt object above */ }
}
```

**Response 404**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "البرومبت غير موجود"
  }
}
```

---

## GET /api/prompts/[id]/reviews

Returns reviews for a specific prompt.

**Path Parameters**: `id` — prompt ID

**Response 200**:
```json
{
  "data": [
    {
      "id": "1",
      "userName": "عبدالله محمد",
      "userAvatar": "https://...",
      "rating": 5,
      "date": "2026-02-05",
      "comment": "برومبت رائع جداً! ساعدني في تحسين محتوى التسويق بشكل كبير."
    }
  ]
}
```

**Response 404** (prompt not found):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "البرومبت غير موجود"
  }
}
```

**Change from mock**: Now returns only reviews linked to the specified prompt (via `prompt_id` FK), not all reviews.

---

## GET /api/prompts/[id]/related

Returns prompts in the same category, excluding the current prompt.

**Path Parameters**: `id` — prompt ID

**Query Parameters**:

| Param | Type   | Required | Default | Description              |
|-------|--------|----------|---------|--------------------------|
| limit | number | No       | 3       | Max related prompts      |

**Response 200**:
```json
{
  "data": [ /* array of prompt objects */ ]
}
```

**Response 404** (prompt not found):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "البرومبت غير موجود"
  }
}
```

---

## GET /api/prompts/search

Searches prompts by text query.

**Query Parameters**:

| Param | Type   | Required | Default | Description              |
|-------|--------|----------|---------|--------------------------|
| q     | string | Yes      | —       | Search query (min 1 char)|

**Response 200**:
```json
{
  "data": [ /* array of matching prompt objects */ ]
}
```

**Response 400** (missing query):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "يرجى إدخال كلمة بحث",
    "details": { "fieldErrors": {}, "formErrors": [] }
  }
}
```

**Search fields**: title, titleEn, description, descriptionEn, tags (case-insensitive substring match via `ILIKE`).

---

## GET /api/testimonials

Returns all testimonials.

**Request**: No parameters.

**Response 200**:
```json
{
  "data": [
    {
      "id": "1",
      "name": "محمد السعيد",
      "role": "مسوق رقمي",
      "content": "وجدت البرومبتات التي أحتاجها لتطوير عملي...",
      "avatar": "https://...",
      "rating": 5
    }
  ]
}
```

---

## Error Response Format (all endpoints)

**500 Internal Error**:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "حدث خطأ داخلي في الخادم"
  }
}
```

This covers database connection failures and unexpected errors.
