# Research: Sell Form Enhancement

**Feature**: 013-sell-form-enhancement
**Date**: 2026-02-18

## R1: Supabase Storage Upload Strategy (Clerk Auth Compatibility)

**Decision**: Server-side upload via API Route Handler using Supabase service role key.

**Rationale**: The project uses Clerk for authentication, not Supabase Auth. Supabase Storage RLS policies are tied to Supabase Auth (`auth.uid()`), which is unavailable in this context. A server-side proxy route allows us to:
1. Validate Clerk auth before accepting uploads
2. Use the Supabase service role key (bypasses Storage RLS)
3. Enforce file size/MIME validation server-side via Zod
4. Keep the service role key server-only (never exposed to browser)

**Alternatives considered**:
- **Client-side upload with Supabase JS + publishable key**: Rejected because Storage RLS can't verify Clerk users. Would allow unauthenticated uploads.
- **Client-side upload with custom JWT**: Rejected because it requires setting up Supabase Auth JWT verification with Clerk, adding unnecessary complexity.
- **Supabase Edge Function as upload proxy**: Rejected because the project already uses Next.js API routes for all mutations (constitution principle III).

## R2: Upload Progress Tracking

**Decision**: Use `XMLHttpRequest` with `upload.onprogress` event from the client when posting FormData to the API route.

**Rationale**: The bulk of the transfer time is client → API route (the file data crosses the internet). The API route → Supabase Storage transfer happens within the data center and is near-instantaneous. Tracking the client → server upload gives an accurate progress indicator.

**Alternatives considered**:
- **Fetch API with ReadableStream**: Rejected because `fetch()` does not natively support upload progress in most browsers.
- **tus protocol (resumable uploads)**: Rejected as over-engineered for 10 MB max files.
- **Indeterminate spinner**: Rejected because the spec explicitly requires a progress indicator (FR-011).

## R3: Draft Persistence Storage Mechanism

**Decision**: Use `localStorage` with key `promptsouq-sell-draft`. Store JSON-serialized form state including current step number.

**Rationale**: Clarified in spec that drafts must survive tab closes and browser restarts. `localStorage` is the simplest browser API that provides this persistence. The existing implementation uses `sessionStorage` which only survives within the same tab.

**Implementation notes**:
- Save on every step transition (Next/Back click) — not on every keystroke
- Save the current step number alongside form data
- Restore on page load: parse JSON, populate React Hook Form via `reset()`, set step state
- Clear after successful submission or "Sell Another" click
- Graceful degradation: if `localStorage` is unavailable (e.g., private browsing quota exceeded), the form works without persistence

**Alternatives considered**:
- **sessionStorage**: Rejected because it doesn't survive tab close (spec requirement).
- **IndexedDB**: Rejected as over-engineered for a single JSON object (~5 KB).
- **Server-side draft storage**: Rejected as out of scope and adds unnecessary API complexity.

## R4: Supabase Storage Bucket Configuration

**Decision**: Create a public bucket named `prompt-images` with 10 MB file size limit and restricted MIME types.

**Rationale**: Images need public URLs for marketplace display (clarified in spec). The bucket-level constraints enforce the 10 MB limit and MIME type validation as a second defense layer beyond API route validation.

**Bucket specification**:
- **Name**: `prompt-images`
- **Public**: Yes (public read access via URL)
- **File size limit**: 10,485,760 bytes (10 MB)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Storage path pattern**: `{userId}/{timestamp}-{randomId}.{ext}` (prevents filename collisions, organizes by seller)

**RLS policies**: Not needed — uploads use service role key (bypasses RLS). Public read is handled by the `public: true` bucket setting.

## R5: Step Reorder Architecture

**Decision**: Reorder steps to Payment (1) → Details (2) → Content (3), with conditional skipping of Step 1 for payment-activated sellers.

**Rationale**: Aligns with spec FR-001 through FR-004. The PayoutStep component moves from Step 3 to Step 1, PromptDetailsStep stays as Step 2, PromptFileStep stays as Step 3 (with added features).

**Implementation approach**:
1. On page load, fetch `/api/connect/status` to determine payment activation
2. If `isFullyOnboarded === true`: set `currentStep = 2`, mark Step 1 as completed
3. If not: set `currentStep = 1`, block Next until onboarding completes
4. StepIndicator always shows 3 steps; Step 1 shows checkmark when completed
5. Free prompt flow: skip Step 1 entirely (payment not relevant), start at Step 2

**State management**:
- `paymentActivated: boolean` — derived from API response, used for step routing and badge display
- `currentStep: number` — 1, 2, or 3 (always the visual step number)
- Step navigation respects payment gate: can't advance past Step 1 if not activated (paid flow)

## R6: Supabase JS Client Setup

**Decision**: Install `@supabase/supabase-js` and create a server-only client in `src/lib/supabase-storage.ts`.

**Rationale**: The Supabase JS client provides the `storage.from().upload()` API needed for file uploads. The client uses the service role key and must never be imported from client components.

**Environment variables needed**:
- `NEXT_PUBLIC_SUPABASE_URL` — already exists
- `SUPABASE_SERVICE_ROLE_KEY` — NEW, must be added to `.env.local`

**Client initialization** (server-only):
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Alternatives considered**:
- **Direct REST API calls**: Rejected because the JS client handles auth headers, retries, and provides typed responses.
- **Reusing Drizzle/postgres.js for storage**: Not applicable — Drizzle is an ORM, not a storage client.
