import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"), // Full name for clients
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"), // Email for clients
  mobile: text("mobile"), // Mobile number for clients
  role: text("role").notNull().default("client"), // "admin" | "client"
  package: text("package"), // "Silver" | "Gold" | "Diamond" (nullable for admins)
  parentId: varchar("parent_id"), // For binary tree structure
  position: text("position"), // "left" | "right" (position under parent)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  package: true,
  parentId: true,
  position: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "client"]),
});

// Enhanced schema for client creation with validation
export const createClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be less than 50 characters"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.string().email("Please enter a valid email address"),
  package: z.enum(["Silver", "Gold", "Diamond"], { required_error: "Please select a plan" }),
  parentId: z.string().optional().nullable(),
  position: z.enum(["left", "right"]).optional().nullable()
});

export const paymentConfirmationSchema = z.object({
  clientData: createClientSchema,
  paymentConfirmed: z.boolean()
});

// Plans table schema
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: text("price").notNull(), // Stored as text to handle currency formatting
  businessVolume: text("business_volume").notNull(),
  referralCommission: text("referral_commission").notNull(),
  treeCommission: text("tree_commission").notNull(),
  status: text("status").notNull().default("active"), // "active" | "disabled"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

export const updatePlanSchema = insertPlanSchema.partial();

// Plan pricing information (keeping for backward compatibility)
export const planPricing = {
  Silver: 510,
  Gold: 1010,
  Diamond: 1510
} as const;

export type CreateClientRequest = z.infer<typeof createClientSchema>;
export type PaymentConfirmationRequest = z.infer<typeof paymentConfirmationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type UpdatePlan = z.infer<typeof updatePlanSchema>;
