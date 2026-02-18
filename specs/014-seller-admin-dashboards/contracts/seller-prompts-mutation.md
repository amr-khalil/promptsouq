# API Contract: Seller Prompt Mutations

## GET /api/seller/prompts/[id]

Returns full prompt data for the authenticated seller (owner only). Used to pre-populate the edit form.

### Auth
- Requires Clerk auth. Must be the prompt owner (`sellerId === userId`).

### Response 200
```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "titleEn": "...",
    "description": "...",
    "descriptionEn": "...",
    "price": 5,
    "isFree": false,
    "category": "content-writing",
    "aiModel": "chatgpt",
    "generationType": "text",
    "modelVersion": "4.6 Opus",
    "maxTokens": null,
    "temperature": null,
    "difficulty": "مبتدئ",
    "tags": ["tag1", "tag2"],
    "thumbnail": "https://...",
    "fullContent": "...",
    "instructions": "...",
    "exampleOutputs": ["..."],
    "examplePrompts": [{ "variables": { "key": "value" } }],
    "status": "approved",
    "rejectionReason": null,
    "createdAt": "2026-02-10T10:00:00.000Z"
  }
}
```

---

## PUT /api/seller/prompts/[id]

Updates an existing prompt. Resets status to "pending" for re-review.

### Auth
- Requires Clerk auth. Must be the prompt owner.

### Request Body
Same shape as `promptSubmissionSchema` (the sell form Zod schema).

### Zod Schema
Reuses existing `promptSubmissionSchema` from `src/lib/schemas/api.ts`.

### Response 200
```json
{
  "data": {
    "id": "uuid",
    "status": "pending",
    "title": "...",
    "updatedAt": "2026-02-18T10:00:00.000Z"
  }
}
```

### Behavior
- Validates all fields via `promptSubmissionSchema`.
- Sets `status = "pending"`, clears `rejectionReason`, clears `reviewedAt`/`reviewedBy`.
- Sets `updatedAt = now()`.

---

## DELETE /api/seller/prompts/[id]

Soft-deletes a prompt. Sets `deletedAt` to current timestamp.

### Auth
- Requires Clerk auth. Must be the prompt owner.

### Response 200
```json
{
  "data": {
    "id": "uuid",
    "deletedAt": "2026-02-18T10:00:00.000Z"
  }
}
```

### Behavior
- If the prompt has purchases (`orderItems` with this `promptId` exist): sets `deletedAt = now()` (soft-delete).
- If the prompt has no purchases: also soft-deletes (consistent behavior, simpler logic).
- The prompt no longer appears in marketplace search, moderation queue, or seller's public storefront.
- Buyers who purchased the prompt can still access it via their purchases page.
