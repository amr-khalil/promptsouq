<!--
=== Sync Impact Report ===
Version change: 1.2.0 → 1.3.0
Modified principles:
  - IV. Supabase as Data Layer — migration workflow changed from
    Supabase MCP apply_migration to Drizzle ORM schema + drizzle-kit
Modified sections:
  - Technology Stack — added Drizzle ORM + drizzle-kit
  - Development Workflow — updated schema-first step to reference
    Drizzle schema files and drizzle-kit commands
Added principles: (none)
Removed sections: (none)
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ no changes needed (generic)
  - .specify/templates/spec-template.md — ✅ no changes needed (generic)
  - .specify/templates/tasks-template.md — ✅ no changes needed (generic)
  - .specify/templates/agent-file-template.md — ✅ no changes needed (generic)
  - CLAUDE.md — ⚠ pending (update Supabase migration references)
Follow-up TODOs: (none)
-->

# PromptSouq Constitution

## Core Principles

### I. Arabic-First & RTL

- All user-facing text MUST be in Arabic as the primary language.
  English is permitted only as a secondary fallback or for
  technical identifiers (model names, brand names).
- The root HTML element MUST set `lang="ar"` and `dir="rtl"`.
- Layout, spacing, and icon placement MUST account for RTL
  reading direction. Use logical CSS properties (`margin-inline-start`)
  or Tailwind RTL utilities where applicable.
- Form inputs, error messages, and toast notifications MUST
  display Arabic text.

### II. Mobile-First Responsive Design

- Every page and component MUST be designed mobile-first.
  Desktop layout is an enhancement, not the baseline.
- Breakpoints MUST follow Tailwind's default scale
  (`sm`, `md`, `lg`, `xl`, `2xl`). Target `< 640px` as the
  primary viewport.
- Touch targets MUST be at least 44x44px. Navigation MUST
  be usable with one thumb on mobile.
- All interactive flows (browse, search, purchase, auth) MUST
  be fully functional on mobile viewports without horizontal
  scrolling.

### III. Server Components by Default — No Server Actions

- All components MUST be React Server Components unless they
  require browser APIs, event handlers, or React hooks.
- The `"use client"` directive MUST only appear at the narrowest
  boundary needed — push it as deep in the component tree as
  possible.
- **Server actions are PROHIBITED.** All client-to-server
  mutations and data fetching from Client Components MUST go
  through Next.js API Route Handlers in `src/app/api/`.
- Data fetching in Server Components MUST call Supabase
  directly or use internal helper functions — not API routes.
  Client Components MUST call API Route Handlers via `fetch()`
  and receive data as JSON.
- Dynamic imports and `Suspense` boundaries MUST be used for
  heavy client-side components to avoid blocking page load.

### IV. Supabase as Data Layer with Drizzle Migrations

- All persistent data MUST be stored in Supabase Postgres.
- Database schemas MUST be defined in TypeScript using
  Drizzle ORM table definitions in `src/db/schema/`. Each
  schema file exports table definitions using `pgTable()`.
  A barrel export in `src/db/schema/index.ts` MUST re-export
  all tables.
- Migrations MUST be generated via `npx drizzle-kit generate`
  and applied via `npx drizzle-kit migrate`. Never write
  migration SQL by hand — always modify the Drizzle schema
  and regenerate. Migration files live in `drizzle/` at the
  repository root.
- The Drizzle client instance MUST be initialized in
  `src/db/index.ts` using `drizzle()` with the Supabase
  Postgres connection string from environment variables.
- Row Level Security (RLS) policies are NOT managed by
  Drizzle. RLS MUST be applied separately using Supabase MCP
  `apply_migration` or the Supabase dashboard. After any
  schema change, run `get_advisors(type: "security")` to
  verify no RLS gaps.
- Supabase MCP tools remain available for data queries
  (`execute_sql`), security advisors, and RLS policy
  management. Supabase Edge Functions MAY be used for
  server-side logic that cannot run in Next.js Route Handlers.

### V. Stripe for Payments

- All payment processing MUST go through Stripe. No other
  payment gateway is permitted.
- Sensitive Stripe operations (creating charges, managing
  subscriptions) MUST happen server-side in Next.js API Route
  Handlers or Supabase Edge Functions — never in client code.
- Webhook endpoints MUST verify Stripe signatures before
  processing events.
- Price display MUST use the currency and format appropriate
  for the target market. Prices stored in the database MUST
  be in the smallest currency unit (e.g., cents/halalas).

### VI. Component-Driven UI (shadcn/ui)

- UI MUST be built using shadcn/ui components from
  `src/components/ui/`. New shadcn components are added via
  `npx shadcn@latest add <component>`.
- Custom components MUST compose shadcn primitives rather than
  reimplementing from scratch. Use Radix UI for accessibility.
- Icons MUST come from Lucide React. Do not introduce
  additional icon libraries.
- Tailwind classes MUST be merged using the `cn()` utility
  from `@/lib/utils`. Inline styles are prohibited except
  for truly dynamic values (e.g., computed positions).
- Theme colors MUST reference CSS variables defined in
  `src/app/globals.css` — no hardcoded hex/rgb values.

### VII. Playwright E2E Testing

- Critical user journeys MUST have Playwright end-to-end tests:
  browsing prompts, search, authentication, purchase flow.
- Tests MUST run against a local dev server or preview
  deployment. Tests MUST NOT depend on production data.
- Tests MUST cover both mobile and desktop viewports.
- Visual regression snapshots SHOULD be used for key pages
  to catch unintended layout shifts.
- Test files live in a top-level `tests/` or `e2e/` directory,
  organized by user flow.

