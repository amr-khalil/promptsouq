# Contract: GET /api/prompts/[id] (Modified)

**Method**: GET
**Path**: `/api/prompts/{id}`
**Auth**: Optional (behavior changes based on auth state)

## Changes from Current Behavior

Currently returns ALL fields including `fullContent` and `samples` regardless of auth. Modified to conditionally strip content fields for free prompts when user is unauthenticated.

## Request

**Path Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | Yes | Prompt ID |

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | No | Clerk session token (auto-injected by `fetch` from client) |

## Response

### 200 OK — Authenticated User OR Paid Prompt

Returns full prompt object (unchanged from current behavior):

```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "price": 0,
    "fullContent": "...",
    "samples": ["...", "..."],
    "exampleOutputs": ["...", "..."],
    "examplePrompts": [{"var": "val"}, ...],
    "instructions": "...",
    ...all other fields
  }
}
```

### 200 OK — Unauthenticated User AND Free Prompt (price = 0)

Returns prompt with content fields stripped:

```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "price": 0,
    "fullContent": null,
    "samples": [],
    "exampleOutputs": null,
    "examplePrompts": null,
    "instructions": null,
    "isFree": true,
    "contentLocked": true,
    ...all other metadata fields
  }
}
```

**New response fields**:
| Field | Type | Description |
|-------|------|-------------|
| `isFree` | `boolean` | `true` when `price === 0` |
| `contentLocked` | `boolean` | `true` when content is withheld (unauthenticated + free) |

### 404 Not Found

```json
{
  "error": { "code": "NOT_FOUND", "message": "البرومبت غير موجود" }
}
```

## Logic

```
1. Fetch prompt by ID
2. If not found → 404
3. Compute isFree = (prompt.price === 0)
4. Get userId from auth (null if unauthenticated)
5. If isFree AND userId is null:
   - Strip fullContent, samples, exampleOutputs, examplePrompts, instructions
   - Set contentLocked = true
6. Return mapped prompt with isFree and contentLocked fields
```
