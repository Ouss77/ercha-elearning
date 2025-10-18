-- Step 1: Create the content_items table
CREATE TABLE IF NOT EXISTS "content_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content_type" varchar(20) NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"content_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Step 2: Add foreign key constraint for content_items
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_chapter_id_chapters_id_fk" 
FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_content_items_chapter" ON "content_items"("chapter_id", "order_index");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chapters_course" ON "chapters"("course_id", "order_index");
--> statement-breakpoint

-- Step 4: Migrate existing chapter content to content_items
-- Only migrate chapters that have content_type and content_data
INSERT INTO "content_items" ("chapter_id", "title", "content_type", "order_index", "content_data", "created_at", "updated_at")
SELECT 
  "id" as "chapter_id",
  "title" as "title",
  "content_type",
  0 as "order_index",
  "content_data",
  "created_at",
  COALESCE("created_at", now()) as "updated_at"
FROM "chapters"
WHERE "content_type" IS NOT NULL AND "content_data" IS NOT NULL;
--> statement-breakpoint

-- Step 5: Add updated_at column to chapters table
ALTER TABLE "chapters" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint

-- Step 6: Update chapters table constraints
ALTER TABLE "chapters" DROP CONSTRAINT IF EXISTS "chapters_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_course_id_courses_id_fk" 
FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Step 7: Update chapters table defaults
ALTER TABLE "chapters" ALTER COLUMN "order_index" SET DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "chapters" ALTER COLUMN "created_at" SET NOT NULL;
--> statement-breakpoint

-- Step 8: Drop deprecated columns from chapters table
ALTER TABLE "chapters" DROP COLUMN IF EXISTS "content_type";
--> statement-breakpoint
ALTER TABLE "chapters" DROP COLUMN IF EXISTS "content_data";
