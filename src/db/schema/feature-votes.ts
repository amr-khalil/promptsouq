import { pgTable, serial, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { featureRequests } from "./feature-requests";

export const featureVotes = pgTable(
  "feature_votes",
  {
    id: serial("id").primaryKey(),
    featureRequestId: uuid("feature_request_id")
      .notNull()
      .references(() => featureRequests.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("feature_votes_user_request_unique").on(table.userId, table.featureRequestId),
  ],
);
