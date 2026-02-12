# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PromptSouq is an Arabic-first marketplace for AI prompts built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Features RTL layout, dark/light themes, and Clerk authentication.

The project constitution at `.specify/memory/constitution.md` (v1.3.0) is the authoritative source for all development principles. This file summarizes what you need to operate in the codebase.

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

**After every completed task**, run `npm run lint && npm run build` and fix all errors before proceeding.

### Database (Drizzle)

```bash
npx drizzle-kit generate   # Generate migrations from schema changes
npx drizzle-kit migrate    # Apply pending migrations
npx drizzle-kit studio     # Visual DB browser (optional)
```

Schema files: `src/db/schema/`. Migrations output: `drizzle/`. Client init: `src/db/index.ts`.

## Mandatory Stack

| Concern | Technology | Notes |
|---------|-----------|-------|
| Backend data | Supabase (Postgres) | RLS on all user tables; RLS applied via Supabase MCP (not Drizzle) |
| ORM / Migrations | Drizzle ORM + drizzle-kit | Schema in `src/db/schema/`; never write migration SQL by hand |
| Payments | Stripe | Server-side only (API Route Handlers); verify webhook signatures |
| Validation | Zod 4.x | Single source of truth; infer types via `z.infer<>` |
| Forms | React Hook Form + `zodResolver` | No manual `useState` per field; use shadcn `<Form>` wrapper |
| E2E tests | Playwright | Tests in `tests/` or `e2e/`; cover mobile + desktop viewports |
| Package manager | npm | Do not use yarn, pnpm, or bun |

## Architecture

### Routing & Layout

- **Next.js 16 App Router** in `src/app/`
- Root layout (`src/app/layout.tsx`) wraps: `ClerkProvider` > `ThemeProvider` > `Header` > `Suspense` > children > `Footer`
- HTML root is `<html lang="ar" dir="rtl">` — all UI text is primarily Arabic
- Route group `(auth)` for sign-in/sign-up pages (no shared layout)
- Catch-all routes `[[...sign-in]]` and `[[...sign-up]]` for Clerk page routing
- Path alias: `@/*` -> `src/*` (single alias covers everything)

### Server Components & Data Flow — No Server Actions

- **Server actions are prohibited.** All client-to-server mutations go through Next.js API Route Handlers in `src/app/api/`.
- Server Components fetch from Supabase directly. Client Components call API routes via `fetch()`.
- Use `"use client"` only at the narrowest boundary needed.

### Authentication (Clerk)

- Custom sign-in/sign-up pages in `src/app/(auth)/` (not Clerk's hosted UI)
- OAuth: Google and Facebook via `authenticateWithRedirect()` with SSO callback pages
- Email/password with optional email code 2FA
- **Route protection** in `src/proxy.ts` (not `middleware.ts`) — Clerk middleware with public route matcher. Public routes: `/`, `/market`, `/search`, `/prompt`, `/sign-in`, `/sign-up`
- Always check `isLoaded` before accessing Clerk hooks

### Styling & UI

- **Tailwind CSS v4** with CSS variables in `src/app/globals.css`
- **shadcn/ui** (New York style) — add components: `npx shadcn@latest add <component>`
- Icons from **Lucide React** only; classes merged with `cn()` from `@/lib/utils`
- Theme colors via CSS variables — no hardcoded hex/rgb

### Database & Migrations (Drizzle + Supabase)

- Drizzle schema files in `src/db/schema/` define tables via `pgTable()`
- Barrel export all tables from `src/db/schema/index.ts`
- Drizzle client initialized in `src/db/index.ts` with Supabase connection string
- Types inferred from Drizzle: `$inferSelect`, `$inferInsert`
- RLS policies managed separately via Supabase MCP — Drizzle does not handle RLS
- After schema changes, run `get_advisors(type: "security")` to check for RLS gaps

### Validation & Forms Pattern

- Zod schemas in `src/lib/schemas/` or co-located `schemas.ts` next to routes
- Types inferred from schemas: `z.infer<typeof mySchema>` — no duplicate interfaces
- Forms use `useForm<z.infer<typeof schema>>()` with `zodResolver(schema)`
- API error responses return `z.ZodError.flatten()` for field-level display
- Arabic error messages defined via `.message()` on schema fields

### Page States (Required)

- Every async route needs a co-located `loading.tsx` (skeleton or spinner)
- App root needs `not-found.tsx` (branded Arabic 404) and `error.tsx` (client component with retry)
- Dynamic routes (e.g., `prompt/[id]`) must call `notFound()` when resource missing
- No blank screens during page transitions

### Data Layer (Current State)

- Currently uses **mock data** in `src/data/mockData.ts`
- Interfaces: `Prompt` (bilingual title/description, seller, tags, difficulty), `Category`
- Difficulty values are Arabic strings: `"مبتدئ"` / `"متقدم"`
- Will migrate to Drizzle schema + Supabase per constitution

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
DATABASE_URL=                    # Supabase Postgres connection string (for Drizzle)
```

Future additions: Supabase anon key, Stripe publishable/secret keys.

## Development Workflow

1. **Schema first** — Drizzle table schemas in `src/db/schema/`; generate + apply migrations
2. **Types second** — Drizzle `$inferSelect`/`$inferInsert`; Zod schemas for API boundaries
3. **API routes third** — `src/app/api/` with Zod validation; no server actions
4. **UI last** — Mobile-first; React Hook Form + zodResolver for forms
5. **Verify** — `npm run lint && npm run build` after every task
6. **Test** — Playwright E2E after user-facing changes

## Active Technologies
- TypeScript 5.x (strict mode) + Next.js 16.x (App Router), React 19.x, Zod 4.x (001-api-mock-data)
- In-memory mock data arrays (no database this phase) (001-api-mock-data)
- TypeScript 5.x (strict mode), Node.js 18+ + Next.js 16.x (App Router), React 19.x, Drizzle ORM (new), postgres.js (new), drizzle-kit (new, dev), Zod 4.x (002-supabase-db-migration)
- Supabase Postgres 17.x (project: `dyaflmsawxpqgmyojtbc`, region: eu-central-1) via connection pooler (transaction mode) (002-supabase-db-migration)

## Recent Changes
- 001-api-mock-data: Added TypeScript 5.x (strict mode) + Next.js 16.x (App Router), React 19.x, Zod 4.x
