import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: text("created_at").default(new Date().toISOString())
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const designs = pgTable("designs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  depth: integer("depth").notNull(),
  elements: jsonb("elements").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertDesignSchema = createInsertSchema(designs).pick({
  userId: true,
  name: true,
  width: true,
  height: true,
  depth: true,
  elements: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDesignSchema = createInsertSchema(designs).pick({
  name: true,
  width: true,
  height: true,
  depth: true,
  elements: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDesign = z.infer<typeof insertDesignSchema>;
export type UpdateDesign = z.infer<typeof updateDesignSchema>;
export type Design = typeof designs.$inferSelect;
