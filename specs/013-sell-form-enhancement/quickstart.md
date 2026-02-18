# Quickstart: Sell Form Enhancement

**Feature**: 013-sell-form-enhancement
**Branch**: `013-sell-form-enhancement`

## Prerequisites

1. **Supabase project**: `dyaflmsawxpqgmyojtbc` (eu-central-1) — already provisioned
2. **Environment variables** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dyaflmsawxpqgmyojtbc.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<get from Supabase dashboard → Settings → API>
   ```
3. **npm dependency**: Install `@supabase/supabase-js`
   ```bash
   npm install @supabase/supabase-js
   ```

## Setup Steps

### 1. Create Supabase Storage Bucket

Via Supabase MCP or SQL:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompt-images',
  'prompt-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 3. Add Service Role Key

Get the service role key from the Supabase dashboard:
- Go to Project Settings → API → Service Role Key
- Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your-key-here`

### 4. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/sell` to see the form.

## Testing the Feature

### Manual Testing Checklist

1. **Payment-first flow (not activated)**:
   - Sign in with a user who has no Stripe Connect account
   - Visit `/sell` — should see Step 1 (Payment Setup)
   - Cannot click Next until payment is activated

2. **Payment-first flow (activated)**:
   - Sign in with a user who has a fully onboarded Stripe account
   - Visit `/sell` — should skip to Step 2, Step 1 shows checkmark

3. **Draft persistence**:
   - Fill out Step 2 fields, click Next to Step 3
   - Close the browser tab completely
   - Reopen `/sell` — form should restore with all Step 2 data

4. **Image upload**:
   - On Step 3, add an example prompt and upload an image
   - Verify progress indicator appears
   - Verify image URL starts with Supabase Storage domain
   - Navigate away and back — image should still be visible

5. **Payment badge on Step 3**:
   - Verify green checkmark badge appears on Step 3 for activated sellers

6. **Inline success**:
   - Submit a prompt
   - Verify Step 3 form is replaced with success state
   - Verify "View Prompt" and "Sell Another" buttons appear

## Key Files

| File | Purpose |
|------|---------|
| `src/app/[locale]/sell/page.tsx` | Main form orchestrator |
| `src/app/api/upload/image/route.ts` | Image upload endpoint |
| `src/lib/supabase-storage.ts` | Supabase client (server-only) |
| `src/components/sell/PaymentBadge.tsx` | Payment status badge |
| `src/components/sell/InlineSuccess.tsx` | Post-submission success UI |
| `src/components/sell/StepIndicator.tsx` | Step progress with checkmark |

## Common Issues

- **"SUPABASE_SERVICE_ROLE_KEY is not defined"**: Add the key to `.env.local` and restart the dev server
- **Upload returns 500**: Check that the `prompt-images` bucket exists in Supabase Storage
- **Draft not restoring**: Check browser localStorage for key `promptsouq-sell-draft`; ensure localStorage is not blocked
- **Payment status check fails**: Ensure the user has a valid Clerk session and the Stripe secret key is configured
