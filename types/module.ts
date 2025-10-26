import type { Chapter } from "./chapter"

/**
 * Module entity - logical grouping of chapters within a course
 */
export interface Module {
  id: number
  courseId: number
  title: string
  description: string | null
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Module with nested chapters
 */
export interface ModuleWithChapters extends Module {
  chapters: Chapter[]
}

/**
 * Module with progress information for a student
 */
export interface ModuleWithProgress extends Module {
  chapters: Chapter[]
  progress: {
    totalChapters: number
    completedChapters: number
    percentageComplete: number
  }
}

/**
 * Create module request payload
 */
export interface CreateModuleRequest {
  title: string
  description?: string | null
  orderIndex?: number
}

/**
 * Update module request payload
 */
export interface UpdateModuleRequest {
  title?: string
  description?: string | null
  orderIndex?: number
}

/**
 * Reorder modules request payload
 */
export interface ReorderModulesRequest {
  moduleIds: number[]
}
