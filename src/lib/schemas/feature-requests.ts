import { z } from "zod";

export const featureRequestListParams = z.object({
  sort: z.enum(["votes", "newest"]).optional().default("votes"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  status: z.enum(["open", "under_review", "planned", "completed"]).optional(),
});

export const createFeatureRequestBody = z.object({
  title: z
    .string()
    .min(3, "العنوان يجب أن يكون 3 أحرف على الأقل")
    .max(100, "العنوان يجب ألا يتجاوز 100 حرف"),
  description: z
    .string()
    .min(10, "الوصف يجب أن يكون 10 أحرف على الأقل")
    .max(1000, "الوصف يجب ألا يتجاوز 1000 حرف"),
});

export type FeatureRequestListParams = z.infer<typeof featureRequestListParams>;
export type CreateFeatureRequestBody = z.infer<typeof createFeatureRequestBody>;
