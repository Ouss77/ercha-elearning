import { z } from "zod"

// ============================================================================
// Content Type Enums
// ============================================================================

export const contentTypeEnum = z.enum(["video", "text", "quiz", "test", "exam"])
export type ContentType = z.infer<typeof contentTypeEnum>

export const difficultyEnum = z.enum(["easy", "medium", "hard"])
export type Difficulty = z.infer<typeof difficultyEnum>

// ============================================================================
// Content Data Schemas
// ============================================================================

// Video Content Schema
export const videoContentSchema = z.object({
  type: z.literal("video"),
  url: z.string().url("Invalid video URL"),
  duration: z.number().positive("Duration must be positive").optional(),
  thumbnail: z.string().url("Invalid thumbnail URL").optional()
})

// Text Content Schema
export const textContentSchema = z.object({
  type: z.literal("text"),
  content: z.string().min(1, "Content is required"),
  attachments: z.array(z.object({
    name: z.string().min(1, "Attachment name is required"),
    url: z.string().url("Invalid attachment URL"),
    type: z.string().min(1, "Attachment type is required"),
    size: z.number().positive("Attachment size must be positive")
  })).optional()
})

// Quiz Question Schema
export const quizQuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  question: z.string().min(1, "Question text is required"),
  options: z.array(z.string().min(1, "Option text is required"))
    .min(2, "At least 2 options are required")
    .max(6, "Maximum 6 options allowed"),
  correctAnswer: z.number().int().min(0, "Correct answer index must be non-negative"),
  explanation: z.string().optional()
})

// Quiz Content Schema
export const quizContentSchema = z.object({
  type: z.literal("quiz"),
  questions: z.array(quizQuestionSchema).min(1, "At least one question is required"),
  passingScore: z.number().int().min(0).max(100).optional(),
  timeLimit: z.number().int().positive("Time limit must be positive").optional()
})

// Test Question Schema (open-ended questions without multiple choice options)
export const testQuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  question: z.string().min(1, "Question text is required"),
  points: z.number().positive("Points must be positive"),
  difficulty: difficultyEnum,
  explanation: z.string().optional(),
  expectedAnswer: z.string().optional() // Optional guidance for grading
})

// Test Content Schema
export const testContentSchema = z.object({
  type: z.literal("test"),
  questions: z.array(testQuestionSchema).min(1, "At least one question is required"),
  passingScore: z.number().int().min(0).max(100),
  timeLimit: z.number().int().positive("Time limit must be positive"),
  attemptsAllowed: z.number().int().positive("Attempts allowed must be positive")
})

// Exam Question Schema (extends Test Question with options for multiple choice)
export const examQuestionSchema = testQuestionSchema.extend({
  category: z.string().min(1, "Question category is required"),
  options: z.array(z.string().min(1, "Option text is required"))
    .min(2, "At least 2 options are required")
    .max(6, "Maximum 6 options allowed"),
  correctAnswer: z.number().int().min(0, "Correct answer index must be non-negative")
})

// Exam Content Schema
export const examContentSchema = z.object({
  type: z.literal("exam"),
  questions: z.array(examQuestionSchema).min(1, "At least one question is required"),
  passingScore: z.number().int().min(0).max(100),
  timeLimit: z.number().int().positive("Time limit must be positive"),
  attemptsAllowed: z.number().int().positive("Attempts allowed must be positive"),
  proctored: z.boolean()
})

// Union of all content data schemas
export const contentDataSchema = z.discriminatedUnion("type", [
  videoContentSchema,
  textContentSchema,
  quizContentSchema,
  testContentSchema,
  examContentSchema
])

// ============================================================================
// Chapter Schemas
// ============================================================================

// Chapter creation schema
export const createChapterSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .nullable(),
  orderIndex: z
    .number()
    .int("Order index must be an integer")
    .min(0, "Order index must be non-negative")
    .optional()
})

// Chapter update schema (all fields optional)
export const updateChapterSchema = createChapterSchema.partial()

// Chapter ID parameter schema
export const chapterIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid chapter ID").transform(Number)
})

// Chapter reorder schema
export const reorderChaptersSchema = z.object({
  courseId: z.number().int().positive("Course ID must be positive"),
  chapterIds: z.array(z.number().int().positive()).min(1, "At least one chapter ID is required")
})

// ============================================================================
// Content Item Schemas
// ============================================================================

// Content item creation schema
export const createContentItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  contentType: contentTypeEnum,
  contentData: contentDataSchema,
  orderIndex: z
    .number()
    .int("Order index must be an integer")
    .min(0, "Order index must be non-negative")
    .optional()
})

// Content item update schema
export const updateContentItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim()
    .optional(),
  contentData: contentDataSchema.optional()
})

// Content item ID parameter schema
export const contentItemIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid content item ID").transform(Number)
})

// Content item reorder schema
export const reorderContentItemsSchema = z.object({
  chapterId: z.number().int().positive("Chapter ID must be positive"),
  contentItemIds: z.array(z.number().int().positive()).min(1, "At least one content item ID is required")
})

// Move chapter to different module schema
export const moveChapterSchema = z.object({
  targetModuleId: z.number().int().positive("Target module ID must be positive"),
  targetOrderIndex: z.number().int().min(0, "Order index must be non-negative").optional()
})

// ============================================================================
// Type Exports
// ============================================================================

// Content Data Types
export type VideoContent = z.infer<typeof videoContentSchema>
export type TextContent = z.infer<typeof textContentSchema>
export type QuizContent = z.infer<typeof quizContentSchema>
export type TestContent = z.infer<typeof testContentSchema>
export type ExamContent = z.infer<typeof examContentSchema>
export type ContentData = z.infer<typeof contentDataSchema>

// Question Types
export type QuizQuestion = z.infer<typeof quizQuestionSchema>
export type TestQuestion = z.infer<typeof testQuestionSchema>
export type ExamQuestion = z.infer<typeof examQuestionSchema>

// Attachment Type
export type Attachment = NonNullable<TextContent["attachments"]>[number]

// Chapter Types
export type CreateChapterInput = z.infer<typeof createChapterSchema>
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>
export type ChapterIdParam = z.infer<typeof chapterIdSchema>
export type ReorderChaptersInput = z.infer<typeof reorderChaptersSchema>

// Content Item Types
export type CreateContentItemInput = z.infer<typeof createContentItemSchema>
export type UpdateContentItemInput = z.infer<typeof updateContentItemSchema>
export type ContentItemIdParam = z.infer<typeof contentItemIdSchema>
export type ReorderContentItemsInput = z.infer<typeof reorderContentItemsSchema>
