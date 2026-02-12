# API Contract: Reviews

## POST /api/prompts/[id]/reviews

Submit a new review for a purchased prompt.

**Authentication**: Required (Clerk)
**Authorization**: User must own the prompt AND must not have an existing review for it.

### URL Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID string | yes | Prompt ID |

### Request Body

```json
{
  "rating": 4,
  "comment": "string (optional, max 1000 chars)"
}
```

### Zod Schema

```typescript
export const reviewSubmitSchema = z.object({
  rating: z.number().int().min(1, "يجب اختيار تقييم").max(5),
  comment: z.string().max(1000, "التعليق طويل جداً").optional().default(""),
});
```

### Response

**201 Created**

```json
{
  "data": {
    "id": "string",
    "promptId": "uuid",
    "userId": "string",
    "userName": "string",
    "userAvatar": "string",
    "rating": 4,
    "date": "2026-02-12",
    "comment": "string"
  }
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": { "code": "VALIDATION_ERROR", ... } }` | Invalid rating or comment |
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 403 | `{ "error": { "code": "FORBIDDEN", "message": "يجب شراء البرومبت أولاً" } }` | User hasn't purchased the prompt |
| 404 | `{ "error": { "code": "NOT_FOUND", ... } }` | Prompt doesn't exist |
| 409 | `{ "error": { "code": "CONFLICT", "message": "لقد قمت بتقييم هذا البرومبت مسبقاً" } }` | Review already exists |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |

---

## PUT /api/prompts/[id]/reviews

Update the authenticated user's existing review for a prompt.

**Authentication**: Required (Clerk)
**Authorization**: User must have an existing review for this prompt.

### URL Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID string | yes | Prompt ID |

### Request Body

```json
{
  "rating": 5,
  "comment": "updated comment"
}
```

Uses the same `reviewSubmitSchema` as POST.

### Response

**200 OK**

```json
{
  "data": {
    "id": "string",
    "promptId": "uuid",
    "userId": "string",
    "userName": "string",
    "userAvatar": "string",
    "rating": 5,
    "date": "2026-02-12",
    "comment": "updated comment"
  }
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": { "code": "VALIDATION_ERROR", ... } }` | Invalid rating or comment |
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 404 | `{ "error": { "code": "NOT_FOUND", "message": "لم يتم العثور على تقييمك" } }` | No existing review to update |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |

### Side Effect

Both POST and PUT trigger an aggregate recalculation:
1. Query all reviews for the prompt: `SELECT AVG(rating), COUNT(*) FROM reviews WHERE prompt_id = ?`
2. Update the prompt row: `UPDATE prompts SET rating = avg, reviews_count = count WHERE id = ?`

This runs in the same request (not a background job) for consistency.

---

## GET /api/user/reviews

Get the authenticated user's review for a specific prompt.

**Authentication**: Required (Clerk)

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| promptId | UUID string | yes | The prompt to check |

### Response

**200 OK** (review exists)

```json
{
  "data": {
    "id": "string",
    "promptId": "uuid",
    "userId": "string",
    "userName": "string",
    "userAvatar": "string",
    "rating": 4,
    "date": "2026-02-12",
    "comment": "string"
  }
}
```

**200 OK** (no review)

```json
{
  "data": null
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": { "code": "VALIDATION_ERROR", ... } }` | Missing or invalid promptId |
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | Not authenticated |
| 500 | `{ "error": { "code": "INTERNAL_ERROR", ... } }` | Server error |
