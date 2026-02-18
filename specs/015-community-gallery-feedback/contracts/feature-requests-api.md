# API Contract: Feature Requests

## GET /api/feature-requests

List feature requests with sorting.

**Auth**: None required (public)

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `sort` | string | no | `votes` | Sort by: `votes` (desc) or `newest` |
| `limit` | integer | no | 20 | Items per page (1-50) |
| `offset` | integer | no | 0 | Pagination offset |
| `status` | string | no | — | Filter: `open`, `under_review`, `planned`, `completed` |

**Response 200**:
```json
{
  "requests": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "authorName": "string",
      "voteCount": 12,
      "status": "open",
      "createdAt": "2026-02-18T00:00:00Z",
      "userHasVoted": false
    }
  ],
  "total": 45
}
```

**Notes**:
- `userHasVoted` requires checking auth; false for unauthenticated users
- Vote check uses Clerk userId from optional auth header

## POST /api/feature-requests

Submit a new feature request.

**Auth**: Required (Clerk)

**Request Body**:
```json
{
  "title": "string (required, max 100 chars)",
  "description": "string (required, max 1000 chars)"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "authorName": "string",
  "voteCount": 0,
  "status": "open",
  "createdAt": "2026-02-18T00:00:00Z"
}
```

**Response 400**: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }`
**Response 401**: Unauthorized

## POST /api/feature-requests/[id]/vote

Upvote a feature request.

**Auth**: Required (Clerk)

**Response 200**: `{ "voted": true, "voteCount": 13 }`
**Response 401**: Unauthorized
**Response 404**: Feature request not found
**Response 409**: Already voted

## DELETE /api/feature-requests/[id]/vote

Remove vote from a feature request.

**Auth**: Required (Clerk)

**Response 200**: `{ "voted": false, "voteCount": 12 }`
**Response 401**: Unauthorized
**Response 404**: Vote not found
