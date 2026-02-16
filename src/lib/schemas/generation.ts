import { z } from "zod";

// ─── Generate Request Schema ─────────────────────────────────────

export const generateRequestSchema = z.object({
  promptId: z.string().uuid({ message: "معرف البرومبت غير صالح" }),
  generationType: z.enum(["text", "image"], {
    message: "يرجى اختيار نوع التوليد",
  }),
  model: z.enum(["gemini", "chatgpt", "claude"], {
    message: "يرجى اختيار نموذج صالح",
  }),
  inputPrompt: z
    .string()
    .min(1, { message: "النص المطلوب لا يمكن أن يكون فارغاً" })
    .max(10000, { message: "النص المطلوب طويل جداً" }),
});

export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;

// ─── Generations List Query Schema ───────────────────────────────

export const generationsListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  promptId: z.string().uuid().optional(),
});

export type GenerationsListQuery = z.infer<typeof generationsListQuerySchema>;
