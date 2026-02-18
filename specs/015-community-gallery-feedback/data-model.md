# Data Model: Community Gallery & Feedback System

**Feature**: 015-community-gallery-feedback
**Date**: 2026-02-18

## Entity Relationship Diagram (Text)

```
prompts (existing)
  │
  ├──< gallery_images (prompt_id FK)
  │       │
  │       └──< gallery_likes (gallery_image_id FK)
  │
  └── categories (existing, via slug)

feature_requests
  │
  └──< feature_votes (feature_request_id FK)

issues
  │
  └──< issue_status_changes (issue_id FK)

notifications (standalone, references user_id)
```

## New Tables

### 1. `gallery_images`

Stores AI-generated images uploaded by sellers, linked to prompts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` | Image ID |
| `prompt_id` | uuid | FK → prompts.id, NOT NULL | Linked prompt |
| `seller_id` | text | NOT NULL | Clerk user ID of uploader |
| `image_url` | text | NOT NULL | Supabase Storage public URL |
| `caption` | text | nullable | Optional caption (max 500 chars) |
| `status` | text | NOT NULL, default `'pending'` | `pending`, `approved`, `rejected` |
| `rejection_reason` | text | nullable | Admin's rejection reason |
| `reviewed_by` | text | nullable | Admin Clerk user ID who reviewed |
| `reviewed_at` | timestamp with tz | nullable | When reviewed |
| `likes_count` | integer | NOT NULL, default `0` | Denormalized like count |
| `created_at` | timestamp with tz | NOT NULL, default `now()` | Upload date |

**Indexes**:
- `idx_gallery_images_status` on `(status)` — filter by approval status
- `idx_gallery_images_seller_id` on `(seller_id)` — seller's submissions list
- `idx_gallery_images_prompt_id` on `(prompt_id)` — images per prompt
- `idx_gallery_images_created_at` on `(created_at)` — time-based sorting/filtering

### 2. `gallery_likes`

Tracks user likes on gallery images. One like per user per image.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PK | Auto-increment ID |
| `gallery_image_id` | uuid | FK → gallery_images.id, NOT NULL, ON DELETE CASCADE | Liked image |
| `user_id` | text | NOT NULL | Clerk user ID |
| `created_at` | timestamp with tz | NOT NULL, default `now()` | When liked |

**Constraints**:
- `UNIQUE (user_id, gallery_image_id)` — one like per user per image

**Indexes**:
- `idx_gallery_likes_user_image` on `(user_id, gallery_image_id)` — check if user liked

### 3. `feature_requests`

User-submitted feature ideas with vote tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` | Request ID |
| `title` | text | NOT NULL | Title (max 100 chars, validated at API) |
| `description` | text | NOT NULL | Description (max 1000 chars, validated at API) |
| `author_id` | text | NOT NULL | Clerk user ID of submitter |
| `author_name` | text | NOT NULL | Display name at submission time |
| `vote_count` | integer | NOT NULL, default `0` | Denormalized vote count |
| `status` | text | NOT NULL, default `'open'` | `open`, `under_review`, `planned`, `completed` |
| `created_at` | timestamp with tz | NOT NULL, default `now()` | Submission date |

**Indexes**:
- `idx_feature_requests_vote_count` on `(vote_count DESC)` — sort by popularity
- `idx_feature_requests_created_at` on `(created_at DESC)` — sort by newest
- `idx_feature_requests_status` on `(status)` — filter by status

### 4. `feature_votes`

Tracks user votes on feature requests. One vote per user per request.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PK | Auto-increment ID |
| `feature_request_id` | uuid | FK → feature_requests.id, NOT NULL, ON DELETE CASCADE | Voted request |
| `user_id` | text | NOT NULL | Clerk user ID |
| `created_at` | timestamp with tz | NOT NULL, default `now()` | When voted |

**Constraints**:
- `UNIQUE (user_id, feature_request_id)` — one vote per user per request

### 5. `issues`

