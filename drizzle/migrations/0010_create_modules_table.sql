-- Migration: Create modules table and fix chapter relationships
-- This migration creates the modules table and properly associates chapters with modules

-- Create modules table
CREATE TABLE IF NOT EXISTS "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint for modules
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_courses_id_fk" 
FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;

-- First, drop the foreign key constraint on chapters if it exists
ALTER TABLE "chapters" DROP CONSTRAINT IF EXISTS "chapters_module_id_modules_id_fk";

-- Add module_id column to chapters if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chapters' AND column_name='module_id') THEN
        ALTER TABLE "chapters" ADD COLUMN "module_id" integer;
    END IF;
END $$;

-- Create a default module for each course that has chapters without modules
INSERT INTO "modules" ("course_id", "title", "description", "order_index", "created_at", "updated_at")
SELECT DISTINCT 
    c.id as course_id,
    'Module par défaut' as title,
    'Module principal pour le cours ' || c.title as description,
    0 as order_index,
    NOW() as created_at,
    NOW() as updated_at
FROM "courses" c
INNER JOIN "chapters" ch ON ch.course_id = c.id
WHERE ch.module_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM "modules" m WHERE m.course_id = c.id
);

-- Update chapters to reference the default module for their course
UPDATE "chapters" 
SET "module_id" = (
    SELECT m.id 
    FROM "modules" m 
    WHERE m.course_id = "chapters".course_id 
    ORDER BY m.order_index 
    LIMIT 1
)
WHERE "module_id" IS NULL 
AND "course_id" IS NOT NULL;

-- Now make module_id NOT NULL
ALTER TABLE "chapters" ALTER COLUMN "module_id" SET NOT NULL;

-- Add the foreign key constraint back
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_module_id_modules_id_fk" 
FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;

-- Drop the course_id column from chapters (it's no longer needed)
ALTER TABLE "chapters" DROP COLUMN IF EXISTS "course_id";

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_modules_course_id" ON "modules" ("course_id");
CREATE INDEX IF NOT EXISTS "idx_chapters_module_id" ON "chapters" ("module_id");
CREATE INDEX IF NOT EXISTS "idx_modules_order" ON "modules" ("course_id", "order_index");
CREATE INDEX IF NOT EXISTS "idx_chapters_order" ON "chapters" ("module_id", "order_index");