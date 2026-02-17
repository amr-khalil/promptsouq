# API Contract: Trending Searches

## `GET /api/trending`

Returns the top-selling prompt titles for use as trending search suggestions.

### Request

No parameters required.

### Response

**Success (200)**:
```json
{
  "data": [
    { "title": "برومبت تصميم شعار احترافي", "titleEn": "Professional Logo Design Prompt" },
    { "title": "برومبت كتابة مقال SEO", "titleEn": "SEO Article Writing Prompt" },
    { "title": "برومبت إنشاء صور واقعية", "titleEn": "Realistic Image Generation Prompt" },
    { "title": "برومبت تحليل بيانات", "titleEn": "Data Analysis Prompt" },
    { "title": "برومبت ترجمة احترافية", "titleEn": "Professional Translation Prompt" }
  ]
}
```

### Validation Schema

```typescript
// Response shape (no request params to validate)
const trendingResponseSchema = z.object({
  data: z.array(
    z.object({
      title: z.string(),
      titleEn: z.string(),
    })
  ),
});
```

### Database Query

```sql
SELECT title, title_en
FROM prompts
WHERE status = 'approved'
ORDER BY sales DESC
LIMIT 5
```

### Error Responses

| Status | Code           | Description            |
|--------|---------------|------------------------|
| 500    | INTERNAL_ERROR | Database query failure |

### Notes

- No authentication required (public endpoint)
- Lightweight query — returns only 2 columns, 5 rows max
- Response is suitable for short-term client caching (trending changes slowly)
