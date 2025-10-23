# Performance Optimization Installation Guide

## Prerequisites

- PostgreSQL database
- DATABASE_URL environment variable configured
- Bun or Node.js runtime

## Step 1: Verify Database Connection

Ensure your `.env` file contains the DATABASE_URL:

```bash
# .env
DATABASE_URL="postgresql://user:password@host:port/database"
```

Test the connection:

```bash
# Using bun
bun run drizzle/migrate.ts

# Or using node
node -e "const {Pool}=require('pg');new Pool({connectionString:process.env.DATABASE_URL}).query('SELECT 1').then(()=>console.log('✅ Connected')).catch(e=>console.error('❌',e.message))"
```

## Step 2: Apply Performance Indexes

### Option A: Using the Apply Script (Recommended)

```bash
bun run drizzle/apply-indexes.ts
```

This script:
- Reads the migration file
- Applies each index individually
- Skips indexes that already exist
- Reports success/failure for each index

### Option B: Using psql Directly

If you have psql installed:

```bash
psql $DATABASE_URL -f drizzle/migrations/0007_add_performance_indexes.sql
```

### Option C: Manual Application

Connect to your database and run the SQL file manually:

```sql
-- Copy the contents of drizzle/migrations/0007_add_performance_indexes.sql
-- and execute in your database client
```

## Step 3: Verify Indexes Were Created

```bash
bun run drizzle/verify-indexes.ts
```

Expected output:
```
📊 Indexes by table:

  chapter_progress (4 indexes):
    ✓ idx_chapter_progress_chapter_id
    ✓ idx_chapter_progress_completed_at
    ✓ idx_chapter_progress_student_chapter
    ✓ idx_chapter_progress_student_id

  chapters (1 indexes):
    ✓ idx_chapters_course_order

  courses (5 indexes):
    ✓ idx_courses_domain_id
    ✓ idx_courses_is_active
    ✓ idx_courses_slug
    ✓ idx_courses_teacher_active
    ✓ idx_courses_teacher_id

  ... (and more)

✅ Total performance indexes found: 28
```

## Step 4: Start Using Performance Features

### Enable Caching

```typescript
import { withCache, CacheKeys, CacheTTL } from '@/lib/db/cache';

// Cache static data
const domains = await withCache(
  CacheKeys.domains(),
  CacheTTL.STATIC,
  () => getAllDomains()
);
```

### Add Pagination

```typescript
import { executePaginatedQuery } from '@/lib/db/pagination';

const result = await executePaginatedQuery(
  dataQuery,
  countQuery,
  { page: 1, pageSize: 20 }
);
```

### Enable Profiling (Development)

```typescript
import { profileQuery } from '@/lib/db/profiler';

const result = await profileQuery(
  'queryName',
  () => myQuery(),
  { context: 'info' }
);
```

## Troubleshooting

### "DATABASE_URL not found"

**Problem:** Environment variable not loaded

**Solutions:**
1. Ensure `.env` file exists in project root
2. Check `.env` file contains `DATABASE_URL=...`
3. Restart your terminal/IDE to reload environment
4. For bun: It should auto-load .env files
5. For node: Use `dotenv` package or `node --env-file=.env`

### "role does not exist"

**Problem:** PostgreSQL trying to use system username

**Solutions:**
1. Verify DATABASE_URL is properly formatted:
   ```
   postgresql://username:password@host:port/database
   ```
2. Ensure username and password are correct
3. Test connection with psql:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1"
   ```

### "type already exists" during migration

**Problem:** Old migrations trying to recreate existing types

**Solution:** Use the apply-indexes script instead of full migration:
```bash
bun run drizzle/apply-indexes.ts
```

### "index already exists"

**Problem:** Indexes were already created

**Solution:** This is normal! The script will skip existing indexes. Verify with:
```bash
bun run drizzle/verify-indexes.ts
```

### No indexes found after applying

**Problem:** Script ran but indexes weren't created

**Solutions:**
1. Check for errors in the apply script output
2. Verify database connection is working
3. Check database user has CREATE INDEX permission
4. Try applying manually with psql
5. Check PostgreSQL logs for errors

## Manual Index Creation

If automated scripts fail, you can create indexes manually:

```sql
-- Connect to your database
psql $DATABASE_URL

-- Create indexes one by one
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
-- ... etc

-- Verify
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
```

## Performance Testing

After applying indexes, test the performance improvement:

```typescript
import { profileQuery, logPerformanceReport } from '@/lib/db/profiler';

// Profile some queries
await profileQuery('test1', () => getTeacherDashboard(1));
await profileQuery('test2', () => getStudentCourses(1));

// View report
logPerformanceReport();
```

## Rollback (if needed)

To remove all performance indexes:

```sql
-- List all indexes
SELECT 'DROP INDEX IF EXISTS ' || indexname || ';'
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- Copy the output and execute to drop indexes
```

## Next Steps

1. ✅ Indexes applied
2. ✅ Indexes verified
3. ⏳ Add caching to expensive queries
4. ⏳ Add pagination to list endpoints
5. ⏳ Enable profiling in development
6. ⏳ Monitor performance improvements

## Support

- See [QUICK_START.md](./QUICK_START.md) for usage examples
- See [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) for comprehensive documentation
- See [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) for implementation details
