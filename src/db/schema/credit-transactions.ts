import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(), // "subscription_grant", "topup_grant", "generation_deduction", "subscription_reset"
    amount: integer("amount").notNull(),
    creditSource: text("credit_source").notNull(), // "subscription" or "topup"
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    balanceAfter: integer("balance_after").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_credit_transactions_user_id").on(table.userId),
    index("idx_credit_transactions_created_at").on(table.createdAt),
  ],
);
