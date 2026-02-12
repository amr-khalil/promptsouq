# API Contract: Favorites

## GET /api/favorites

List all favorited prompts for the authenticated user.

**Authentication**: Required (Clerk)

### Response

**200 OK**

```json
{
  "data": [
    {
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
      "favoritedAt": "2026-02-12T10:00:00Z"
    }
  ]
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |

---

## POST /api/favorites

Add a prompt to the user's favorites.

**Authentication**: Required (Clerk)

### Request Body

```json
{
  "promptId": "uuid-string"
}
```

### Zod Schema

```typescript
export const favoriteRequestSchema = z.object({
  promptId: z.string().uuid("معرّف غير صالح"),
});
```

### Response

**201 Created**

```json
{
  "data": {
    "promptId": "uuid",
    "favoritedAt": "2026-02-12T10:00:00Z"
  }
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": { "code": "VALIDATION_ERROR", ... } }` | Invalid promptId |
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 404 | `{ "error": { "code": "NOT_FOUND", ... } }` | Prompt doesn't exist |
| 409 | `{ "error": { "code": "CONFLICT", "message": "البرومبت موجود في المفضلة مسبقاً" } }` | Already favorited |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |

---

## DELETE /api/favorites/[promptId]

Remove a prompt from the user's favorites.

**Authentication**: Required (Clerk)

### URL Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| promptId | UUID string | yes | The prompt to unfavorite |

### Response

**200 OK**

```json
{
  "success": true
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": { "code": "VALIDATION_ERROR", ... } }` | Invalid UUID |
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 404 | `{ "error": { "code": "NOT_FOUND", "message": "البرومبت غير موجود في المفضلة" } }` | Not in favorites |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |

---

## GET /api/favorites/check

Check if the authenticated user has favorited specific prompts. Used for rendering heart icons on prompt cards without fetching the full favorites list.

**Authentication**: Required (Clerk)

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| promptIds | comma-separated UUID strings | yes | Up to 50 prompt IDs to check |

### Response

**200 OK**

```json
{
  "data": {
    "uuid-1": true,
    "uuid-2": false,
    "uuid-3": true
  }
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": { "code": "VALIDATION_ERROR", ... } }` | Invalid or missing promptIds |
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |
