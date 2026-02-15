# Contract: POST /api/free-access

**Method**: POST
**Path**: `/api/free-access`
**Auth**: Required (authenticated users only)

## Purpose

Records that an authenticated user accessed a free prompt's content. Idempotent — duplicate calls for the same user+prompt pair are silently ignored (FR-017).

## Request

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Clerk session token |
| `Content-Type` | Yes | `application/json` |

**Body**:

```json
{
  "promptId": "uuid"
}
```

**Validation** (Zod):
| Field | Type | Constraints | Message |
|-------|------|-------------|---------|
| `promptId` | `string` | `.uuid()` | "معرّف غير صالح" |

## Response

### 201 Created — First Access Recorded

```json
{
  "data": {
    "promptId": "uuid",
    "accessedAt": "2026-02-15T10:30:00.000Z"
  }
}
```

### 200 OK — Already Accessed (Idempotent)

```json
{
  "data": {
    "promptId": "uuid",
    "accessedAt": "2026-02-14T08:00:00.000Z"
  }
}
```

### 400 Bad Request — Prompt is Not Free

```json
{
  "error": { "code": "NOT_FREE", "message": "هذا البرومبت ليس مجانياً" }
}
```

### 401 Unauthorized

```json
{
  "error": { "code": "FORBIDDEN", "message": "يجب تسجيل الدخول أولاً" }
}
```

### 404 Not Found

```json
{
  "error": { "code": "NOT_FOUND", "message": "البرومبت غير موجود" }
}
```

## Logic

```
1. Check auth → 401 if not authenticated
2. Validate body (promptId as UUID) → 400 if invalid
3. Fetch prompt by ID → 404 if not found
4. Check prompt.price === 0 → 400 if not free
5. INSERT INTO free_prompt_access (user_id, prompt_id)
   ON CONFLICT (user_id, prompt_id) DO NOTHING
6. SELECT the existing or new record
7. Return 201 (new) or 200 (existing) with accessedAt
```
