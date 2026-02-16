import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const creditBalances = pgTable("credit_balances", {
  userId: text("user_id").primaryKey(),
  subscriptionCredits: integer("subscription_credits").notNull().default(0),
  topupCredits: integer("topup_credits").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id").unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
