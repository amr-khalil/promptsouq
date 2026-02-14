import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const sellerProfiles = pgTable("seller_profiles", {
  userId: text("user_id").primaryKey(),
  stripeAccountId: text("stripe_account_id").unique(),
  country: text("country"),
  chargesEnabled: boolean("charges_enabled").notNull().default(false),
  payoutsEnabled: boolean("payouts_enabled").notNull().default(false),
  detailsSubmitted: boolean("details_submitted").notNull().default(false),
  totalEarnings: integer("total_earnings").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
