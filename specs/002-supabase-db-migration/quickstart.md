# Quickstart: Supabase Database Migration

**Feature**: 002-supabase-db-migration
**Date**: 2026-02-12

## Prerequisites

- Node.js 18+ and npm
- Active Supabase project (PromptSouq — `dyaflmsawxpqgmyojtbc`)
- `DATABASE_URL` set in `.env.local` (Supabase pooler connection string, transaction mode, port 6543)

## Setup Steps

### 1. Install Dependencies

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit dotenv
```

### 2. Create Drizzle Config

Create `drizzle.config.ts` at repo root:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 3. Create Drizzle Client

Create `src/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

### 4. Define Schema

Create schema files in `src/db/schema/`:
- `categories.ts` — categories table
- `prompts.ts` — prompts table with embedded seller fields
- `reviews.ts` — reviews table with prompt_id FK
- `testimonials.ts` — testimonials table
- `index.ts` — barrel export

### 5. Generate & Apply Migrations

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 6. Apply RLS Policies

Use Supabase MCP `apply_migration` to enable RLS and add SELECT policies for anon role on all 4 tables.

### 7. Seed Data

```bash
npx tsx src/db/seed.ts
```

### 8. Update API Routes

Replace all `import { prompts } from "@/data/mockData"` with Drizzle queries via `db` client. Map snake_case DB columns to camelCase API responses.

### 9. Remove Mock Data

Delete `src/data/mockData.ts` and remove the `src/data/` directory.

### 10. Verify

```bash
npm run lint && npm run build
```

## Key Files

| File | Purpose |
|------|---------|
| `drizzle.config.ts` | Drizzle-kit configuration |
| `src/db/index.ts` | Drizzle client initialization |
| `src/db/schema/categories.ts` | Categories table definition |
| `src/db/schema/prompts.ts` | Prompts table definition |
| `src/db/schema/reviews.ts` | Reviews table definition |
| `src/db/schema/testimonials.ts` | Testimonials table definition |
| `src/db/schema/index.ts` | Barrel export for all schemas |
| `src/db/seed.ts` | Seed script with mock data |
| `drizzle/` | Generated migration SQL files |

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=postgresql://postgres.dyaflmsawxpqgmyojtbc:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Use the Supabase pooler connection string (transaction mode, port 6543) with `prepare: false` in the postgres.js client.
