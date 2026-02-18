import { z } from "zod";

// ─── Query Parameters ────────────────────────────────────────────

export const notificationListParams = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// ─── Request Bodies ──────────────────────────────────────────────

export const markReadBody = z
  .object({
    action: z.enum(["read_one", "read_all"], {
      message: "الإجراء غير صالح",
    }),
    notificationId: z.string().uuid("معرّف الإشعار غير صالح").optional(),
  })
  .refine(
    (data) => data.action !== "read_one" || !!data.notificationId,
    {
      message: "معرّف الإشعار مطلوب عند تحديد إشعار واحد",
      path: ["notificationId"],
    },
  );

// ─── Response Types ──────────────────────────────────────────────

export type NotificationListParams = z.infer<typeof notificationListParams>;
export type MarkReadBody = z.infer<typeof markReadBody>;
