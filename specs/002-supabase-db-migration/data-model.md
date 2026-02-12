# Data Model: Supabase Database Migration

**Feature**: 002-supabase-db-migration
**Date**: 2026-02-12

## Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐
│   categories    │       │    prompts       │
├─────────────────┤       ├──────────────────┤
│ id (PK, serial) │◄──────│ category (FK)    │
│ slug (unique)   │       │ id (PK, serial)  │
│ name            │       │ title            │
│ name_en         │       │ title_en         │
│ icon            │       │ description      │
│ count           │       │ description_en   │
│ created_at      │       │ price            │
│ updated_at      │       │ ai_model         │
└─────────────────┘       │ rating           │
                          │ reviews_count    │
                          │ sales            │
                          │ thumbnail        │
                          │ seller_name      │
                          │ seller_avatar    │
                          │ seller_rating    │
                          │ tags (text[])    │
                          │ difficulty       │
                          │ samples (text[]) │
                          │ full_content     │
                          │ created_at       │
                          │ updated_at       │
                          └──────┬───────────┘
                                 │
                                 │ 1:N
                                 ▼
                          ┌──────────────────┐
                          │    reviews       │
                          ├──────────────────┤
                          │ id (PK, serial)  │
                          │ prompt_id (FK)   │
                          │ user_name        │
                          │ user_avatar      │
                          │ rating           │
                          │ date             │
                          │ comment          │
                          │ created_at       │
                          └──────────────────┘