### VIII. Zod Schema Validation

- All data crossing a trust boundary MUST be validated with
  Zod schemas. Trust boundaries include: API Route Handler
  request bodies, URL search params, external API responses,
  and Stripe webhook payloads.
- TypeScript types for validated data MUST be inferred from
  Zod schemas using `z.infer<typeof schema>` — never
  hand-written interfaces that duplicate a schema definition.
- Zod schemas MUST be the single source of truth. If a type
  and a schema exist for the same data shape, the type MUST
  be derived from the schema, not the other way around.
- Shared schemas (used by both API routes and client code)
  MUST live in `src/lib/schemas/` or a co-located
  `schemas.ts` file next to the route. Do not scatter
  validation logic inside component files.
- Error responses from API Route Handlers MUST return
  structured Zod validation errors (using `z.ZodError`
  `.flatten()` or `.format()`) so the client can display
  field-level error messages.

### IX. React Hook Form with zodResolver

- All forms MUST use React Hook Form (`useForm()`) for state
  management, submission handling, and field registration.
  Manual `useState` per field or uncontrolled forms without
  React Hook Form are prohibited.
- Zod schemas MUST be connected to forms via `zodResolver`
  from `@hookform/resolvers/zod`. The resolver provides
  automatic validation and static type inference for
  form values — do not validate manually in `onSubmit`.
- Form field types MUST be inferred from the Zod schema
  passed to `zodResolver`. Use `z.infer<typeof schema>`
  as the generic parameter to `useForm<>()`.
- Field-level errors from Zod MUST be displayed inline next
  to the corresponding input using React Hook Form's
  `formState.errors` object. Arabic error messages MUST be
  defined in the Zod schema via `.message()` or a custom
  error map.
- For complex forms with shadcn/ui, use the `<Form>` wrapper
  component from `src/components/ui/form.tsx` which
  integrates React Hook Form context with shadcn form fields.

### X. Page Loading & Error States

- Every route segment that performs async data fetching MUST
  have a co-located `loading.tsx` file that renders a
  skeleton placeholder or spinner. Use shadcn `Skeleton`
  components to match the page layout shape.
- A custom `not-found.tsx` MUST exist at the app root
  (`src/app/not-found.tsx`) to provide a branded Arabic 404
  page. Route segments with dynamic params (e.g.,
  `prompt/[id]`) MUST call `notFound()` from `next/navigation`
  when the resource does not exist.
- An `error.tsx` boundary MUST exist at the app root
  (`src/app/error.tsx`) as a catch-all for unhandled runtime
  errors. It MUST be a Client Component (`"use client"`) and
  MUST display a user-friendly Arabic error message with a
  retry button.
- Loading states MUST NOT show a blank white/black screen.
  Every page transition MUST display either a skeleton, a
  spinner, or a meaningful loading indicator.

## Technology Stack

The following stack is mandatory for PromptSouq. Deviations
require a constitution amendment.

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (New York) | latest |
| Auth | Clerk (@clerk/nextjs) | 6.x |
| Database | Supabase (Postgres) | via MCP |
| ORM / Migrations | Drizzle ORM + drizzle-kit | latest |
| Payments | Stripe | latest |
| Validation | Zod | 4.x |
| Forms | React Hook Form + @hookform/resolvers | 7.x |
| E2E Testing | Playwright | latest |
| Icons | Lucide React | latest |
| Theming | next-themes | latest |

**Path alias**: `@/*` → `src/*` (single alias covers all imports).

**Package manager**: npm. Do not use yarn, pnpm, or bun.

## Development Workflow

1. **Schema first**: Define or update Drizzle table schemas in
   `src/db/schema/`. Generate migrations with
   `npx drizzle-kit generate` and apply with
   `npx drizzle-kit migrate`. Apply RLS policies separately
   via Supabase MCP `apply_migration`.
2. **Types second**: Drizzle infers TypeScript types from
   schema definitions (`$inferSelect`, `$inferInsert`).
   Define Zod schemas for API boundaries; infer TS types
   from them via `z.infer<>`.
3. **API routes third**: Implement Next.js API Route Handlers
   in `src/app/api/` with Zod request validation. Do not use
   server actions.
4. **UI last**: Build pages and components consuming the API
   layer, mobile-first. Use React Hook Form with zodResolver
   for all form interfaces.
5. **Verify after every task**: After completing each task,
   MUST run `npm run lint` and `npm run build` to confirm
   zero errors. Do not proceed to the next task if either
   command fails — fix all issues first.
6. **Test continuously**: Run Playwright tests after each
   user-facing change.

**Branching**: Feature branches off `main`. PRs MUST pass
lint, build, and Playwright tests before merge.

**Environment variables**: Secrets (Clerk keys, Stripe keys,
Supabase connection string) MUST be in `.env.local` and MUST
NOT be committed. Use `NEXT_PUBLIC_` prefix only for values
safe to expose to the browser.

## Governance

- This constitution supersedes all other development
  practices in the repository. Conflicts MUST be resolved
  in favor of constitution principles.
- Amendments require: (1) a written proposal describing the
  change and rationale, (2) review of impact on existing
  code, (3) update to this document with version bump.
- Version follows semantic versioning:
  - MAJOR: Principle removed or redefined incompatibly.
  - MINOR: New principle or section added.
  - PATCH: Clarifications and wording fixes.
- Compliance reviews SHOULD occur at the start of each
  new feature specification (via the Constitution Check
  gate in plan-template.md).
- Runtime development guidance lives in `CLAUDE.md` at
  the repository root.

**Version**: 1.3.0 | **Ratified**: 2026-02-11 | **Last Amended**: 2026-02-11
