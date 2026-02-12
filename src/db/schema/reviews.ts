import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { prompts } from "./prompts";

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id")
    .notNull()
    .references(() => prompts.id),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar").notNull(),
  rating: integer("rating").notNull(),
  date: text("date").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
