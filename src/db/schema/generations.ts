import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { prompts } from "./prompts";

export const generations = pgTable(
  "generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id),
    generationType: text("generation_type").notNull(), // "text" or "image"
    model: text("model").notNull(),
    inputPrompt: text("input_prompt").notNull(),
    resultText: text("result_text"),
    resultImageUrl: text("result_image_url"),
    status: text("status").notNull().default("pending"),
    creditsConsumed: integer("credits_consumed").notNull().default(0),
    creditSource: text("credit_source"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_generations_user_id").on(table.userId),
    index("idx_generations_prompt_id").on(table.promptId),
    index("idx_generations_created_at").on(table.createdAt),
  ],
);
