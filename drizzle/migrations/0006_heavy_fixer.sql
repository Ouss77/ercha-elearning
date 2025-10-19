-- Add slug column as nullable first
ALTER TABLE "courses" ADD COLUMN "slug" varchar(255);--> statement-breakpoint

-- Generate slugs for existing courses
UPDATE "courses" SET "slug" = 
  regexp_replace(
    regexp_replace(
      lower(
        translate(
          "title",
          'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
          'aaaaaaaceeeeiiiidnoooooouuuuypy'
        )
      ),
      '[^a-z0-9]+', '-', 'g'
    ),
    '^-+|-+$', '', 'g'
  );--> statement-breakpoint

-- Handle duplicate slugs by appending course id
UPDATE "courses" 
SET "slug" = "slug" || '-' || "id"
WHERE "slug" IN (
  SELECT "slug" 
  FROM "courses" 
  GROUP BY "slug" 
  HAVING COUNT(*) > 1
);--> statement-breakpoint

-- Now make slug NOT NULL and add unique constraint
ALTER TABLE "courses" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_slug_unique" UNIQUE("slug");
