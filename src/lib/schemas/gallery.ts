import { z } from "zod";

// ─── Query Parameters ────────────────────────────────────────────

export const galleryListParams = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  cursor: z.string().optional(),
  period: z.enum(["today", "week", "month", "all"]).optional().default("all"),
  category: z.string().optional(),
});

export const adminGalleryListParams = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional().default("pending"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// ─── Request Bodies ──────────────────────────────────────────────

export const galleryUploadBody = z.object({
  imageUrl: z.string().url("رابط الصورة غير صالح"),
  promptId: z.string().uuid("معرّف البرومبت غير صالح"),
  caption: z.string().max(500, "الوصف يجب ألا يتجاوز 500 حرف").optional().nullable(),
});

export const galleryReviewBody = z
  .object({
    action: z.enum(["approve", "reject"], { message: "الإجراء غير صالح" }),
    rejectionReason: z.string().max(500, "سبب الرفض طويل جداً").optional(),
  })
  .refine(
    (data) => data.action !== "reject" || (data.rejectionReason && data.rejectionReason.length > 0),
    {
      message: "يجب تقديم سبب عند رفض الصورة",
      path: ["rejectionReason"],
    },
  );

// ─── Types ───────────────────────────────────────────────────────

export type GalleryListParams = z.infer<typeof galleryListParams>;
export type AdminGalleryListParams = z.infer<typeof adminGalleryListParams>;
export type GalleryUploadBody = z.infer<typeof galleryUploadBody>;
export type GalleryReviewBody = z.infer<typeof galleryReviewBody>;