User-reported bugs/problems.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` | Issue ID |
| `title` | text | NOT NULL | Issue title |
| `description` | text | NOT NULL | Issue description |
| `image_url` | text | nullable | Optional screenshot URL (Supabase Storage) |
| `reporter_id` | text | NOT NULL | Clerk user ID of reporter |
| `reporter_name` | text | NOT NULL | Display name at submission time |
| `status` | text | NOT NULL, default `'open'` | `open`, `in_progress`, `resolved` |
| `created_at` | timestamp with tz | NOT NULL, default `now()` | Submission date |
| `updated_at` | timestamp with tz | NOT NULL, default `now()` | Last status change |

**Indexes**:
- `idx_issues_reporter_id` on `(reporter_id)` — user's own issues
- `idx_issues_status` on `(status)` — admin filter by status
- `idx_issues_created_at` on `(created_at DESC)` — sort by newest

### 6. `issue_status_changes`

History of admin status changes on issues, each with a required note.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PK | Auto-increment ID |
| `issue_id` | uuid | FK → issues.id, NOT NULL, ON DELETE CASCADE | Parent issue |
| `from_status` | text | NOT NULL | Previous status |
| `to_status` | text | NOT NULL | New status |
| `note` | text | NOT NULL | Admin's resolution note |
| `changed_by` | text | NOT NULL | Admin Clerk user ID |
| `created_at` | timestamp with tz | NOT NULL, default `now()` | When changed |

**Indexes**:
- `idx_issue_status_changes_issue_id` on `(issue_id)` — get history for an issue

### 7. `notifications`

In-app notifications for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` | Notification ID |
| `user_id` | text | NOT NULL | Recipient Clerk user ID |
| `type` | text | NOT NULL | `gallery_approved`, `gallery_rejected`, `issue_status_changed` |
| `title` | text | NOT NULL | Notification title (Arabic) |
| `message` | text | NOT NULL | Notification body (Arabic) |
| `link` | text | nullable | URL to navigate to when clicked |
| `read` | boolean | NOT NULL, default `false` | Read status |
| `created_at` | timestamp with tz | NOT NULL, default `now()` | When created |

**Indexes**:
- `idx_notifications_user_unread` on `(user_id, read)` — unread count query
- `idx_notifications_user_created` on `(user_id, created_at DESC)` — list notifications

## RLS Policies (Applied via Supabase MCP)

### `gallery_images`
- **anon SELECT**: `status = 'approved'` — public gallery browsing
- **authenticated SELECT**: `status = 'approved' OR seller_id = auth.uid()::text` — own images + approved
- **authenticated INSERT**: `seller_id = auth.uid()::text` — sellers upload own images
- **admin SELECT/UPDATE**: all rows — moderation

### `gallery_likes`
- **anon SELECT**: allowed (like counts are public)
- **authenticated INSERT/DELETE**: `user_id = auth.uid()::text` — own likes only

### `feature_requests`
- **anon SELECT**: allowed — public browsing
- **authenticated INSERT**: `author_id = auth.uid()::text` — submit own requests
- **admin UPDATE**: all rows — status management

### `feature_votes`
- **authenticated SELECT**: `user_id = auth.uid()::text` — check own vote status
- **authenticated INSERT/DELETE**: `user_id = auth.uid()::text` — own votes only

### `issues`
- **authenticated SELECT**: `reporter_id = auth.uid()::text` — own issues only
- **authenticated INSERT**: `reporter_id = auth.uid()::text` — submit own issues
- **admin SELECT/UPDATE**: all rows — issue management

### `issue_status_changes`
- **authenticated SELECT**: via join with issues where `reporter_id = auth.uid()::text`
- **admin INSERT**: all — admin adds status changes

### `notifications`
- **authenticated SELECT**: `user_id = auth.uid()::text` — own notifications only
- **authenticated UPDATE**: `user_id = auth.uid()::text` — mark own as read

## State Transitions

### Gallery Image Lifecycle
```
pending → approved (admin approves → notification sent)
pending → rejected (admin rejects with reason → notification sent)
rejected → pending (seller resubmits — new row, not status change)
```

### Issue Lifecycle
```
open → in_progress (admin changes + note → status change record)
open → resolved (admin changes + note → status change record)
in_progress → resolved (admin changes + note → status change record)
in_progress → open (admin reopens + note → status change record)
```

### Feature Request Lifecycle
```
open → under_review (admin manual)
under_review → planned (admin manual)
planned → completed (admin manual)
Any → open (admin can revert)
```

## Denormalization Notes

- `gallery_images.likes_count`: Incremented/decremented via trigger or application code when `gallery_likes` rows are inserted/deleted. Avoids COUNT query on every gallery page load.
- `feature_requests.vote_count`: Same pattern as likes_count. Incremented/decremented with vote operations.
- `issues.status`: Denormalized from latest `issue_status_changes` row for efficient filtering. Updated when a new status change is inserted.
