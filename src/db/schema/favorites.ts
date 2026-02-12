import { pgTable, serial, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { prompts } from "./prompts";

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  promptId: uuid("prompt_id")
    .notNull()
    .references(() => prompts.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  unique("favorites_user_prompt_unique").on(table.userId, table.promptId),
]);
