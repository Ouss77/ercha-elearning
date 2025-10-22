-- Make teacherId nullable and remove maxStudents column from classes table

-- Make teacherId nullable
ALTER TABLE classes ALTER COLUMN teacher_id DROP NOT NULL;

-- Remove maxStudents column
ALTER TABLE classes DROP COLUMN IF EXISTS max_students;
