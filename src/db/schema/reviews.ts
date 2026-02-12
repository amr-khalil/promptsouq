import { integer, pgTable, serial, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { prompts } from "./prompts";

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  promptId: uuid("prompt_id")
    .notNull()
    .references(() => prompts.id),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar").notNull(),
  rating: integer("rating").notNull(),
  date: text("date").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  unique("reviews_user_prompt_unique").on(table.userId, table.promptId),
]);
