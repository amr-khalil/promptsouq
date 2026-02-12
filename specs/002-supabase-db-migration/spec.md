# Feature Specification: Supabase Database Migration

**Feature Branch**: `002-supabase-db-migration`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Build Supabase database, migrate mock data via Drizzle, connect APIs to real database, delete mockData.ts, make app functional with Supabase"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and View Prompts from Persistent Storage (Priority: P1)

A visitor opens the PromptSouq marketplace and browses prompts, categories, and prompt details. All data is served from a persistent database rather than in-memory arrays. The browsing experience (filtering by category, AI model, price range, sorting) works identically to the current experience, but data survives server restarts and can be managed independently of code deployments.

**Why this priority**: This is the core value — without persistent storage, the marketplace cannot grow beyond hardcoded data. Every other feature (payments, user-generated content, seller dashboards) depends on a real database.

**Independent Test**: Can be fully tested by navigating to the homepage, marketplace, and prompt detail pages and verifying all prompts, categories, testimonials, and reviews render correctly with data sourced from the database.

**Acceptance Scenarios**:

1. **Given** the database is seeded with the existing mock data, **When** a visitor loads the homepage, **Then** they see trending prompts, categories, and testimonials — all sourced from the database.
2. **Given** the database contains 8 prompts across 8 categories, **When** a visitor applies category filters on the marketplace page, **Then** only prompts matching the selected categories appear.
3. **Given** a prompt exists in the database, **When** a visitor navigates to `/prompt/[id]`, **Then** they see the full prompt detail including seller info, reviews, and related prompts.
4. **Given** the application server is restarted, **When** a visitor loads any page, **Then** all data is still present and identical to before the restart.

---

### User Story 2 - Search Prompts from Database (Priority: P2)

A visitor searches for prompts using the search functionality. Search queries are executed against the database, supporting the same fields (title, titleEn, description, descriptionEn, tags) as the current in-memory search.

**Why this priority**: Search is a primary discovery mechanism. It must work against the database to support future growth when hundreds or thousands of prompts exist.

**Independent Test**: Can be tested by entering search terms in the search bar and verifying results match prompts in the database by title, description, or tags.

**Acceptance Scenarios**:

1. **Given** the database contains prompts with Arabic and English titles, **When** a visitor searches for "تسويق" (marketing), **Then** prompts with matching titles, descriptions, or tags are returned.
2. **Given** the database contains prompts, **When** a visitor searches for a term that matches no prompts, **Then** an empty result set is returned with appropriate messaging.

---

### User Story 3 - Data Integrity and Security (Priority: P3)

All database tables enforce row-level security (RLS) so that data access is controlled at the database level. Public read access is allowed for marketplace browsing (prompts, categories, reviews, testimonials). Write operations on the prompts table (insert, update, delete) are restricted to authenticated admin users only. The admin role is identified via Clerk `publicMetadata.role === "admin"`. The seller page (`/seller`) is only accessible to logged-in users (already enforced by Clerk middleware).

**Why this priority**: Security is foundational. The database must enforce access controls before any write operations are added. Only the admin should be able to upload prompts through the seller page.

**Independent Test**: Can be tested by verifying that (1) anonymous connections can read marketplace data but cannot write, and (2) authenticated admin users can insert/update/delete prompts via the `authenticated` role with proper JWT claims.

**Acceptance Scenarios**:

1. **Given** RLS is enabled on all tables, **When** an anonymous user queries the database, **Then** they can read prompts, categories, reviews, and testimonials.
2. **Given** RLS is enabled on all tables, **When** an anonymous user attempts to insert or delete data, **Then** the operation is denied.
3. **Given** RLS is enabled on the prompts table, **When** an authenticated user with admin role attempts to insert a prompt, **Then** the operation is allowed.
4. **Given** the seller page exists at `/seller`, **When** an unauthenticated user tries to access it, **Then** they are redirected to sign-in (Clerk middleware).

---

### User Story 4 - Seed Data Matches Current Experience (Priority: P1)

The database is seeded with all data currently in `mockData.ts` — 8 prompts, 8 categories, 3 testimonials, and 3 reviews — so the user experience is identical before and after migration. No data is lost in the transition.

**Why this priority**: Users must not notice any regression. The migration is an infrastructure change, not a UX change.

**Independent Test**: Can be tested by comparing every field of every record in the database against the original mock data file and verifying 1:1 correspondence.

**Acceptance Scenarios**:

1. **Given** the seed script has run, **When** querying all prompts, **Then** exactly 8 prompts are returned with titles, prices, ratings, and all other fields matching the original mock data.
2. **Given** the seed script has run, **When** querying all categories, **Then** exactly 8 categories are returned with names, icons, and counts matching the original mock data.
3. **Given** the seed script has run, **When** querying reviews and testimonials, **Then** 3 reviews and 3 testimonials are returned matching the original mock data.

---

### Edge Cases

