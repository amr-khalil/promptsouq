import { z } from "zod";

// ─── Entity Schemas ───────────────────────────────────────────────

const sellerSchema = z.object({
  name: z.string(),
  avatar: z.string(),
  rating: z.number(),
});

export const promptSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleEn: z.string(),
  description: z.string(),
  descriptionEn: z.string(),
  price: z.number(),
  category: z.string(),
  aiModel: z.string(),
  rating: z.number(),
  reviews: z.number(),
  sales: z.number(),
  thumbnail: z.string(),
  seller: sellerSchema,
  tags: z.array(z.string()),
  difficulty: z.enum(["مبتدئ", "متقدم"]),
  samples: z.array(z.string()),
  fullContent: z.string().optional(),
  instructions: z.string().optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  icon: z.string(),
  count: z.number(),
});

export const reviewSchema = z.object({
  id: z.string(),
  promptId: z.string().optional(),
  userId: z.string().optional(),
  userName: z.string(),
  userAvatar: z.string(),
  rating: z.number(),
  date: z.string(),
  comment: z.string(),
});

export const testimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  content: z.string(),
  avatar: z.string(),
  rating: z.number(),
});

// ─── Inferred Types ───────────────────────────────────────────────

export type Prompt = z.infer<typeof promptSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;

// ─── Query Parameter Schemas ──────────────────────────────────────

export const promptsQuerySchema = z.object({
  category: z.string().optional(),
  aiModel: z.string().optional(),
  priceMin: z.coerce
    .number()
    .min(0, { message: "الحد الأدنى للسعر يجب أن يكون 0 أو أكثر" })
    .optional(),
  priceMax: z.coerce
    .number()
    .min(0, { message: "الحد الأقصى للسعر يجب أن يكون 0 أو أكثر" })
    .optional(),
  sortBy: z
    .enum(["bestselling", "newest", "rating", "price-low", "price-high"])
    .optional()
    .default("bestselling"),
  limit: z.coerce
    .number()
    .int()
    .positive({ message: "الحد يجب أن يكون رقم صحيح موجب" })
    .optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, { message: "يرجى إدخال كلمة بحث" }),
});

export const relatedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(3),
});

// ─── UUID & Checkout Schemas ─────────────────────────────────────

export const uuidParamSchema = z.string().uuid("معرّف غير صالح");

export const checkoutRequestSchema = z.object({
  items: z
    .array(
      z.object({
        promptId: z.string().uuid("معرّف غير صالح"),
      }),
    )
    .min(1, "السلة فارغة")
    .max(50),
});

export const purchaseQuerySchema = z.object({
  promptId: z.string().uuid().optional(),
});

// ─── Review Submission Schema ─────────────────────────────────────

export const reviewSubmitSchema = z.object({
  rating: z.number().int().min(1, "يجب اختيار تقييم").max(5, "الحد الأقصى 5 نجوم"),
  comment: z.string().max(1000, "التعليق طويل جداً"),
});

// ─── Favorites Schemas ────────────────────────────────────────────

export const favoriteRequestSchema = z.object({
  promptId: z.string().uuid("معرّف غير صالح"),
});

export const favoriteCheckQuerySchema = z.object({
  promptIds: z.string().min(1, "يجب توفير معرّفات البرومبتات"),
});

// ─── Purchase List Item Schema ────────────────────────────────────

const purchaseSellerSchema = z.object({
  name: z.string(),
  avatar: z.string(),
});

export const purchaseListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleEn: z.string(),
  thumbnail: z.string(),
  aiModel: z.string(),
  price: z.number(),
  category: z.string(),
  seller: purchaseSellerSchema,
  purchasedAt: z.string(),
  priceAtPurchase: z.number(),
});

// ─── Error Response Helper ────────────────────────────────────────

export function apiErrorResponse(
  code: "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR" | "FORBIDDEN" | "CONFLICT",
  message: string,
  details?: Record<string, unknown>,
) {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
