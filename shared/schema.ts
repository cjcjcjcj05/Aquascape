import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  createdAt: text("created_at").default(new Date().toISOString()),
  resetToken: text("reset_token"),
  resetTokenExpiry: text("reset_token_expiry"),
  isAdmin: boolean("is_admin").default(false) // Added admin flag
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  avatarUrl: text("avatar_url"),
  updatedAt: text("updated_at").default(new Date().toISOString())
});

export const insertProfileSchema = createInsertSchema(userProfiles).pick({
  userId: true,
  displayName: true,
  bio: true,
  location: true,
  website: true,
  avatarUrl: true,
});

export const updateProfileSchema = createInsertSchema(userProfiles)
  .omit({ id: true, userId: true })
  .partial();

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertDesign = z.infer<typeof insertDesignSchema>;
export type UpdateDesign = z.infer<typeof updateDesignSchema>;
export type Design = typeof designs.$inferSelect;
