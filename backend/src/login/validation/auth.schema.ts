// backend/src/login/validation/auth.schema.ts
import { z } from "zod";

export const roleSchema = z.enum(["ADMIN", "MEMBER"]);

// LOGIN
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(128),
});

// PASSWORD RULE
const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "Password must contain at least one special character",
  });

// SELF REGISTER
export const registerSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: passwordSchema,
  name: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
});

// CREATE USER
export const createUserSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: passwordSchema,
  name: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  role: roleSchema.optional(),
});

// UPDATE USER
export const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  password: passwordSchema.optional(),
  name: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
});