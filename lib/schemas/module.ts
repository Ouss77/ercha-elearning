import { z } from "zod"

/**
 * Schema for creating a module
 */
export const createModuleSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  description: z.string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .nullable(),
  orderIndex: z.number()
    .int("Order index must be an integer")
    .min(0, "Order index must be non-negative")
    .optional()
})

/**
 * Schema for updating a module
 */
export const updateModuleSchema = createModuleSchema.partial()

/**
 * Schema for module ID parameter
 */
export const moduleIdSchema = z.object({
  id: z.coerce.number().int().positive("Module ID must be a positive integer")
})

/**
 * Schema for course ID parameter
 */
export const courseIdSchema = z.object({
  courseId: z.coerce.number().int().positive("Course ID must be a positive integer")
})

/**
 * Schema for reordering modules
 */
export const reorderModulesSchema = z.object({
  moduleIds: z.array(z.number().int().positive()).min(1, "At least one module ID required")
})
