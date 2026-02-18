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
  gallery: z.array(z.string()),
  seller: sellerSchema,
  tags: z.array(z.string()),
  difficulty: z.enum(["مبتدئ", "متوسط", "متقدم"]),
  samples: z.array(z.string()),
  fullContent: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  isFree: z.boolean(),
  contentLocked: z.boolean().optional(),
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
  search: z.string().max(200).optional(),
  category: z.string().optional(),
  aiModel: z.string().optional(),
  generationType: z
    .enum(["text", "image", "code", "marketing", "design"])
    .optional(),
  priceMin: z.coerce
    .number()
    .min(0, { message: "الحد الأدنى للسعر يجب أن يكون 0 أو أكثر" })
    .optional(),
  priceMax: z.coerce
    .number()
    .min(0, { message: "الحد الأقصى للسعر يجب أن يكون 0 أو أكثر" })
    .optional(),
  sortBy: z
    .enum([
      "trending",
      "popular",
      "newest",
      "price-low",
      "price-high",
      "relevant",
      "rating",
      "bestselling",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sellerId: z.string().optional(),
  priceType: z.enum(["all", "free", "paid"]).optional().default("all"),
});

export const suggestionsQuerySchema = z.object({
  q: z.string().min(2, "يجب إدخال حرفين على الأقل").max(100),
  limit: z.coerce.number().int().min(1).max(10).optional(),
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
  rating: z
    .number()
    .int()
    .min(1, "يجب اختيار تقييم")
    .max(5, "الحد الأقصى 5 نجوم"),
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

// ─── Prompt Submission Schema (Sell Flow) ─────────────────────────

export const promptSubmissionSchema = z
  .object({
    title: z
      .string()
      .min(5, "اسم البرومبت يجب أن يكون 5 أحرف على الأقل")
      .max(50, "العنوان يجب ألا يتجاوز 50 حرفاً"),
    titleEn: z.string().max(50, "العنوان يجب ألا يتجاوز 50 حرفاً"),
    description: z
      .string()
      .min(1, "الوصف مطلوب")
      .max(500, "الوصف يجب ألا يتجاوز 500 حرف"),
    descriptionEn: z.string().max(500),
    isFree: z.boolean(),
    price: z.number().max(15, "الحد الأقصى للسعر 15$"),
    category: z.string().min(1, "التصنيف مطلوب"),
    aiModel: z.string().min(1, "نموذج الذكاء الاصطناعي مطلوب"),
    generationType: z.enum(["text", "image", "video", "audio", "3d"], {
      message: "نوع المحتوى غير صالح",
    }),
    modelVersion: z.string().optional(),
    maxTokens: z.number().int().min(1).max(128000).optional().nullable(),
    temperature: z.number().min(0).max(2).optional().nullable(),
    difficulty: z.enum(["مبتدئ", "متوسط", "متقدم"], {
      message: "مستوى الصعوبة غير صالح",
    }),
    tags: z
      .array(z.string())
      .min(1, "يجب إضافة وسم واحد على الأقل")
      .max(5, "الحد الأقصى 5 وسوم"),
    thumbnail: z.string().optional(),
    fullContent: z
      .string()
      .min(1, "محتوى البرومبت مطلوب")
      .max(20000, "محتوى البرومبت طويل جداً")
      .refine((val) => /\[.+?\]/.test(val), {
        message:
          "يجب أن يحتوي البرومبت على متغير واحد على الأقل بين [أقواس مربعة]",
      }),
    instructions: z.string().max(2000, "التعليمات طويلة جداً").optional(),
    exampleOutputs: z
      .array(z.string())
      .optional(),
    examplePrompts: z
      .array(
        z.object({
          image: z.string().optional(),
          variables: z.record(z.string(), z.string()),
        }),
      )
      .optional(),
    // Image-specific fields
    imageGenerationType: z.enum(["text-to-image", "image-to-image"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isFree && data.price < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "الحد الأدنى للسعر 1$",
        path: ["price"],
      });
    }
    const promptExCount = data.examplePrompts?.length ?? 0;
    if (promptExCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يجب تقديم مثال واحد للبرومبت على الأقل",
        path: ["examplePrompts"],
      });
    }
  });

