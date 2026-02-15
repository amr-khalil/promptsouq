# Data Model: Free Prompts with Login-Gated Content

**Feature**: 009-free-prompts | **Date**: 2026-02-15

## New Table: `free_prompt_access`

Tracks when an authenticated user first accesses a free prompt's content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PK, auto-increment | Row identifier |
| `user_id` | `text` | NOT NULL | Clerk user ID of the accessing user |
| `prompt_id` | `uuid` | NOT NULL, FK → `prompts.id` | The free prompt that was accessed |
| `accessed_at` | `timestamp with timezone` | NOT NULL, DEFAULT `now()` | When the user first accessed the content |

**Constraints**:
- `UNIQUE(user_id, prompt_id)` — one record per user-prompt pair (FR-017)
- `FK prompt_id → prompts.id` — referential integrity

**Indexes**:
- `idx_free_prompt_access_user_id` on `user_id` — fast lookup for dashboard "My Free Prompts" list
- Unique constraint implicitly creates an index on `(user_id, prompt_id)`

**RLS Policies** (applied via Supabase MCP after migration):
- `anon`: No access (free access records are user-specific)
- `authenticated`: SELECT own records (`auth.uid()::text = user_id`)
- Service role (Drizzle client): Full access (bypasses RLS)

## Modified Table: `prompts`

No schema changes. The existing `price: real("price").notNull()` column already supports 0. A prompt with `price = 0` is treated as free throughout the application.

**Behavioral Changes**:
- `price = 0` activates free prompt logic (badge, content gating, skip cart)
- `price > 0` retains all existing paid prompt behavior unchanged

## Modified Validation: `promptSubmissionSchema`

The Zod schema gains a new `isFree` field (form-only, not persisted to DB):

```
isFree: boolean (default: false)
price: number — min 1.99 / max 99.99 when isFree=false; forced to 0 when isFree=true
```

Validation uses `superRefine` to enforce conditional price rules.

## Modified Query Schema: `promptsQuerySchema`

New optional parameter:

```
priceType: enum("all", "free", "paid") — default "all"
```

Maps to:
- `"free"` → `WHERE price = 0`
- `"paid"` → `WHERE price > 0`
- `"all"` → no price type filter (existing priceMin/priceMax still apply)

## Entity Relationships

```
┌──────────────┐       ┌──────────────────────┐
│   prompts    │       │  free_prompt_access   │
│──────────────│       │──────────────────────│
│ id (PK, uuid)│◄──────│ prompt_id (FK, uuid)  │
│ price (real)  │       │ user_id (text)        │
│ ...          │       │ accessed_at (ts)      │
└──────────────┘       │ UNIQUE(user_id,       │
       │               │        prompt_id)     │
       │               └──────────────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│   reviews    │       │ order_items   │
│──────────────│       │──────────────│
│ prompt_id(FK)│       │ prompt_id(FK)│
│ user_id      │       │ order_id(FK) │
│ ...          │       │ ...          │
└──────────────┘       └──────────────┘
```

**Key relationship notes**:
- `free_prompt_access` is independent of `orders`/`order_items` — free prompts have no order records
- `reviews` can now reference free prompts — the review POST handler conditionally skips purchase ownership check when `prompts.price = 0`
- A user can have BOTH a `free_prompt_access` record AND an `order_items` record for the same prompt (edge case: prompt was paid when purchased, later became free)

## State Transitions

### Free Prompt Lifecycle

```
Seller creates prompt (isFree=true, price=0)
    │
    ▼
[pending] ──── Admin reviews ────┬──► [approved] ──► Visible in marketplace
                                 │
                                 └──► [rejected] ──► Not visible
```

Same as paid prompts. No lifecycle differences.

### User Access Flow (Free Prompt)

```
Unauthenticated visit
    │
    ├── API returns metadata only (no fullContent/samples)
    ├── UI shows lock overlay + sign-in CTA
    │
    ▼
User signs in (redirect back to /prompt/{id})
    │
    ├── API returns full content (fullContent + samples)
    ├── UI shows unlocked content
    │
    ▼
POST /api/free-access (record first access)
    │
    ├── INSERT INTO free_prompt_access (ON CONFLICT DO NOTHING)
    └── Prompt appears in dashboard "My Free Prompts"
```
