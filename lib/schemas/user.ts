import { z } from "zod"

// Role enum schema
export const roleSchema = z.enum(["STUDENT", "TRAINER", "SUB_ADMIN", "ADMIN"])

// User creation schema (for admin creating users)
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  role: roleSchema.default("STUDENT"),
  avatarUrl: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true)
})

// User update schema (for updating existing users)
export const updateUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional(),
  role: roleSchema.optional(),
  avatarUrl: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional()
})

// User profile update schema (for users updating their own profile)
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional(),
  avatarUrl: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal(""))
})

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(1, "New password is required")
    .min(8, "New password must be at least 8 characters"),
  confirmPassword: z
    .string()
    .min(1, "Password confirmation is required")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

// User ID parameter schema
export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid user ID").transform(Number)
})

// Type exports
export type Role = z.infer<typeof roleSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UserIdParam = z.infer<typeof userIdSchema>
