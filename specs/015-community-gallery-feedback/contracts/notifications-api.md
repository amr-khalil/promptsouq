# API Contract: Notifications

## GET /api/notifications/count

Get unread notification count for the authenticated user.

**Auth**: Required (Clerk)

**Response 200**:
```json
{
  "unreadCount": 3
}
```

**Response 401**: Unauthorized

## GET /api/notifications

List notifications for the authenticated user.

**Auth**: Required (Clerk)

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | integer | no | 20 | Items per page (1-50) |
| `offset` | integer | no | 0 | Pagination offset |

**Response 200**:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "gallery_approved",
      "title": "تمت الموافقة على صورتك",
      "message": "تمت الموافقة على صورتك في المعرض",
      "link": "/gallery",
      "read": false,
      "createdAt": "2026-02-18T00:00:00Z"
    }
  ],
  "total": 10,
  "unreadCount": 3
}
```

**Response 401**: Unauthorized

## PATCH /api/notifications

Mark notifications as read.

**Auth**: Required (Clerk)

**Request Body**:
```json
{
  "action": "read_one | read_all",
  "notificationId": "uuid (required if action=read_one)"
}
```

**Response 200**:
```json
{
  "message": "تم تحديث الإشعارات",
  "unreadCount": 0
}
```

**Response 400**: Validation error
**Response 401**: Unauthorized
**Response 404**: Notification not found (for read_one)
