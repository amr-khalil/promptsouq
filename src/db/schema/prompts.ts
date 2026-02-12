import { integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en").notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en").notNull(),
  price: real("price").notNull(),
  category: text("category")
    .notNull()
    .references(() => categories.slug),
  aiModel: text("ai_model").notNull(),
  rating: real("rating").notNull().default(0),
  reviewsCount: integer("reviews_count").notNull().default(0),
  sales: integer("sales").notNull().default(0),
  thumbnail: text("thumbnail").notNull(),
  sellerName: text("seller_name").notNull(),
  sellerAvatar: text("seller_avatar").notNull(),
  sellerRating: real("seller_rating").notNull().default(0),
  tags: text("tags").array().notNull().default([]),
  difficulty: text("difficulty").notNull(),
  samples: text("samples").array().notNull().default([]),
  fullContent: text("full_content"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
