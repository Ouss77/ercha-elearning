-- Migration: Drop unused quiz tables
-- These tables have been replaced by the content_items system
-- Quizzes are now content items with contentType="quiz"
-- Quiz attempts are tracked in content_item_attempts

-- Drop quiz_attempts table (has foreign key to quizzes)
DROP TABLE IF EXISTS quiz_attempts;

-- Drop quizzes table
DROP TABLE IF EXISTS quizzes;

-- Drop related indexes if they exist
DROP INDEX IF EXISTS idx_quiz_attempts_student_id;
DROP INDEX IF EXISTS idx_quiz_attempts_quiz_id;
DROP INDEX IF EXISTS idx_quiz_attempts_student_quiz;
DROP INDEX IF EXISTS idx_quiz_attempts_attempted_at;
DROP INDEX IF EXISTS idx_quiz_attempts_student_quiz_score;
DROP INDEX IF EXISTS idx_quizzes_chapter_id;
