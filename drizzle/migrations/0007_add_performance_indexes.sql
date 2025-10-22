-- Migration: Add performance indexes for frequently queried columns
-- This migration adds indexes to improve query performance across the application

-- Users table indexes
-- Frequently queried by email for authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- Frequently queried by role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- Frequently queried by active status
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Courses table indexes
-- Frequently queried by teacher for teacher dashboard
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
-- Frequently queried by domain for filtering
CREATE INDEX IF NOT EXISTS idx_courses_domain_id ON courses(domain_id);
-- Frequently queried by slug for course lookup
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
-- Frequently queried by active status
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
-- Composite index for teacher + active status queries
CREATE INDEX IF NOT EXISTS idx_courses_teacher_active ON courses(teacher_id, is_active);

-- Chapters table indexes
-- Already has idx_chapters_course from previous migration
-- Add composite index for course + order for efficient ordering
CREATE INDEX IF NOT EXISTS idx_chapters_course_order ON chapters(course_id, order_index);

-- Content items table indexes
-- Already has idx_content_items_chapter from previous migration

-- Enrollments table indexes
-- Frequently queried by student for student dashboard
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
-- Frequently queried by course for course analytics
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
-- Composite index for student + course lookups (prevents duplicate enrollments)
CREATE INDEX IF NOT EXISTS idx_enrollments_student_course ON enrollments(student_id, course_id);
-- Index for completed enrollments queries
CREATE INDEX IF NOT EXISTS idx_enrollments_completed_at ON enrollments(completed_at);
-- Composite index for student + completed status
CREATE INDEX IF NOT EXISTS idx_enrollments_student_completed ON enrollments(student_id, completed_at);

-- Chapter progress table indexes
-- Frequently queried by student for progress tracking
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student_id ON chapter_progress(student_id);
-- Frequently queried by chapter for analytics
CREATE INDEX IF NOT EXISTS idx_chapter_progress_chapter_id ON chapter_progress(chapter_id);
-- Composite index for student + chapter lookups (prevents duplicates)
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student_chapter ON chapter_progress(student_id, chapter_id);
-- Index for completed_at for recent activity queries
CREATE INDEX IF NOT EXISTS idx_chapter_progress_completed_at ON chapter_progress(completed_at);

-- Quizzes table indexes
-- Frequently queried by chapter
CREATE INDEX IF NOT EXISTS idx_quizzes_chapter_id ON quizzes(chapter_id);

-- Quiz attempts table indexes
-- Frequently queried by student for student progress
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
-- Frequently queried by quiz for analytics
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
-- Composite index for student + quiz lookups
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);
-- Index for attempted_at for recent activity queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_attempted_at ON quiz_attempts(attempted_at);
-- Composite index for finding best attempts (student + quiz + score)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_quiz_score ON quiz_attempts(student_id, quiz_id, score DESC);

-- Final projects table indexes
-- Frequently queried by course
CREATE INDEX IF NOT EXISTS idx_final_projects_course_id ON final_projects(course_id);

-- Project submissions table indexes
-- Frequently queried by student
CREATE INDEX IF NOT EXISTS idx_project_submissions_student_id ON project_submissions(student_id);
-- Frequently queried by project
CREATE INDEX IF NOT EXISTS idx_project_submissions_project_id ON project_submissions(final_project_id);
-- Composite index for student + project lookups
CREATE INDEX IF NOT EXISTS idx_project_submissions_student_project ON project_submissions(student_id, final_project_id);
-- Index for submitted_at for recent activity queries
CREATE INDEX IF NOT EXISTS idx_project_submissions_submitted_at ON project_submissions(submitted_at);
-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON project_submissions(status);

-- Domains table indexes
-- Name is frequently used for uniqueness checks
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(name);
