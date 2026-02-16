import { z } from "zod";

// ─── Subscription Checkout Schema ────────────────────────────────

export const subscriptionCheckoutSchema = z.object({
  planId: z.enum(["standard", "pro", "legendary"], {
    message: "يرجى اختيار خطة صالحة",
  }),
  billingCycle: z.enum(["monthly", "six_month", "yearly"], {
    message: "يرجى اختيار دورة فوترة صالحة",
  }),
});

export type SubscriptionCheckoutInput = z.infer<typeof subscriptionCheckoutSchema>;