export type PromptSubmission = z.infer<typeof promptSubmissionSchema>;

/** Client-side schema factory with translated error messages */
export function createPromptSubmissionSchema(t: (key: string) => string) {
  return z
    .object({
      title: z.string().min(5, t("errors.titleMin")).max(50, t("errors.titleMax")),
      titleEn: z.string().max(50, t("errors.titleMax")),
      description: z.string().min(1, t("errors.descriptionRequired")).max(500, t("errors.descriptionMax")),
      descriptionEn: z.string().max(500),
      isFree: z.boolean(),
      price: z.number().max(15, t("errors.priceMax")),
      category: z.string().min(1, t("errors.categoryRequired")),
      aiModel: z.string().min(1, t("errors.aiModelRequired")),
      generationType: z.enum(["text", "image", "video", "audio", "3d"], {
        message: t("errors.generationTypeInvalid"),
      }),
      modelVersion: z.string().optional(),
      maxTokens: z.number().int().min(1).max(128000).optional().nullable(),
      temperature: z.number().min(0).max(2).optional().nullable(),
      difficulty: z.enum(["مبتدئ", "متوسط", "متقدم"], {
        message: t("errors.difficultyInvalid"),
      }),
      tags: z.array(z.string()).min(1, t("errors.tagsMin")).max(5, t("errors.tagsMax")),
      thumbnail: z.string().optional(),
      fullContent: z
        .string()
        .min(1, t("errors.contentRequired"))
        .max(20000, t("errors.contentMax"))
        .refine((val) => /\[.+?\]/.test(val), {
          message: t("errors.contentVariable"),
        }),
      instructions: z.string().max(2000, t("errors.instructionsMax")).optional(),
      exampleOutputs: z
        .array(z.string())
        .optional(),
      examplePrompts: z
        .array(
          z.object({
            image: z.string().optional(),
            variables: z.record(z.string(), z.string()),
          }),
        )
        .optional(),
      // Image-specific fields
      imageGenerationType: z.enum(["text-to-image", "image-to-image"]).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.isFree && data.price < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("errors.priceMin"),
          path: ["price"],
        });
      }
      const promptExCount = data.examplePrompts?.length ?? 0;
      if (promptExCount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("errors.promptExamplesCount"),
          path: ["examplePrompts"],
        });
      }
    });
}

// ─── Seller Dashboard Schemas ─────────────────────────────────────

export const sellerPromptsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["newest", "oldest"]).optional().default("newest"),
});

// ─── Admin Review Schemas ─────────────────────────────────────────

export const adminPromptsQuerySchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected"])
    .optional()
    .default("pending"),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export const adminReviewSchema = z
  .object({
    action: z.enum(["approve", "reject"], { message: "الإجراء غير صالح" }),
    reason: z.string().max(500, "سبب الرفض طويل جداً").optional(),
  })
  .refine(
    (data) =>
      data.action !== "reject" || (data.reason && data.reason.length > 0),
    {
      message: "يجب تقديم سبب عند رفض البرومبت",
      path: ["reason"],
    },
  );

export type AdminReview = z.infer<typeof adminReviewSchema>;

// ─── Stripe Connect Schema ────────────────────────────────────────

export const connectAccountSchema = z.object({
  country: z.string().length(2, "رمز الدولة يجب أن يكون حرفين"),
});

// ─── Sellers Schemas ─────────────────────────────────────────────

export const sellersQuerySchema = z.object({
  sortBy: z.enum(["rating", "sales"]).optional().default("rating"),
  limit: z.coerce.number().int().min(1).max(20).optional().default(8),
});

export const sellerProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatar: z.string(),
  bio: z.string().nullable(),
  country: z.string().nullable(),
  totalSales: z.number(),
  totalReviews: z.number(),
  avgRating: z.number(),
  promptCount: z.number(),
  tier: z.string(),
  topCategories: z.array(z.string()),
});

export const sellerStorefrontSchema = sellerProfileSchema.extend({
  totalFavorites: z.number(),
  joinedAt: z.string(),
});

// ─── Error Response Helper ────────────────────────────────────────

export function apiErrorResponse(
  code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "INTERNAL_ERROR"
    | "FORBIDDEN"
    | "CONFLICT",
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
