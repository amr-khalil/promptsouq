# API Contract: Upload Image

**Endpoint**: `POST /api/upload/image`
**Auth**: Required (Clerk — 401 if unauthenticated)
**Content-Type**: `multipart/form-data`

## Request

### FormData Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `file` | File (binary) | Yes | Max 10 MB, MIME: image/jpeg, image/png, image/gif, image/webp |

### Validation Schema (Zod)

```typescript
const uploadImageSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= 10 * 1024 * 1024, "File exceeds 10 MB limit")
    .refine(
      f => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(f.type),
      "File type not supported. Accepted: JPEG, PNG, GIF, WebP"
    ),
});
```

## Responses

### 201 Created

```json
{
  "url": "https://dyaflmsawxpqgmyojtbc.supabase.co/storage/v1/object/public/prompt-images/user_abc123/1708300800000-a1b2c3.jpg"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | Public URL of the uploaded image |

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": {
    "formErrors": [],
    "fieldErrors": {
      "file": ["File exceeds 10 MB limit"]
    }
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 500 Internal Server Error

```json
{
  "error": "Upload failed",
  "message": "Failed to upload image to storage"
}
```

## Server-Side Logic

1. Extract `file` from `request.formData()`
2. Validate with `uploadImageSchema`
3. Get `userId` from Clerk `auth()`
4. Generate storage path: `{userId}/{Date.now()}-{crypto.randomUUID().slice(0,8)}.{ext}`
5. Convert File to `ArrayBuffer` → `Buffer`
6. Upload to Supabase Storage bucket `prompt-images` using service role key
7. Construct public URL from bucket path
8. Return `{ url }` with 201 status

## Client-Side Usage

```typescript
// Upload with progress tracking
function uploadImage(file: File, onProgress: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 201) resolve(JSON.parse(xhr.responseText).url);
      else reject(new Error(JSON.parse(xhr.responseText).error));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.open("POST", "/api/upload/image");
    xhr.send(formData);
  });
}
```

## Rate Limiting

No rate limiting in initial implementation. Future consideration: limit to 10 uploads per minute per user to prevent abuse.
