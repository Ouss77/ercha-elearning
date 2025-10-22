-- Add class_courses table for linking courses to classes
CREATE TABLE IF NOT EXISTS "class_courses" (
  "id" SERIAL PRIMARY KEY,
  "class_id" INTEGER NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
  "course_id" INTEGER NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "assigned_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("class_id", "course_id")
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_class_courses_class_id" ON "class_courses"("class_id");
CREATE INDEX IF NOT EXISTS "idx_class_courses_course_id" ON "class_courses"("course_id");

-- Add cascade delete to class_enrollments if not already present
ALTER TABLE "class_enrollments" 
  DROP CONSTRAINT IF EXISTS "class_enrollments_class_id_classes_id_fk",
  ADD CONSTRAINT "class_enrollments_class_id_classes_id_fk" 
    FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE;

ALTER TABLE "class_enrollments" 
  DROP CONSTRAINT IF EXISTS "class_enrollments_student_id_users_id_fk",
  ADD CONSTRAINT "class_enrollments_student_id_users_id_fk" 
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE;