# Contract: GET /api/free-access

**Method**: GET
**Path**: `/api/free-access`
**Auth**: Required (authenticated users only)

## Purpose

Returns the list of free prompts the authenticated user has accessed, for the "My Free Prompts" dashboard section (FR-018). Ordered by most recently accessed.

## Request

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Clerk session token |

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | `number` | No | `20` | Max items to return |
| `offset` | `number` | No | `0` | Pagination offset |

## Response

### 200 OK

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "عنوان البرومبت",
      "titleEn": "Prompt Title",
      "thumbnail": "https://...",
      "aiModel": "ChatGPT",
      "category": "text-generation",
      "seller": {
        "name": "اسم البائع",
        "avatar": "https://...",
        "rating": 4.5
      },
      "accessedAt": "2026-02-15T10:30:00.000Z"
    }
  ],
  "total": 5
}
```

**Item fields**: Matches the purchase list item shape with `accessedAt` replacing `purchasedAt` and no `price`/`priceAtPurchase` fields.

### 401 Unauthorized

```json
{
  "error": { "code": "FORBIDDEN", "message": "يجب تسجيل الدخول أولاً" }
}
```

## Logic

```
1. Check auth → 401 if not authenticated
2. Query free_prompt_access joined with prompts
   WHERE user_id = currentUserId
   ORDER BY accessed_at DESC
   LIMIT/OFFSET
3. Count total for pagination
4. Map rows to response shape
5. Return { data, total }
```
