# API Contract: Suggestions Endpoint

## GET /api/suggestions

Returns autocomplete suggestions for the search input.

### Request

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| q | string | yes | — | Search query, min 2 characters |
| limit | number | no | 6 | Max suggestions to return (1-10) |

### Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-string",
      "title": "تصميم شعار احترافي",
      "aiModel": "midjourney"
    }
  ]
}
```

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

- Matches against `title`, `titleEn`, and `tags` (via array_to_string)
- Only returns prompts with `status = 'approved'`
- Results ordered by relevance: title match first, then tag match
- Returns minimal fields (id, title, aiModel) for fast response
- No authentication required (public endpoint)

### Zod Schema

```typescript
export const suggestionsQuerySchema = z.object({
  q: z.string().min(2, "يجب إدخال حرفين على الأقل").max(100),
  limit: z.coerce.number().int().min(1).max(10).optional().default(6),
});
```
