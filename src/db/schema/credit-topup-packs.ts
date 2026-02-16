import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const creditTopupPacks = pgTable("credit_topup_packs", {
  id: text("id").primaryKey(), // "pack-10", "pack-50", "pack-100"
  credits: integer("credits").notNull(),
  price: integer("price").notNull(), // cents
  stripePriceId: text("stripe_price_id").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
