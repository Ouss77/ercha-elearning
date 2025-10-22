-- Migration: Add enum types to database
-- This migration creates PostgreSQL enum types for role, course_status, and quiz_type
-- and converts the users.role column from varchar to the role enum type

-- Step 1: Create enum types (only if they don't exist)
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('STUDENT', 'TRAINER', 'SUB_ADMIN', 'ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."course_status" AS ENUM('draft', 'validated');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."quiz_type" AS ENUM('auto', 'manual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Step 2: Validate existing role values before conversion
-- This will fail if any invalid role values exist in the database
--> statement-breakpoint
DO $$
DECLARE
  invalid_roles TEXT;
BEGIN
  SELECT string_agg(DISTINCT role, ', ')
  INTO invalid_roles
  FROM users
  WHERE role NOT IN ('STUDENT', 'TRAINER', 'SUB_ADMIN', 'ADMIN');
  
  IF invalid_roles IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid role values found in users table: %. Valid values are: STUDENT, TRAINER, SUB_ADMIN, ADMIN', invalid_roles;
  END IF;
END $$;

-- Step 3: Convert users.role column from varchar to role enum
-- Using explicit casting to ensure data integrity
--> statement-breakpoint
ALTER TABLE "users" 
ALTER COLUMN "role" TYPE "role" 
USING "role"::text::"role";

-- Step 4: Re-apply the default value for the role column
--> statement-breakpoint
ALTER TABLE "users" 
ALTER COLUMN "role" SET DEFAULT 'STUDENT'::"role";

-- Migration complete
-- The role, course_status, and quiz_type enum types are now available in the database
-- The users.role column now uses the role enum type instead of varchar
