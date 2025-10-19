import { z } from "zod"

// Course creation schema
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .trim(),
  description: z
    .string()
    .optional()
    .nullable(),
  domainId: z
    .number()
    .int("Domain ID must be an integer")
    .positive("Domain ID must be positive"),
  teacherId: z
    .number()
    .int("Teacher ID must be an integer")
    .positive("Teacher ID must be positive")
    .optional()
    .nullable(),
  thumbnailUrl: z
    .string()
    .url("Invalid URL format")
    .optional()
    .nullable(),
  isActive: z
    .boolean()
    .optional()
})

// Course update schema (all fields optional)
export const updateCourseSchema = createCourseSchema.partial()

// Course ID parameter schema
export const courseIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid course ID").transform(Number)
})

// Type exports
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type CourseIdParam = z.infer<typeof courseIdSchema>
