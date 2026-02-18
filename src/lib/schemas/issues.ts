import { z } from "zod";

export const issueListParams = z.object({
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const createIssueBody = z.object({
  title: z
    .string()
    .min(5, "العنوان يجب أن يكون 5 أحرف على الأقل")
    .max(200, "العنوان يجب ألا يتجاوز 200 حرف"),
  description: z
    .string()
    .min(10, "الوصف يجب أن يكون 10 أحرف على الأقل")
    .max(2000, "الوصف يجب ألا يتجاوز 2000 حرف"),
  imageUrl: z.string().url("رابط الصورة غير صالح").optional().nullable(),
});

export const adminIssueListParams = z.object({
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sort: z.enum(["newest", "oldest"]).optional().default("newest"),
});

export const changeIssueStatusBody = z.object({
  status: z.enum(["open", "in_progress", "resolved"], {
    message: "الحالة غير صالحة",
  }),
  note: z
    .string()
    .min(5, "الملاحظة يجب أن تكون 5 أحرف على الأقل")
    .max(1000, "الملاحظة يجب ألا تتجاوز 1000 حرف"),
});

export type IssueListParams = z.infer<typeof issueListParams>;
export type CreateIssueBody = z.infer<typeof createIssueBody>;
export type AdminIssueListParams = z.infer<typeof adminIssueListParams>;
export type ChangeIssueStatusBody = z.infer<typeof changeIssueStatusBody>;
