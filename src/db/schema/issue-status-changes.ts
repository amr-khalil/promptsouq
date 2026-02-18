import { index, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { issues } from "./issues";

export const issueStatusChanges = pgTable(
  "issue_status_changes",
  {
    id: serial("id").primaryKey(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    note: text("note").notNull(),
    changedBy: text("changed_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_issue_status_changes_issue_id").on(table.issueId),
  ],
);
