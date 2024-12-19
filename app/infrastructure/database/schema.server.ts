import { createId } from "@paralleldrive/cuid2";
import { pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(createId),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export type SelectUser = typeof users.$inferSelect;
