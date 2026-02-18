# API Contracts: Auth Routes

**Feature**: 016-supabase-auth-migration
**Date**: 2026-02-18

All auth flows use Supabase client-side SDK methods. These routes handle server-side token exchange and verification.

---

## GET /auth/callback

**Purpose**: Exchange OAuth PKCE code for session after provider redirect.

**Query Parameters**:
| Param | Type   | Required | Description                          |
|-------|--------|----------|--------------------------------------|
| code  | string | yes      | PKCE authorization code from Supabase |
| next  | string | no       | Redirect path after success (default: `/dashboard`) |

**Success Response**: 302 redirect to `next` path with session cookies set.

**Error Response**: 302 redirect to `/sign-in?error=auth-code-error`.

---

## GET /auth/confirm

**Purpose**: Verify email/recovery tokens from Supabase-sent emails.

**Query Parameters**:
| Param      | Type   | Required | Description                              |
|------------|--------|----------|------------------------------------------|
| token_hash | string | yes      | Hashed token from email link             |
| type       | string | yes      | Token type: `email`, `recovery`          |
| next       | string | no       | Redirect path after success              |

**Behavior by type**:
- `type=email` → verifies signup email, redirects to `/dashboard`
- `type=recovery` → establishes recovery session, redirects to `/reset-password`

**Success Response**: 302 redirect to appropriate destination with session cookies.

**Error Response**: 302 redirect to `/sign-in?error=verification-failed`.

---

## POST /api/auth/sign-out

**Purpose**: Server-side sign-out to clear session cookies reliably.

**Request**: No body required. Auth cookies sent automatically.

**Success Response**:
```json
{ "success": true }
```
Status: 200

**Error Response**:
```json
{ "error": "Failed to sign out" }
```
Status: 500

---

## GET /api/user/profile

**Purpose**: Get current user's profile data (from `profiles` table + auth metadata).

**Auth**: Required (401 if unauthenticated).

**Success Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "أحمد",
  "lastName": "محمد",
  "displayName": "أحمد محمد",
  "avatarUrl": "https://...",
  "role": "user",
  "onboardingCompleted": false,
  "locale": "ar",
  "emailVerified": true,
  "createdAt": "2026-02-18T10:00:00Z",
  "lastSignInAt": "2026-02-18T12:00:00Z"
}
```
Status: 200

---

## PUT /api/user/profile

**Purpose**: Update current user's profile (name, avatar, locale, onboarding flag).

**Auth**: Required (401 if unauthenticated).

**Request Body** (all fields optional):
```json
{
  "firstName": "أحمد",
  "lastName": "محمد",
  "displayName": "أحمد محمد",
  "avatarUrl": "https://...",
  "onboardingCompleted": true,
  "locale": "ar"
}
```

**Validation** (Zod):
- `firstName`: string, min 1, max 50
- `lastName`: string, min 1, max 50
- `displayName`: string, min 1, max 100
- `avatarUrl`: string, URL format
- `onboardingCompleted`: boolean
- `locale`: enum `["ar", "en"]`

**Success Response**:
```json
{
  "id": "uuid",
  "firstName": "أحمد",
  "lastName": "محمد",
  "displayName": "أحمد محمد",
  "avatarUrl": "https://...",
  "onboardingCompleted": true,
  "locale": "ar",
  "updatedAt": "2026-02-18T12:00:00Z"
}
```
Status: 200

**Error Response** (validation):
```json
{
  "error": "Validation failed",
  "fieldErrors": {
    "firstName": ["الاسم مطلوب"]
  }
}
```
Status: 400

---

## PUT /api/admin/users/[id]/role

**Purpose**: Promote or demote a user's role (admin only).

**Auth**: Required, admin role (401 if unauthenticated, 403 if not admin).

**Path Parameters**:
| Param | Type   | Description                |
|-------|--------|----------------------------|
| id    | string | Target user's UUID         |

**Request Body**:
```json
{
  "role": "admin"
}
```

**Validation** (Zod):
- `role`: enum `["admin", "user"]`

**Success Response**:
```json
{
  "id": "uuid",
  "role": "admin",
  "updatedAt": "2026-02-18T12:00:00Z"
}
```
Status: 200

**Error Response** (self-demotion):
```json
{
  "error": "Cannot change your own role"
}
```
Status: 400

---

## GET /api/admin/users

**Purpose**: List all users with profiles and roles (admin only).

**Auth**: Required, admin role.

**Query Parameters**:
| Param  | Type   | Required | Default | Description                 |
|--------|--------|----------|---------|-----------------------------|
| page   | number | no       | 1       | Page number                 |
| limit  | number | no       | 20      | Items per page (max 100)    |
| search | string | no       | —       | Filter by name or email     |
| role   | string | no       | —       | Filter by role (admin/user) |

**Success Response**:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "أحمد",
      "avatarUrl": "https://...",
      "role": "user",
      "createdAt": "2026-02-18T10:00:00Z",
      "lastSignInAt": "2026-02-18T12:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```
Status: 200
