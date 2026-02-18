import { pgTable, serial, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { galleryImages } from "./gallery-images";

export const galleryLikes = pgTable(
  "gallery_likes",
  {
    id: serial("id").primaryKey(),
    galleryImageId: uuid("gallery_image_id")
      .notNull()
      .references(() => galleryImages.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("gallery_likes_user_image_unique").on(table.userId, table.galleryImageId),
  ],
);
