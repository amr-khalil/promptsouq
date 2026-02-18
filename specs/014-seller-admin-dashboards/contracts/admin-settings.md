# API Contract: Admin Marketplace Settings

## GET /api/admin/settings

Returns current marketplace settings. Admin-only.

### Response 200
```json
{
  "data": {
    "commissionRate": 0.20,
    "updatedAt": "2026-02-10T14:00:00.000Z",
    "updatedBy": "clerk_user_id"
  }
}
```

---

## PUT /api/admin/settings

Updates marketplace settings. Admin-only.

### Request Body
```json
{
  "commissionRate": 0.15
}
```

### Zod Schema
```typescript
export const adminSettingsUpdateSchema = z.object({
  commissionRate: z.number()
    .min(0.01, "الحد الأدنى للعمولة 1%")
    .max(0.50, "الحد الأقصى للعمولة 50%"),
});
```

### Response 200
```json
{
  "data": {
    "commissionRate": 0.15,
    "updatedAt": "2026-02-18T10:00:00.000Z",
    "updatedBy": "clerk_user_id"
  }
}
```

### Response 400 (validation)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "بيانات غير صالحة",
    "details": { "fieldErrors": { "commissionRate": ["الحد الأقصى للعمولة 50%"] } }
  }
}
```
