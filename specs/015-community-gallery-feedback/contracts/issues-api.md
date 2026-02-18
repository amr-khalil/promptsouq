# API Contract: Issues

## GET /api/issues

List the authenticated user's own issues.

**Auth**: Required (Clerk)

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | string | no | — | Filter: `open`, `in_progress`, `resolved` |
| `limit` | integer | no | 20 | Items per page (1-50) |
| `offset` | integer | no | 0 | Pagination offset |

**Response 200**:
```json
{
  "issues": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "imageUrl": "string | null",
      "status": "open",
      "createdAt": "2026-02-18T00:00:00Z",
      "updatedAt": "2026-02-18T00:00:00Z",
      "statusChanges": [
        {
          "fromStatus": "open",
          "toStatus": "in_progress",
          "note": "نعمل على حل المشكلة",
          "createdAt": "2026-02-19T00:00:00Z"
        }
      ]
    }
  ],
  "total": 3
}
```

**Response 401**: Unauthorized

## POST /api/issues

Submit a new issue.

**Auth**: Required (Clerk)

**Request Body**:
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "imageUrl": "string | null (optional, from /api/upload/image)"
}
```

**Validation**:
- `title`: required, min 5 chars, max 200 chars
- `description`: required, min 10 chars, max 2000 chars
- `imageUrl`: optional, valid URL matching Supabase Storage pattern

**Response 201**:
```json
{
  "id": "uuid",
  "title": "string",
  "status": "open",
  "message": "تم إرسال البلاغ بنجاح"
}
```

**Response 400**: Validation error
**Response 401**: Unauthorized

## GET /api/admin/issues

List all issues (admin only).

**Auth**: Required (admin)

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | string | no | — | Filter: `open`, `in_progress`, `resolved` |
| `limit` | integer | no | 20 | Items per page |
| `offset` | integer | no | 0 | Pagination offset |
| `sort` | string | no | `newest` | Sort: `newest`, `oldest` |

**Response 200**:
```json
{
  "issues": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "imageUrl": "string | null",
      "reporterName": "string",
      "reporterId": "string",
      "status": "open",
      "createdAt": "2026-02-18T00:00:00Z",
      "updatedAt": "2026-02-18T00:00:00Z",
      "statusChanges": [...]
    }
  ],
  "total": 25
}
```

**Response 401**: Unauthorized
**Response 403**: Not admin

## PATCH /api/admin/issues/[id]/status

Change issue status with a resolution note.

**Auth**: Required (admin)

**Request Body**:
```json
{
  "status": "in_progress | resolved | open",
  "note": "string (required, min 5 chars)"
}
```

**Validation**:
- `status`: required, one of `open`, `in_progress`, `resolved`
- `note`: required, min 5 chars, max 1000 chars
- Status transition: any → any (admin can reopen or skip to resolved)

**Response 200**:
```json
{
  "id": "uuid",
  "status": "in_progress",
  "message": "تم تحديث حالة البلاغ"
}
```

**Side effects**:
- Inserts row into `issue_status_changes`
- Updates `issues.status` and `issues.updated_at`
- Creates a notification for the reporter

**Response 400**: Validation error
**Response 401**: Unauthorized
**Response 403**: Not admin
**Response 404**: Issue not found
