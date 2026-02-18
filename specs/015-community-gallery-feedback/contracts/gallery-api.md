# API Contract: Gallery

## GET /api/gallery

List approved gallery images with pagination and filtering.

**Auth**: None required (public)

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | integer | no | 20 | Items per page (1-50) |
| `cursor` | string | no | — | Cursor for next page (ISO timestamp of last item) |
| `period` | string | no | `all` | Time filter: `today`, `week`, `month`, `all` |
| `category` | string | no | — | Category slug filter |

**Response 200**:
```json
{
  "images": [
    {
      "id": "uuid",
      "imageUrl": "https://...",
      "caption": "string | null",
      "likesCount": 0,
      "createdAt": "2026-02-18T00:00:00Z",
      "prompt": {
        "id": "uuid",
        "title": "string",
        "isFree": true,
        "category": "string"
      },
      "seller": {
        "id": "string",
        "name": "string",
        "avatar": "string | null"
      }
    }
  ],
  "nextCursor": "string | null",
  "hasMore": true
}
```

## GET /api/gallery/[id]

Get gallery image detail with prompt info.

**Auth**: None required (public)

**Response 200**:
```json
{
  "id": "uuid",
  "imageUrl": "https://...",
  "caption": "string | null",
  "likesCount": 0,
  "createdAt": "2026-02-18T00:00:00Z",
  "userHasLiked": false,
  "prompt": {
    "id": "uuid",
    "title": "string",
    "titleEn": "string",
    "isFree": true,
    "price": 0,
    "promptPreview": "string | null",
    "fullContent": "string | null",
    "category": "string"
  },
  "seller": {
    "id": "string",
    "name": "string",
    "avatar": "string | null",
    "rating": 4.5
  },
  "relatedImages": [
    {
      "id": "uuid",
      "imageUrl": "https://...",
      "likesCount": 0
    }
  ]
}
```

**Notes**:
- `prompt.fullContent` is only populated when `isFree === true`
- `prompt.promptPreview` is a truncated (~100 char) snippet for paid prompts
- `userHasLiked` requires checking auth; false for unauthenticated users

**Response 404**: `{ "error": { "code": "NOT_FOUND", "message": "..." } }`

## POST /api/gallery/[id]/like

Like a gallery image.

**Auth**: Required (Clerk)

**Response 200**: `{ "liked": true, "likesCount": 5 }`
**Response 401**: Unauthorized
**Response 409**: Already liked

## DELETE /api/gallery/[id]/like

Unlike a gallery image.

**Auth**: Required (Clerk)

**Response 200**: `{ "liked": false, "likesCount": 4 }`
**Response 401**: Unauthorized
**Response 404**: Like not found

## POST /api/gallery

Upload a gallery image (seller only).

**Auth**: Required (Clerk, seller with published prompts)

**Request Body**:
```json
{
  "imageUrl": "https://... (from /api/upload/image)",
  "promptId": "uuid",
  "caption": "string | null"
}
```

**Validation**:
- `imageUrl`: required, valid URL
- `promptId`: required, UUID, must belong to authenticated seller, must be approved
- `caption`: optional, max 500 chars

**Response 201**:
```json
{
  "id": "uuid",
  "status": "pending",
  "message": "تم رفع الصورة بنجاح وستتم مراجعتها قريباً"
}
```

**Response 400**: Validation error
**Response 401**: Unauthorized
**Response 403**: Not a seller or prompt not owned

## GET /api/admin/gallery

List gallery images for admin moderation.

**Auth**: Required (admin)

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | string | no | `pending` | Filter: `pending`, `approved`, `rejected` |
| `limit` | integer | no | 20 | Items per page |
| `offset` | integer | no | 0 | Pagination offset |

**Response 200**:
```json
{
  "images": [
    {
      "id": "uuid",
      "imageUrl": "https://...",
      "caption": "string | null",
      "status": "pending",
      "createdAt": "2026-02-18T00:00:00Z",
      "seller": { "id": "string", "name": "string" },
      "prompt": { "id": "uuid", "title": "string" }
    }
  ],
  "total": 15
}
```

## POST /api/admin/gallery/[id]/review

Approve or reject a gallery image.

**Auth**: Required (admin)

**Request Body**:
```json
{
  "action": "approve | reject",
  "rejectionReason": "string (required if action=reject)"
}
```

**Response 200**:
```json
{
  "id": "uuid",
  "status": "approved | rejected",
  "message": "تم تحديث حالة الصورة"
}
```

**Side effects**: Creates a notification for the seller.

**Response 400**: Validation error
**Response 404**: Image not found
**Response 409**: Already reviewed