- What happens when the database connection is unavailable? API routes should return appropriate error responses (not crash or show blank pages).
- What happens when a prompt ID is requested that doesn't exist in the database? The system returns a 404 response, and the prompt detail page shows the not-found page.
- What happens when filter/sort parameters are invalid? Zod validation catches them and returns structured Arabic error messages, same as today.
- What happens when the database is empty (no seed data)? Pages render gracefully with empty states rather than errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store all prompt data (title, titleEn, description, descriptionEn, price, category, aiModel, rating, reviews count, sales count, thumbnail, tags, difficulty, samples, fullContent) in a persistent database.
- **FR-002**: System MUST store seller information (name, avatar, rating) linked to prompts.
- **FR-003**: System MUST store category data (id, name, nameEn, icon, count) in a persistent database.
- **FR-004**: System MUST store review data (userName, userAvatar, rating, date, comment) linked to specific prompts.
- **FR-005**: System MUST store testimonial data (name, role, content, avatar, rating) in a persistent database.
- **FR-006**: All existing API routes (`/api/prompts`, `/api/prompts/[id]`, `/api/prompts/[id]/reviews`, `/api/prompts/[id]/related`, `/api/prompts/search`, `/api/categories`, `/api/testimonials`) MUST return the same response shape and data as they do today, sourced from the database instead of in-memory arrays.
- **FR-007**: System MUST support the same query parameters for filtering and sorting: category (comma-separated), aiModel (comma-separated), priceMin, priceMax, sortBy (bestselling, newest, rating, price-low, price-high), and limit.
- **FR-008**: System MUST support text search across title, titleEn, description, descriptionEn, and tags fields.
- **FR-009**: System MUST enforce row-level security on all tables, allowing public read access for marketplace data. Write operations (INSERT, UPDATE, DELETE) on the prompts table MUST be restricted to authenticated users with admin role (identified via Clerk JWT `publicMetadata.role`).
- **FR-014**: The admin role MUST be identified via Clerk `publicMetadata.role === "admin"`. The seller page (`/seller`) MUST only be accessible to authenticated users (enforced by existing Clerk middleware in `src/proxy.ts`).
- **FR-010**: System MUST include a data seeding mechanism that populates the database with all current mock data (8 prompts, 8 categories, 3 reviews, 3 testimonials).
- **FR-011**: The static mock data file (`src/data/mockData.ts`) MUST be removed after migration is complete and verified.
- **FR-012**: System MUST return appropriate error responses when the database is unreachable, preserving the existing error response format.
- **FR-013**: Reviews MUST be linked to specific prompts (the current implementation returns all reviews regardless of prompt ID — this must be corrected).

### Key Entities

- **Prompt**: The core marketplace item. Bilingual title and description, pricing, category association, AI model type, engagement metrics (rating, reviews count, sales), visual thumbnail, difficulty level (Arabic enum), sample outputs, and optional full content. Each prompt belongs to one seller.
- **Seller**: A prompt creator with name, avatar, and aggregate rating. One seller can have many prompts.
- **Category**: A classification for prompts (e.g., ChatGPT, Midjourney, Marketing). Has bilingual name, icon identifier, and prompt count.
- **Review**: User feedback on a specific prompt. Includes reviewer name, avatar, rating, date, and Arabic comment text.
- **Testimonial**: Platform-level endorsement from a user. Includes name, professional role, content, avatar, and rating. Not linked to a specific prompt.

## Assumptions

- The existing Supabase project is already provisioned and the `DATABASE_URL` environment variable is configured.
- Public read access for all marketplace data is acceptable at this stage (no user-specific data restrictions needed yet).
- The `count` field on categories represents a static count that will be seeded, not a live computed count (live computation will be a future enhancement).
- Seller data is embedded within prompts for now (matching current mock structure) — a separate users/sellers table with Clerk integration will be a future feature.
- Admin role is managed via Clerk `publicMetadata.role` — no admin table needed in the database. The Clerk dashboard is used to assign admin role to users.
- The seller page (`/seller`) is already auth-gated by Clerk middleware in `src/proxy.ts` (it is not in the public routes list). No additional route protection is needed.
- The difficulty enum values remain Arabic strings (`"مبتدئ"` / `"متقدم"`).
- The reviews-to-prompt relationship is a new correction (current mock implementation returns all reviews for any prompt).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 7 existing API endpoints return identical response shapes and data after migration, with zero regressions in the UI.
- **SC-002**: All marketplace pages (home, market, prompt detail, search) render correctly with database-sourced data, matching the current visual output.
- **SC-003**: Data persists across application restarts — verified by restarting the dev server and confirming all data is still present.
- **SC-004**: The static mock data file is fully removed with no remaining imports or references in the codebase.
- **SC-005**: Row-level security is enabled on all database tables, with public read access verified, unauthorized anonymous write access denied, and authenticated admin write access to the prompts table verified.
- **SC-006**: The application builds and lints without errors (`npm run lint && npm run build` passes).
- **SC-007**: Database contains exactly 8 prompts, 8 categories, 3 reviews, and 3 testimonials after seeding, matching the original mock data 1:1.
