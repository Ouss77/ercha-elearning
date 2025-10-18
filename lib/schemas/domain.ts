import { z } from "zod"

// Domain creation schema
export const createDomainSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
    .default("#6366f1")
})

// Domain update schema
export const updateDomainSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
    .optional()
})

// Domain ID parameter schema
export const domainIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid domain ID").transform(Number)
})

// Type exports
export type CreateDomainInput = z.infer<typeof createDomainSchema>
export type UpdateDomainInput = z.infer<typeof updateDomainSchema>
export type DomainIdParam = z.infer<typeof domainIdSchema>
