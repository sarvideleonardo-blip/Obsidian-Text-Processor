import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const correctionSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  index: z.number(),
});

export const entriesTable = pgTable("entries", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  correctedText: text("corrected_text").notNull(),
  corrections: jsonb("corrections").notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  categories: text("categories").array().notNull().default([]),
  inferredConnections: text("inferred_connections").array().notNull().default([]),
  frontmatterYaml: text("frontmatter_yaml").notNull().default(""),
  obsidianMarkdown: text("obsidian_markdown").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEntrySchema = createInsertSchema(entriesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entriesTable.$inferSelect;
export type Correction = z.infer<typeof correctionSchema>;
