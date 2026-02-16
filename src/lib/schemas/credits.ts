import { z } from "zod";

// ─── Top-up Checkout Schema ──────────────────────────────────────

export const topupCheckoutSchema = z.object({
  packId: z.enum(["pack-10", "pack-50", "pack-100"], {
    message: "يرجى اختيار حزمة رصيد صالحة",
  }),
});

export type TopupCheckoutInput = z.infer<typeof topupCheckoutSchema>;

// ─── Credit Transactions Query Schema ────────────────────────────

export const creditTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreditTransactionsQuery = z.infer<typeof creditTransactionsQuerySchema>;
