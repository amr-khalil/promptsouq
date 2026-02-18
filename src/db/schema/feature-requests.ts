import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const featureRequests = pgTable(
  "feature_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    voteCount: integer("vote_count").notNull().default(0),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_feature_requests_vote_count").on(table.voteCount),
    index("idx_feature_requests_created_at").on(table.createdAt),
    index("idx_feature_requests_status").on(table.status),
  ],
);
