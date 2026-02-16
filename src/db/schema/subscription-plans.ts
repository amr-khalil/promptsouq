import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const subscriptionPlans = pgTable("subscription_plans", {
  id: text("id").primaryKey(), // "standard", "pro", "legendary"
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  monthlyCredits: integer("monthly_credits").notNull(),
  monthlyPrice: integer("monthly_price").notNull(), // cents
  sixMonthPrice: integer("six_month_price").notNull(),
  yearlyPrice: integer("yearly_price").notNull(),
  stripePriceIdMonthly: text("stripe_price_id_monthly").notNull(),
  stripePriceIdSixMonth: text("stripe_price_id_six_month").notNull(),
  stripePriceIdYearly: text("stripe_price_id_yearly").notNull(),
  features: jsonb("features").notNull().default([]),
  theme: text("theme").notNull(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
