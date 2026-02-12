# Research: Supabase Database Migration

**Feature**: 002-supabase-db-migration
**Date**: 2026-02-12

## R-001: Drizzle ORM + Supabase Connection Setup

**Decision**: Use `drizzle-orm` with `postgres` (postgres.js) driver, connecting via Supabase connection pooler in transaction mode.

**Rationale**: This is the officially recommended setup per Supabase documentation. The `postgres.js` driver is lightweight and natively supports the Supabase pooler. Transaction mode (port 6543) is optimal for Next.js server-side usage where connections are short-lived. Must set `prepare: false` since transaction mode pooling does not support prepared statements.

**Alternatives considered**:
- `@neondatabase/serverless` — Not needed, Supabase provides its own pooler
- `pg` (node-postgres) — Heavier, less TypeScript-native than postgres.js
- Direct connection (port 5432) — Less efficient for serverless/Next.js workloads

**Packages to install**:
- `drizzle-orm` (runtime)
- `postgres` (runtime — the postgres.js driver)
- `drizzle-kit` (dev — migration tooling)
- `dotenv` (dev — for drizzle-kit CLI config, since it runs outside Next.js)

## R-002: ID Strategy

**Decision**: Use serial auto-increment integers as primary keys. API responses will coerce IDs to strings to maintain backward compatibility with the current `id: "1"` format.

**Rationale**: Serial integers are the simplest, most efficient option for the current small dataset. The existing mock data uses string IDs "1" through "8" which map naturally to sequential integers. URL routes (`/prompt/[id]`) already handle IDs as strings via route params, so no frontend changes needed. Coercing `id.toString()` in the API layer preserves the existing response contract.

**Alternatives considered**:
- UUIDs — Overkill for seed data, would change URL patterns (`/prompt/550e8400-...`), slower indexing
- Text primary keys — No benefit over integers; loses ordering and auto-increment

## R-003: Seller Data Modeling

**Decision**: Embed seller fields directly as columns on the `prompts` table (`seller_name`, `seller_avatar`, `seller_rating`). No separate sellers table in this phase.

**Rationale**: The spec assumption states "Seller data is embedded within prompts for now." This matches the current mock data structure where seller is a nested object `{ name, avatar, rating }`. Embedding as flat columns (not JSONB) allows SQL filtering/indexing on seller fields and is easy to query with Drizzle. The API layer will reconstruct the nested `seller` object in responses. A separate `sellers` table with Clerk user integration is explicitly deferred to a future feature.

**Alternatives considered**:
- JSONB column — Harder to query/index individual seller fields
- Separate `sellers` table with FK — Over-engineers this phase; spec explicitly defers it

## R-004: Tags Storage

**Decision**: Use PostgreSQL native text array column (`text('tags').array()`).

**Rationale**: PostgreSQL text arrays are natively supported by Drizzle ORM via `.array()`. They support the `ANY` and `@>` operators needed for search/filter. The current mock data stores tags as `string[]`, so the mapping is direct. For the current search requirement (substring matching across tags), we can use `array_to_string()` with `ILIKE` or iterate with `EXISTS`/`ANY`.

**Alternatives considered**:
- JSONB array — Loses native array operators; requires casting for comparisons
- Separate `prompt_tags` join table — Over-normalized for the current use case; adds JOIN complexity

## R-005: Samples Storage

**Decision**: Use PostgreSQL native text array column (`text('samples').array()`), same as tags.

**Rationale**: Samples are simple string arrays with no relational needs. Native array storage matches the mock data structure directly.

## R-006: Search Implementation

**Decision**: Use `ILIKE` with `%query%` pattern across title, titleEn, description, descriptionEn columns. For tags, use `array_to_string(tags, ' ') ILIKE %query%`.

**Rationale**: The current search uses JavaScript `.includes()` which is case-insensitive substring matching. `ILIKE` provides identical behavior in PostgreSQL. For 8 seed records (and even hundreds), `ILIKE` performs well without indexes. Full-text search (`tsvector`/`tsquery`) or `pg_trgm` would be premature optimization.

**Alternatives considered**:
- `pg_trgm` trigram index — Better for fuzzy matching but unnecessary at current scale
- Full-text search with `tsvector` — Powerful but complex to set up for bilingual (Arabic + English) content; deferred to future

## R-007: RLS Policy Strategy

**Decision**: Enable RLS on all tables. Add a single `SELECT` policy per table allowing anonymous (public) read access. No `INSERT`/`UPDATE`/`DELETE` policies for anonymous users. Apply via Supabase MCP `apply_migration` tool, not Drizzle.

