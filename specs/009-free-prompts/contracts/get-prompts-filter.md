# Contract: GET /api/prompts (Modified — Price Type Filter)

**Method**: GET
**Path**: `/api/prompts`
**Auth**: Not required

## Changes from Current Behavior

Adds a new `priceType` query parameter to filter prompts by pricing tier.

## New Query Parameter

| Param | Type | Required | Default | Values | Description |
|-------|------|----------|---------|--------|-------------|
| `priceType` | `enum` | No | `"all"` | `"all"`, `"free"`, `"paid"` | Filter by pricing tier |

**Existing parameters** (unchanged): `search`, `category`, `aiModel`, `generationType`, `priceMin`, `priceMax`, `sortBy`, `limit`, `offset`, `sellerId`

## Filter Logic

```
IF priceType === "free":
  conditions.push(eq(prompts.price, 0))
ELSE IF priceType === "paid":
  conditions.push(gt(prompts.price, 0))
// "all" adds no condition

// priceMin/priceMax still apply independently (AND logic)
```

## Response Changes

Each prompt object in the `data` array gains a new computed field:

| Field | Type | Description |
|-------|------|-------------|
| `isFree` | `boolean` | `true` when `price === 0` |

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "price": 0,
      "isFree": true,
      ...other fields
    },
    {
      "id": "uuid",
      "title": "...",
      "price": 9.99,
      "isFree": false,
      ...other fields
    }
  ],
  "total": 42
}
```

## Validation (Zod update to `promptsQuerySchema`)

```typescript
priceType: z.enum(["all", "free", "paid"]).default("all").optional()
```
