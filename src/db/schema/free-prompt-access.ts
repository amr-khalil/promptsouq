import { index, pgTable, serial, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { prompts } from "./prompts";

export const freePromptAccess = pgTable(
  "free_prompt_access",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id),
    accessedAt: timestamp("accessed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("free_prompt_access_user_prompt_unique").on(table.userId, table.promptId),
    index("free_prompt_access_user_id_idx").on(table.userId),
  ],
);