**Rationale**: The constitution mandates RLS on all user tables and specifies that "RLS policies are NOT managed by Drizzle. RLS MUST be applied separately using Supabase MCP." The spec requires public read access for marketplace browsing and denied writes for anonymous users. Since there are no authenticated write operations in this phase, only `SELECT` policies are needed.

**Alternatives considered**:
- Skip RLS — Violates constitution principle IV
- Role-based policies (authenticated/service_role) — Not needed until write operations are added

## R-008: Seeding Strategy

**Decision**: Create a TypeScript seed script (`src/db/seed.ts`) that uses the Drizzle client to insert all mock data. Run via `npx tsx src/db/seed.ts`. The script will be idempotent — truncate tables before inserting to allow re-running.

**Rationale**: Using the Drizzle client for seeding ensures type safety and validates the schema. Running via `tsx` allows direct TypeScript execution without a build step. Idempotent seeding (truncate + insert) allows safe re-runs during development.

**Alternatives considered**:
- Raw SQL seed file — Loses type safety; harder to maintain in sync with schema
- Supabase MCP `execute_sql` — Works but loses Drizzle type checking; better for ad-hoc queries
- Drizzle migration with seed data — Seed data shouldn't be in migrations (data vs schema concern)

## R-009: Review-Prompt Assignment

**Decision**: All 3 seed reviews will be assigned to prompt ID 1 (the marketing content writer prompt). This prompt already has `reviews: 124` in its mock data, making it the natural candidate for having reviews displayed.

**Rationale**: The current mock implementation returns all reviews regardless of prompt ID (a bug). FR-013 requires reviews to be linked to specific prompts. Assigning all 3 reviews to prompt 1 is the simplest approach that demonstrates the correct behavior. Future phases will add real user reviews distributed across prompts.

**Alternatives considered**:
- Distribute reviews across multiple prompts — More realistic but arbitrary; no user-facing benefit with 3 reviews
- Leave reviews unlinked — Violates FR-013

## R-010: Drizzle Configuration

**Decision**: Create `drizzle.config.ts` at repo root with schema path `src/db/schema`, output to `drizzle/` directory, dialect `postgresql`, and connection string from `DATABASE_URL` env var.

**Rationale**: This follows the constitution's specification exactly: "Schema files in `src/db/schema/`. Migrations output: `drizzle/`. Client init: `src/db/index.ts`." The `drizzle.config.ts` file is required by drizzle-kit for `generate` and `migrate` commands.

## R-011: Zod Schema Updates

**Decision**: Keep existing Zod schemas in `src/lib/schemas/api.ts` unchanged. They already define the correct API response shapes. Add a `promptId` field to the `reviewSchema`. Types from Drizzle (`$inferSelect`/`$inferInsert`) are used internally in the data layer; Zod types remain the API contract.

**Rationale**: The constitution mandates Zod as the single source of truth for API boundaries. Drizzle types are for the ORM layer. The two coexist: Drizzle types for DB operations, Zod types for API validation. The API routes will map Drizzle query results to the Zod-validated response shapes.

## R-012: Admin Role and Access Control

**Decision**: Admin role is identified via Clerk `publicMetadata.role === "admin"`. No admin table in the database. RLS policies on the `prompts` table enforce INSERT/UPDATE/DELETE only for authenticated users with admin role, using the JWT claim `(auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin'`. The seller page (`/seller`) is already auth-gated by Clerk middleware in `src/proxy.ts` (not in public routes list).

**Rationale**: The Clerk JWT includes `publicMetadata` claims that Supabase can read via `auth.jwt()`. This avoids duplicating role storage in the database. The Drizzle client uses the `postgres` (service) role which bypasses RLS — so RLS serves as defense-in-depth for any direct Supabase client SDK access. Primary access control for the seller upload flow is enforced at the API route handler level (Clerk auth check).

**Alternatives considered**:
- Admin table in database — Unnecessary duplication of Clerk's role management; adds sync complexity
- RLS-only access control — Insufficient since Drizzle bypasses RLS; API route-level checks are the primary guard

## R-013: Price Unit Strategy

**Decision**: Store `price` as `real` (display currency, e.g., 49.99) to match the current mock data format. This is an accepted deviation from the constitution's Stripe principle (smallest currency unit) because this migration preserves mock data parity. Conversion to smallest currency unit (cents) will be done in the Stripe payments feature.

**Rationale**: The mock data stores prices as display values (e.g., `49.99`, `79.99`). Converting to cents during this infrastructure migration would change API response values and require frontend updates, which violates the "zero UI regression" goal. The Stripe feature will handle the conversion when payment processing is added.