┌─────────────────────┐
│   testimonials      │
├─────────────────────┤
│ id (PK, serial)     │
│ name                │
│ role                │
│ content             │
│ avatar              │
│ rating              │
│ created_at          │
└─────────────────────┘
```

## Table Definitions

### categories

| Column     | Type         | Constraints          | Notes                          |
|------------|-------------|----------------------|--------------------------------|
| id         | serial      | PRIMARY KEY          | Auto-increment                 |
| slug       | text        | NOT NULL, UNIQUE     | URL-safe identifier (e.g., "gpt", "midjourney") |
| name       | text        | NOT NULL             | Arabic display name            |
| name_en    | text        | NOT NULL             | English display name           |
| icon       | text        | NOT NULL             | Lucide icon name               |
| count      | integer     | NOT NULL, DEFAULT 0  | Static prompt count (seed data)|
| created_at | timestamptz | NOT NULL, DEFAULT now | Auto-set on creation           |
| updated_at | timestamptz | NOT NULL, DEFAULT now | Updated on modification        |

**Notes**:
- The `slug` maps to the `id` field in mock data (e.g., "gpt", "midjourney", "business")
- The `id` field is the database PK (serial integer)
- API responses return `slug` as `id` to maintain backward compatibility with mock data contract

### prompts

| Column          | Type         | Constraints                     | Notes                           |
|-----------------|-------------|----------------------------------|---------------------------------|
| id              | serial      | PRIMARY KEY                      | Auto-increment                  |
| title           | text        | NOT NULL                         | Arabic title                    |
| title_en        | text        | NOT NULL                         | English title                   |
| description     | text        | NOT NULL                         | Arabic description              |
| description_en  | text        | NOT NULL                         | English description             |
| price           | real        | NOT NULL                         | Price in display currency       |
| category        | text        | NOT NULL, REFERENCES categories(slug) | FK to categories.slug      |
| ai_model        | text        | NOT NULL                         | e.g., "ChatGPT", "Midjourney"  |
| rating          | real        | NOT NULL, DEFAULT 0              | Average rating (0-5)            |
| reviews_count   | integer     | NOT NULL, DEFAULT 0              | Total review count              |
| sales           | integer     | NOT NULL, DEFAULT 0              | Total sales count               |
| thumbnail       | text        | NOT NULL                         | Image URL                       |
| seller_name     | text        | NOT NULL                         | Seller display name             |
| seller_avatar   | text        | NOT NULL                         | Seller avatar URL               |
| seller_rating   | real        | NOT NULL, DEFAULT 0              | Seller aggregate rating         |
| tags            | text[]      | NOT NULL, DEFAULT '{}'           | Array of tag strings            |
| difficulty      | text        | NOT NULL                         | "مبتدئ" or "متقدم"               |
| samples         | text[]      | NOT NULL, DEFAULT '{}'           | Array of sample output strings  |
| full_content    | text        |                                  | Full prompt content (nullable)  |
| created_at      | timestamptz | NOT NULL, DEFAULT now            | Auto-set on creation            |
| updated_at      | timestamptz | NOT NULL, DEFAULT now            | Updated on modification         |

**Notes**:
- `category` references `categories.slug` (not `categories.id`) for human-readable joins and backward compat
- `seller_*` fields are denormalized — matches spec assumption of embedded seller data
- `reviews_count` maps to mock data's `reviews` field (renamed to avoid collision with reviews table)
- `difficulty` is stored as text (Arabic strings) — not an enum, to avoid migration complexity for future values
- `tags` and `samples` use native PostgreSQL text arrays

### reviews

| Column      | Type         | Constraints                      | Notes                     |
|-------------|-------------|----------------------------------|---------------------------|
| id          | serial      | PRIMARY KEY                      | Auto-increment            |
| prompt_id   | integer     | NOT NULL, REFERENCES prompts(id) | FK to prompts             |
| user_name   | text        | NOT NULL                         | Reviewer display name     |
| user_avatar | text        | NOT NULL                         | Reviewer avatar URL       |
| rating      | integer     | NOT NULL                         | Rating (1-5)              |
| date        | text        | NOT NULL                         | Date string (YYYY-MM-DD)  |
| comment     | text        | NOT NULL                         | Arabic review text        |
| created_at  | timestamptz | NOT NULL, DEFAULT now            | Auto-set on creation      |

**Notes**:
- `prompt_id` links reviews to specific prompts (fixes current bug where all reviews are returned for any prompt)
- `date` is stored as text to match the existing mock data format (`"2026-02-05"`) — the API returns it as-is
- All 3 seed reviews will be assigned to prompt ID 1

### testimonials

| Column     | Type         | Constraints          | Notes                   |
|------------|-------------|----------------------|-------------------------|
| id         | serial      | PRIMARY KEY          | Auto-increment          |
| name       | text        | NOT NULL             | Person's name           |
| role       | text        | NOT NULL             | Professional role       |
| content    | text        | NOT NULL             | Testimonial text        |
| avatar     | text        | NOT NULL             | Avatar URL              |
| rating     | integer     | NOT NULL             | Rating (1-5)            |
| created_at | timestamptz | NOT NULL, DEFAULT now | Auto-set on creation    |

**Notes**:
- Standalone table — not linked to prompts or users
- Simple structure matching mock data exactly

## API Response Mapping

The database uses snake_case columns but the API must return camelCase to match the existing contract. Key mappings:

| DB Column       | API Response Field | Transform                              |
|-----------------|-------------------|----------------------------------------|
| id (serial)     | id (string)       | `id.toString()`                        |
| name_en         | nameEn            | camelCase rename                       |
| title_en        | titleEn           | camelCase rename                       |
| description_en  | descriptionEn     | camelCase rename                       |
| reviews_count   | reviews           | rename to match mock contract          |
| seller_name/avatar/rating | seller: { name, avatar, rating } | Reconstruct nested object |
| category (slug) | category          | Direct pass-through (slug = mock ID)   |
| full_content    | fullContent       | camelCase rename                       |
| user_name       | userName          | camelCase rename                       |
| user_avatar     | userAvatar        | camelCase rename                       |
| ai_model        | aiModel           | camelCase rename                       |

## RLS Policies

Applied via Supabase MCP after schema creation:

### Public Read (all tables)

| Table        | Policy Name               | Operation | Role  | Rule     |
|-------------|---------------------------|-----------|-------|----------|
| categories  | allow_public_read_categories | SELECT  | anon  | true     |
| prompts     | allow_public_read_prompts   | SELECT  | anon  | true     |
| reviews     | allow_public_read_reviews   | SELECT  | anon  | true     |
| testimonials| allow_public_read_testimonials | SELECT | anon | true     |

### Admin Write (prompts table)

| Table   | Policy Name                | Operation       | Role          | Rule |
|---------|---------------------------|-----------------|---------------|------|
| prompts | allow_admin_insert_prompts | INSERT          | authenticated | `(auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin'` |
| prompts | allow_admin_update_prompts | UPDATE          | authenticated | `(auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin'` |
| prompts | allow_admin_delete_prompts | DELETE          | authenticated | `(auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin'` |

**Notes**:
- Anonymous users: SELECT only on all tables. INSERT/UPDATE/DELETE denied by default.
- Authenticated non-admin users: SELECT only. Write operations denied (no matching policy).
- Authenticated admin users: Full CRUD on prompts table. Admin role is identified via Clerk JWT `publicMetadata.role` claim passed through Supabase auth.
- The Drizzle client connects with the `postgres` role (service role) which bypasses RLS. RLS policies serve as defense-in-depth for any direct Supabase client SDK access.
- Primary access control for the seller upload flow is enforced at the API route handler level (Clerk auth check), with RLS as a secondary safeguard.
