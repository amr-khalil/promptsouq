import { index, integer, jsonb, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const prompts = pgTable(
  "prompts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
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
    instructions: text("instructions"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Seller submission fields
    sellerId: text("seller_id"),
    status: text("status").notNull().default("approved"),
    generationType: text("generation_type"),
    modelVersion: text("model_version"),
    maxTokens: integer("max_tokens"),
    temperature: real("temperature"),
    exampleOutputs: text("example_outputs").array(),
    examplePrompts: jsonb("example_prompts"),
    rejectionReason: text("rejection_reason"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by"),
  },
  (table) => [
    index("idx_prompts_seller_id").on(table.sellerId),
    index("idx_prompts_status").on(table.status),
    index("idx_prompts_seller_status").on(table.sellerId, table.status),
  ],
);
