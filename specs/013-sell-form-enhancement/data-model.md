# Data Model: Sell Form Enhancement

**Feature**: 013-sell-form-enhancement
**Date**: 2026-02-18

## Overview

This feature does NOT introduce new database tables. It adds a Supabase Storage bucket for images and uses browser localStorage for draft persistence. The existing `prompts` table already stores `gallery` (text array of image URLs) and `examplePrompts` (JSONB), which will now receive permanent Supabase Storage URLs instead of ephemeral blob URLs.

## Entities

### 1. Supabase Storage Bucket: `prompt-images`

| Property | Value |
|----------|-------|
| Bucket name | `prompt-images` |
| Public | `true` (read access via URL) |
| File size limit | 10,485,760 bytes (10 MB) |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |

**Storage path pattern**: `{userId}/{timestamp}-{randomSuffix}.{ext}`

Example: `user_2abc123/1708300800000-a1b2c3.jpg`

**Public URL format**: `https://{project-ref}.supabase.co/storage/v1/object/public/prompt-images/{path}`

**Lifecycle**: Images are uploaded during form editing (Step 3) and persist indefinitely. Orphaned images (from abandoned drafts or removed example slots) are not automatically cleaned up (out of scope).

### 2. localStorage Draft: `promptsouq-sell-draft`

**Storage location**: Browser localStorage (persists across tab closes and restarts).

**Schema**:

```typescript
interface SellFormDraft {
  currentStep: number;               // 1 | 2 | 3
  paymentActivated: boolean;         // Cached payment status
  formData: {
    // Step 2 — Prompt Details
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    isFree: boolean;
    price: number;
    category: string;
    aiModel: string;
    generationType: string;
    modelVersion: string;
    maxTokens: number | null;
    temperature: number | null;
    difficulty: string;
    tags: string[];
    thumbnail: string;

    // Step 3 — Prompt Content
    fullContent: string;
    instructions: string;
    exampleOutputs: string[];
    examplePrompts: Array<{
      image?: string;                // Supabase Storage public URL (or empty)
      variables: Record<string, string>;
    }>;
    imageGenerationType?: string;
  };
  savedAt: string;                    // ISO 8601 timestamp
}
```

**State transitions**:

```
[Empty] → save on step navigation → [Draft Exists]
[Draft Exists] → restore on page load → [Form Populated]
[Draft Exists] → save on step navigation → [Draft Updated]
[Draft Exists] → clear on successful submission → [Empty]
[Draft Exists] → clear on "Sell Another" click → [Empty]
[Draft Exists] → user clears browser storage → [Empty] (graceful)
```

### 3. Existing Entity: `prompts` Table (No Changes)

The `prompts` table already has these relevant columns that receive data from the form:

| Column | Type | Relevance |
|--------|------|-----------|
| `gallery` | `text[]` | Stores Supabase Storage URLs (was blob URLs, now permanent) |
| `examplePrompts` | `jsonb` | Stores example prompt data including image URLs |
| `sellerId` | `text` | Clerk user ID, used for storage path |
| `status` | `text` | Set to `"pending"` on submission |

**No schema migration needed** — the column types already support the new URL format.

### 4. Existing Entity: `seller_profiles` Table (No Changes)

Used to check payment activation status:

| Column | Type | Relevance |
|--------|------|-----------|
| `userId` | `text` (PK) | Lookup key for payment status |
| `stripeAccountId` | `text` | Existence check for Stripe account |
| `chargesEnabled` | `boolean` | Must be `true` for payment activated |
| `payoutsEnabled` | `boolean` | Must be `true` for payment activated |

**Payment activated** = `chargesEnabled === true && payoutsEnabled === true`

## Validation Rules

### Image Upload Validation (API Route)

| Rule | Enforcement | Error |
|------|-------------|-------|
| Max file size: 10 MB | Zod schema + bucket policy | "File exceeds 10 MB limit" |
| Allowed types: JPEG, PNG, GIF, WebP | Zod schema + bucket policy | "File type not supported" |
| Auth required | Clerk `auth()` check | 401 Unauthorized |
| Non-empty file | Zod schema | "No file provided" |

### Draft Validation (Client-side)

| Rule | Enforcement | Error |
|------|-------------|-------|
| Valid JSON | `JSON.parse` try/catch | Silent fail, start fresh |
| Schema match | Optional runtime check | Silent fail, start fresh |
| Storage available | `localStorage` feature check | No persistence, no error |
