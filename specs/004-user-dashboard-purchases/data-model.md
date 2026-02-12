# Data Model: User Dashboard & Purchases

**Feature**: 004-user-dashboard-purchases
**Date**: 2026-02-12

## Schema Changes

### 1. Modified: `prompts` table

**Change**: Add `instructions` column.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| instructions | text | yes | null | Usage instructions shown on purchase detail page. Nullable for backward compat with existing prompts. |

**Existing columns preserved**: All current columns remain unchanged. The `fullContent` field continues to hold the prompt template text. The `samples` array continues to hold example outputs.

**Mapper update**: `mapPromptRow()` must include `instructions` field in output.

---

### 2. Modified: `reviews` table

**Change**: Add `userId` column and unique composite constraint.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| userId | text | no | — | Clerk user ID of the reviewer. Required for all new reviews. |

**Constraint**: `UNIQUE(user_id, prompt_id)` — enforces one review per user per prompt (FR-006).

**Migration consideration**: Existing seed reviews have no `userId`. Options:
- Set a default placeholder `userId` for existing reviews in the migration (e.g., `'seed-user'`)
- Or make `userId` nullable initially, then backfill and make NOT NULL

**Recommended**: Make `userId` NOT NULL with a default value in the migration for existing rows, then drop the default. Since only 3 seed reviews exist, a simple `UPDATE reviews SET user_id = 'seed-user' WHERE user_id IS NULL` in the migration is sufficient.

**Existing columns preserved**: `userName`, `userAvatar`, `rating`, `date`, `comment`, `promptId`, `createdAt` all unchanged. The `userName` and `userAvatar` are populated from Clerk at submission time — no runtime Clerk lookups needed for display.

---

### 3. New: `favorites` table

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | serial | no | auto-increment | Primary key |
| userId | text | no | — | Clerk user ID |
| promptId | uuid | no | — | FK → prompts.id |
| createdAt | timestamp(tz) | no | now() | When the user favorited |

**Constraints**:
- `PRIMARY KEY (id)`
- `FOREIGN KEY (promptId) → prompts.id`
- `UNIQUE(userId, promptId)` — prevents duplicate favorites

**RLS Policies** (via Supabase MCP):
- `anon`: No access
- `authenticated`: SELECT, INSERT, DELETE where `auth.uid()::text = user_id`

---

## Entity Relationships

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   orders    │───1:N──│ order_items │───N:1──│   prompts    │
│             │       │             │       │              │
│ userId (FK) │       │ orderId(FK) │       │ id (PK, UUID)│
│ stripeId    │       │ promptId(FK)│       │ fullContent  │
│ amountTotal │       │ price       │       │ samples[]    │
│ status      │       │             │       │ instructions │ ← NEW
│ createdAt   │       │ createdAt   │       │ rating       │
└─────────────┘       └─────────────┘       │ reviewsCount │
                                             └──────┬───────┘
                                                    │
                              ┌──────────────────────┼─────────────────┐
                              │                      │                 │
                       ┌──────┴───────┐       ┌──────┴──────┐   ┌─────┴──────┐
                       │   reviews    │       │  favorites  │   │ categories │
                       │              │       │             │   │            │
                       │ promptId(FK) │       │ userId      │   │ slug (PK)  │
                       │ userId  ← NEW│       │ promptId(FK)│   │ name       │
                       │ rating       │       │ createdAt   │   └────────────┘
                       │ comment      │       │             │
                       │ userName     │       │ UNIQUE(userId│
                       │ userAvatar   │       │  , promptId)│
                       │              │       └─────────────┘
                       │ UNIQUE(userId│
                       │  , promptId) │
                       └──────────────┘
```

## Drizzle Schema Definitions

### favorites.ts (new file)

```typescript
import { pgTable, serial, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { prompts } from "./prompts";

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  promptId: uuid("prompt_id")
    .notNull()
    .references(() => prompts.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  unique("favorites_user_prompt_unique").on(table.userId, table.promptId),
]);
```

### prompts.ts (add column)

```typescript
// Add after fullContent:
instructions: text("instructions"),
```

### reviews.ts (add column + constraint)

```typescript
// Add after promptId:
userId: text("user_id").notNull(),

// Add table constraint:
}, (table) => [
  unique("reviews_user_prompt_unique").on(table.userId, table.promptId),
]);
```

## State Transitions

### Review Lifecycle

```
[No Review] → (user submits) → [Published]
[Published] → (user edits) → [Published] (updated in place)
```

No draft, pending, or deleted states. Reviews are permanent once submitted (per clarification).

### Favorite Lifecycle

```
[Not Favorited] → (user clicks heart) → [Favorited]
[Favorited] → (user clicks heart) → [Not Favorited] (row deleted)
```

Binary state — no soft deletes.
