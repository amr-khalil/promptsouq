import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { prompts } from "./prompts";

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id),
    sellerId: text("seller_id").notNull(),
    imageUrl: text("image_url").notNull(),
    caption: text("caption"),
    status: text("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    likesCount: integer("likes_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_gallery_images_status").on(table.status),
    index("idx_gallery_images_seller_id").on(table.sellerId),
    index("idx_gallery_images_prompt_id").on(table.promptId),
    index("idx_gallery_images_created_at").on(table.createdAt),
  ],
);
