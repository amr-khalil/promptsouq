# Data Model: Supabase Auth Migration

**Feature**: 016-supabase-auth-migration
**Date**: 2026-02-18

## New Entities

### profiles

Auto-created for each user via database trigger on `auth.users` INSERT.

| Field                  | Type         | Constraints                                      |
|------------------------|--------------|--------------------------------------------------|
| id                     | uuid         | PK, references auth.users(id) ON DELETE CASCADE  |
| first_name             | text         | nullable                                         |
| last_name              | text         | nullable                                         |
| display_name           | text         | nullable                                         |
| avatar_url             | text         | nullable                                         |
| onboarding_completed   | boolean      | NOT NULL, default false                          |
| locale                 | text         | NOT NULL, default 'ar'                           |
| created_at             | timestamptz  | NOT NULL, default now()                          |
| updated_at             | timestamptz  | NOT NULL, default now()                          |

**RLS Policies**:
- anon: no access
- authenticated: SELECT own row (`auth.uid() = id`)
- authenticated: UPDATE own row (`auth.uid() = id`) — only `first_name`, `last_name`, `display_name`, `avatar_url`, `onboarding_completed`, `locale`

**Indexes**:
- PK on `id` (implicit)

**Trigger**: `on_auth_user_created` — AFTER INSERT on `auth.users` → inserts row into `profiles` with:
- `id` = `new.id`
- `first_name` = `new.raw_user_meta_data->>'first_name'`
- `last_name` = `new.raw_user_meta_data->>'last_name'`
- `display_name` = `new.raw_user_meta_data->>'full_name'` (from OAuth) or concat of first+last
- `avatar_url` = `new.raw_user_meta_data->>'avatar_url'` (from OAuth)

---

## Auth Metadata (not a table — stored on `auth.users`)

### app_metadata (server-managed, not user-editable)

| Field | Type   | Default | Notes                          |
|-------|--------|---------|--------------------------------|
| role  | string | "user"  | "admin" or "user"              |

Set/modified only via Supabase Admin API (`supabaseAdmin.auth.admin.updateUser()`).

### user_metadata (user-editable via `updateUser()`)

Not used for any security-critical data. OAuth providers auto-populate `full_name`, `avatar_url`, `email` here. We read from this in the trigger to seed the `profiles` table.

---

## Existing Tables — No Schema Changes

All existing tables use `userId` (text) columns that store Clerk user IDs. Since this is a clean-break migration (no production data), no column type changes are needed. New Supabase Auth user IDs (UUIDs as text) will be stored in the same columns going forward.

**Tables with `userId` text columns** (no changes needed):
- `orders.userId`
- `favorites.userId`
- `reviews.userId`
- `free_prompt_access.userId`
- `generations.userId`
- `seller_profiles.userId` (PK)
- `credit_balances.userId` (PK)
- `credit_transactions.userId`
- `user_subscriptions.userId`
- `feature_requests.authorId`
- `feature_votes.userId`
- `gallery_likes.userId`
- `issues.reporterId`
- `notifications.userId`
- `marketplace_settings.updatedBy`

---

## State Transitions

### User Account States

```
[Unregistered] → signUp() → [Unverified]
[Unverified] → verify email → [Active]
[Active] → sign out → [Signed Out]
[Signed Out] → sign in → [Active]
[Active] → admin promotes → [Active + Admin]
[Active + Admin] → admin demotes → [Active]
```

### Onboarding States

```
[New User] → first sign-in → [Onboarding Step 1]
[Step 1] → complete/skip → [Step 2] or [Dashboard]
[Step 2] → complete/skip → [Dashboard]
[Dashboard] → (onboarding_completed = true, never shows again)
```

### Password Reset Flow

```
[Forgot Password] → request reset → [Email Sent]
[Email Sent] → click link → [/auth/confirm verifies token] → [/reset-password page]
[/reset-password] → submit new password → [Redirect to /sign-in]
```

---

## Drizzle Schema Definition

The `profiles` table will be defined in `src/db/schema/profiles.ts` using Drizzle's `pgTable()`. However, the actual table and trigger must be created via Supabase migration (not Drizzle) because:
1. The trigger references `auth.users` which is in the `auth` schema (not managed by Drizzle)
2. The trigger function requires `SECURITY DEFINER` privileges

The Drizzle schema definition is for type inference (`$inferSelect`, `$inferInsert`) and query building only.

---

## Entity Relationships

```
auth.users (Supabase managed)
  ├── 1:1 → profiles (auto-created via trigger)
  ├── 1:N → orders
  ├── 1:N → favorites
  ├── 1:N → reviews
  ├── 1:N → generations
  ├── 1:N → credit_transactions
  ├── 1:1 → credit_balances
  ├── 1:1 → seller_profiles
  ├── 1:1 → user_subscriptions
  ├── 1:N → feature_requests (as author)
  ├── 1:N → feature_votes
  ├── 1:N → gallery_likes
  ├── 1:N → issues (as reporter)
  └── 1:N → notifications
```
