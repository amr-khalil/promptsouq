# API Contract: Purchases

## GET /api/user/purchases

List all prompts the authenticated user has purchased, with full prompt details and purchase metadata.

**Authentication**: Required (Clerk)

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| promptId | UUID string | no | If provided, returns `{ purchased: boolean }` (existing behavior) |

### Response (list mode — no promptId param)

**200 OK**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "titleEn": "string",
      "thumbnail": "string",
      "aiModel": "string",
      "price": 24.99,
      "category": "string",
      "seller": {
        "name": "string",
        "avatar": "string"
      },
      "purchasedAt": "2026-02-12T10:00:00Z",
      "priceAtPurchase": 2499
    }
  ]
}
```

### Response (check mode — with promptId)

**200 OK** (existing, unchanged)

```json
{
  "purchased": true
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |

---

## GET /api/purchase/[id]

Get full purchased prompt content. Only accessible to the buyer.

**Authentication**: Required (Clerk)
**Authorization**: User must own the prompt (verified via order_items)

### URL Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID string | yes | Prompt ID |

### Response

**200 OK**

```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "titleEn": "string",
    "description": "string",
    "descriptionEn": "string",
    "price": 24.99,
    "category": "string",
    "aiModel": "string",
    "rating": 4.7,
    "reviews": 12,
    "sales": 350,
    "thumbnail": "string",
    "seller": {
      "name": "string",
      "avatar": "string",
      "rating": 4.8
    },
    "tags": ["string"],
    "difficulty": "مبتدئ",
    "samples": ["string"],
    "fullContent": "string",
    "instructions": "string | null",
    "purchasedAt": "2026-02-12T10:00:00Z"
  }
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": { "code": "VALIDATION_ERROR", ... } }` | Invalid UUID |
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 403 | `{ "error": { "code": "FORBIDDEN", "message": "لم تقم بشراء هذا البرومبت" } }` | User doesn't own this prompt |
| 404 | `{ "error": { "code": "NOT_FOUND", ... } }` | Prompt doesn't exist |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |
