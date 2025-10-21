/**
 * Course Management Components
 * 
 * This module exports all course-related admin components, hooks, and types.
 * Components in this folder handle CRUD operations for courses.
 */

// Re-export everything from courses-management subfolder
export { CoursesManagement } from './courses-management'
export { CourseForm } from './courses-management/course-form'
export { CourseFormPage } from './courses-management/course-form-page'
export { CourseDetailPage } from './courses-management/course-detail-page'
export { CoursesTable } from './courses-management/courses-table'
export { CoursesTableRow } from './courses-management/courses-table-row'
export { DeleteCourseDialog } from './courses-management/delete-course-dialog'
export { useCourses } from './courses-management/use-courses'
export type * from './courses-management/types'
