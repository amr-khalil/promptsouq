# API Contract: Seller Profile Management

## GET /api/seller/profile

Returns the authenticated seller's profile data.

### Auth
- Requires Clerk auth. Returns profile for authenticated user.

### Response 200
```json
{
  "data": {
    "userId": "clerk_user_id",
    "displayName": "أحمد",
    "avatar": "https://...",
    "bio": "مطور ومبدع محتوى...",
    "country": "SA",
    "stripeAccountId": "acct_xxx",
    "chargesEnabled": true,
    "payoutsEnabled": true,
    "detailsSubmitted": true,
    "totalEarnings": 18000,
    "totalSales": 45,
    "createdAt": "2026-01-15T10:00:00.000Z"
  }
}
```

### Response 404
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "لا يوجد ملف بائع لهذا الحساب"
  }
}
```

---

## PUT /api/seller/profile

Updates the seller's public profile fields.

### Auth
- Requires Clerk auth. Updates profile for authenticated user only.

### Request Body
```json
{
  "displayName": "أحمد المحمد",
  "bio": "مطور ومبدع محتوى ذكاء اصطناعي",
  "avatar": "https://..."
}
```

### Zod Schema
```typescript
export const sellerProfileUpdateSchema = z.object({
  displayName: z.string()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(50, "الاسم يجب ألا يتجاوز 50 حرفاً"),
  bio: z.string()
    .max(500, "النبذة يجب ألا تتجاوز 500 حرف")
    .optional()
    .nullable(),
  avatar: z.string().url("رابط الصورة غير صالح").optional(),
});
```

### Response 200
```json
{
  "data": {
    "userId": "clerk_user_id",
    "displayName": "أحمد المحمد",
    "bio": "مطور ومبدع محتوى ذكاء اصطناعي",
    "avatar": "https://...",
    "updatedAt": "2026-02-18T10:00:00.000Z"
  }
}
```

### Behavior
- Only updates the fields provided in the request body.
- `displayName` is required (always provided by the form).
- `bio` and `avatar` are optional.
- Avatar URL should point to Supabase Storage (uploaded via existing `/api/upload/image` endpoint).
- Also updates `sellerName` and `sellerAvatar` on all prompts owned by this seller (denormalized fields).
