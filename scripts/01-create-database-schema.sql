-- E-learning Platform Database Schema (aligned with Drizzle migrations)
-- This script creates all necessary tables and enum types for the platform

-- Enum types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    CREATE TYPE "public"."role" AS ENUM('STUDENT', 'TRAINER', 'SUB_ADMIN', 'ADMIN');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
    CREATE TYPE "public"."course_status" AS ENUM('draft', 'validated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_type') THEN
    CREATE TYPE "public"."quiz_type" AS ENUM('auto', 'manual');
  END IF;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role "role" DEFAULT 'STUDENT' NOT NULL,
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  CONSTRAINT users_email_unique UNIQUE(email)
);

-- Domains/Categories table
CREATE TABLE IF NOT EXISTS domains (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  domain_id INTEGER,
  teacher_id INTEGER,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  course_id INTEGER,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  content_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER,
  title VARCHAR(200) NOT NULL,
  questions JSONB NOT NULL,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Final projects table
CREATE TABLE IF NOT EXISTS final_projects (
  id SERIAL PRIMARY KEY,
  course_id INTEGER,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Student enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER,
  course_id INTEGER,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Chapter progress tracking
CREATE TABLE IF NOT EXISTS chapter_progress (
  id SERIAL PRIMARY KEY,
  student_id INTEGER,
  chapter_id INTEGER,
  completed_at TIMESTAMP DEFAULT now()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  student_id INTEGER,
  quiz_id INTEGER,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT now()
);

-- Project submissions
CREATE TABLE IF NOT EXISTS project_submissions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER,
  final_project_id INTEGER,
  submission_url TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'submitted',
  feedback TEXT,
  grade INTEGER,
  submitted_at TIMESTAMP DEFAULT now(),
  reviewed_at TIMESTAMP
);

-- Foreign keys (matching Drizzle defaults: NO ACTION)
ALTER TABLE chapter_progress
  ADD CONSTRAINT IF NOT EXISTS chapter_progress_student_id_users_id_fk
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE chapter_progress
  ADD CONSTRAINT IF NOT EXISTS chapter_progress_chapter_id_chapters_id_fk
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE chapters
  ADD CONSTRAINT IF NOT EXISTS chapters_course_id_courses_id_fk
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE courses
  ADD CONSTRAINT IF NOT EXISTS courses_domain_id_domains_id_fk
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE courses
  ADD CONSTRAINT IF NOT EXISTS courses_teacher_id_users_id_fk
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE enrollments
  ADD CONSTRAINT IF NOT EXISTS enrollments_student_id_users_id_fk
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE enrollments
  ADD CONSTRAINT IF NOT EXISTS enrollments_course_id_courses_id_fk
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE final_projects
  ADD CONSTRAINT IF NOT EXISTS final_projects_course_id_courses_id_fk
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE project_submissions
  ADD CONSTRAINT IF NOT EXISTS project_submissions_student_id_users_id_fk
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE project_submissions
  ADD CONSTRAINT IF NOT EXISTS project_submissions_final_project_id_final_projects_id_fk
  FOREIGN KEY (final_project_id) REFERENCES final_projects(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE quiz_attempts
  ADD CONSTRAINT IF NOT EXISTS quiz_attempts_student_id_users_id_fk
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE quiz_attempts
  ADD CONSTRAINT IF NOT EXISTS quiz_attempts_quiz_id_quizzes_id_fk
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE quizzes
  ADD CONSTRAINT IF NOT EXISTS quizzes_chapter_id_chapters_id_fk
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
