# Database Performance Optimization Guide

This guide covers the performance optimization features added to the database query layer, including caching, pagination, and profiling.

## Table of Contents

1. [Database Indexes](#database-indexes)
2. [Query Result Caching](#query-result-caching)
3. [Pagination](#pagination)
4. [Query Profiling](#query-profiling)
5. [Best Practices](#best-practices)

## Database Indexes

### Overview

Migration `0007_add_performance_indexes.sql` adds comprehensive indexes to improve query performance across the application.

### Added Indexes

#### Users Table
- `idx_users_email` - For authentication lookups
- `idx_users_role` - For role-based filtering
- `idx_users_is_active` - For active user queries

#### Courses Table
- `idx_courses_teacher_id` - For teacher dashboard queries
- `idx_courses_domain_id` - For domain filtering
- `idx_courses_slug` - For course lookup by slug
- `idx_courses_is_active` - For active course filtering
- `idx_courses_teacher_active` - Composite index for teacher + active queries

#### Enrollments Table
- `idx_enrollments_student_id` - For student dashboard
- `idx_enrollments_course_id` - For course analytics
- `idx_enrollments_student_course` - Prevents duplicate enrollments
- `idx_enrollments_completed_at` - For completion queries
- `idx_enrollments_student_completed` - For student completion status

#### Chapter Progress Table
- `idx_chapter_progress_student_id` - For progress tracking
- `idx_chapter_progress_chapter_id` - For chapter analytics
- `idx_chapter_progress_student_chapter` - Prevents duplicates
- `idx_chapter_progress_completed_at` - For recent activity

#### Quiz Attempts Table
- `idx_quiz_attempts_student_quiz_score` - Optimizes best attempt queries

### Running the Migration

```bash
# Run migrations
npm run db:migrate
# or
pnpm db:migrate
```

## Query Result Caching

### Overview

The caching module provides in-memory caching with TTL (Time To Live) support to reduce database load for frequently accessed data.

### Basic Usage

```typescript
import { withCache, CacheKeys, CacheTTL } from '@/lib/db/cache';
import { getUserById } from '@/lib/db/user-queries';

// Cache user data for 5 minutes
const result = await withCache(
  CacheKeys.user(userId),
  CacheTTL.STATIC,
  () => getUserById(userId)
);
```

### Cache Key Builders

Pre-defined cache key builders ensure consistent naming:

```typescript
import { CacheKeys } from '@/lib/db/cache';

// User keys
CacheKeys.user(1)                    // "user:1"
CacheKeys.userByEmail("user@example.com")  // "user:email:user@example.com"

// Course keys
CacheKeys.course(10)                 // "course:10"
CacheKeys.courseWithDetails(10)      // "course:details:10"
CacheKeys.coursesByTeacher(5)        // "courses:teacher:5"

// Dashboard keys
CacheKeys.teacherDashboard(5)        // "dashboard:teacher:5"
```

### Cache Invalidation

Invalidate cache when data changes:

```typescript
import { CacheInvalidation } from '@/lib/db/cache';

// After updating a course
await updateCourse(courseId, data);
CacheInvalidation.onCourseUpdate(courseId, teacherId);

// After creating an enrollment
await createEnrollment({ studentId, courseId });
CacheInvalidation.onEnrollmentUpdate(studentId, courseId);

// After updating progress
await markChapterComplete(studentId, chapterId);
CacheInvalidation.onProgressUpdate(studentId, courseId);
```

### TTL Recommendations

```typescript
import { CacheTTL } from '@/lib/db/cache';

CacheTTL.STATIC      // 5 minutes - for rarely changing data (domains, course metadata)
CacheTTL.FREQUENT    // 2 minutes - for frequently accessed data (courses, users)
CacheTTL.REALTIME    // 30 seconds - for real-time data (progress, activity)
CacheTTL.DASHBOARD   // 1 minute - for dashboard aggregations
CacheTTL.LIST        // 3 minutes - for list queries
```

### Cache Statistics

Monitor cache performance:

```typescript
import { getCacheStats } from '@/lib/db/cache';

const stats = getCacheStats();
console.log(`Cache hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
console.log(`Cache size: ${stats.size} entries`);
```

### Example: Caching Dashboard Data

```typescript
import { withCache, CacheKeys, CacheTTL, CacheInvalidation } from '@/lib/db/cache';
import { getTeacherDashboardSummary } from '@/lib/db/queries';

// In your API route or component
export async function getTeacherDashboard(teacherId: number) {
  return withCache(
    CacheKeys.teacherDashboard(teacherId),
    CacheTTL.DASHBOARD,
    () => getTeacherDashboardSummary(teacherId)
  );
}

// Invalidate when relevant data changes
export async function onStudentProgress(studentId: number, courseId: number) {
  // ... update progress ...
  
  // Invalidate teacher dashboard cache
  const course = await getCourseById(courseId);
  if (course.success && course.data?.teacherId) {
    CacheInvalidation.onProgressUpdate(studentId, courseId);
  }
}
```

## Pagination

### Overview

The pagination module provides utilities for both offset-based and cursor-based pagination.

### Offset-Based Pagination

Best for: Small to medium datasets, user-facing page numbers

```typescript
import { executePaginatedQuery, validatePaginationParams } from '@/lib/db/pagination';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

// In your API route
export async function getStudents(page: number, pageSize: number) {
  const params = validatePaginationParams({ page, pageSize });
  
  const dataQuery = db
    .select()
    .from(users)
    .where(eq(users.role, 'STUDENT'));
  
  const countQuery = db
    .select({ count: sql`count(*)` })
    .from(users)
    .where(eq(users.role, 'STUDENT'));
  
  return executePaginatedQuery(dataQuery, countQuery, params);
}

// Response format:
// {
//   success: true,
//   data: {
//     items: [...],
//     meta: {
//       page: 1,
//       pageSize: 20,
//       totalItems: 150,
//       totalPages: 8,
//       hasNextPage: true,
//       hasPreviousPage: false
//     }
//   }
// }
```

### Manual Pagination

For more control:

```typescript
import { 
  applyPagination, 
  createPaginatedResult,
  calculateOffset 
} from '@/lib/db/pagination';

const params = { page: 2, pageSize: 20 };

// Apply pagination to query
const query = db.select().from(users);
const paginatedQuery = applyPagination(query, params);
const items = await paginatedQuery;

// Get total count
const countResult = await db.select({ count: sql`count(*)` }).from(users);
const totalItems = Number(countResult[0].count);

// Create paginated result
const result = createPaginatedResult(items, totalItems, params);
```

### Cursor-Based Pagination

Best for: Large datasets, infinite scroll, real-time feeds

```typescript
import { 
  applyCursorPagination, 
  createCursorPaginatedResult 
} from '@/lib/db/pagination';
import { db } from '@/lib/db';
import { posts } from '@/drizzle/schema';

export async function getPosts(cursor?: number, limit: number = 20) {
  let query = db.select().from(posts);
  
  // Apply cursor pagination
  query = applyCursorPagination(query, posts.id, {
    cursor,
    limit,
    direction: 'forward'
  });
  
  const items = await query;
  
  // Create cursor-paginated result
  const result = createCursorPaginatedResult(
    items,
    limit,
    (item) => item.id
  );
  
  return { success: true, data: result };
}

// Response format:
// {
//   success: true,
//   data: {
//     items: [...],
//     meta: {
//       nextCursor: 120,
//       previousCursor: 100,
//       hasMore: true,
//       count: 20
//     }
//   }
// }
```

### Adding Pagination to Existing Queries

```typescript
// Before: Returns all results
export async function getAllCourses() {
  const result = await db.select().from(courses);
  return { success: true, data: result };
}

// After: Returns paginated results
export async function getAllCourses(page: number = 1, pageSize: number = 20) {
  const params = validatePaginationParams({ page, pageSize });
  
  const dataQuery = db.select().from(courses);
  const countQuery = db.select({ count: sql`count(*)` }).from(courses);
  
  return executePaginatedQuery(dataQuery, countQuery, params);
}
```

## Query Profiling

### Overview

The profiler module tracks query execution times and helps identify performance bottlenecks.

### Basic Usage

```typescript
import { profileQuery } from '@/lib/db/profiler';
import { getUserById } from '@/lib/db/user-queries';

// Profile a single query
const result = await profileQuery(
  'getUserById',
  () => getUserById(userId),
  { userId }  // Optional context for debugging
);
```

### Viewing Performance Reports

```typescript
import { 
  logPerformanceReport,
  getQueryStats,
  getSlowestQueries 
} from '@/lib/db/profiler';

// Log full report to console
logPerformanceReport();

// Get statistics programmatically
const stats = getQueryStats();
stats.forEach(stat => {
  console.log(`${stat.queryName}: ${stat.avgTime.toFixed(2)}ms avg`);
});

// Get slowest queries
const slowest = getSlowestQueries(5);
slowest.forEach(query => {
  console.log(`${query.queryName}: ${query.executionTime}ms`);
});
```

### Configuration

```typescript
import { configureProfiler } from '@/lib/db/profiler';

configureProfiler({
  enabled: true,
  slowQueryThreshold: 500,  // Warn if query takes > 500ms
  maxMetrics: 2000,         // Store up to 2000 metrics
  logSlowQueries: true      // Log slow queries to console
});
```

### Profiling in Development

Add profiling to your query functions:

```typescript
import { profileQuery } from '@/lib/db/profiler';

export async function getTeacherDashboard(teacherId: number) {
  return profileQuery(
    'getTeacherDashboard',
    () => getTeacherDashboardSummary(teacherId),
    { teacherId }
  );
}
```

### Creating a Performance Monitoring Endpoint

```typescript
// app/api/admin/performance/route.ts
import { 
  generatePerformanceReport,
  getQueryStats,
  getSlowestQueries,
  getSlowQueries,
  clearProfiler
} from '@/lib/db/profiler';
import { getCacheStats } from '@/lib/db/cache';

export async function GET() {
  const report = {
    queries: getQueryStats(),
    slowest: getSlowestQueries(10),
    slow: getSlowQueries(),
    cache: getCacheStats(),
    textReport: generatePerformanceReport()
  };
  
  return Response.json(report);
}

export async function DELETE() {
  clearProfiler();
  return Response.json({ success: true });
}
```

## Best Practices

### 1. Use Indexes Wisely

```typescript
// ✅ Good: Query uses indexed column
const users = await db
  .select()
  .from(users)
  .where(eq(users.email, email));  // email is indexed

// ❌ Bad: Query on non-indexed column
const users = await db
  .select()
  .from(users)
  .where(eq(users.bio, searchTerm));  // bio is not indexed
```

### 2. Cache Expensive Queries

```typescript
// ✅ Good: Cache dashboard aggregations
const dashboard = await withCache(
  CacheKeys.teacherDashboard(teacherId),
  CacheTTL.DASHBOARD,
  () => getTeacherDashboardSummary(teacherId)
);

// ❌ Bad: No caching for expensive aggregation
const dashboard = await getTeacherDashboardSummary(teacherId);
```

### 3. Paginate Large Result Sets

```typescript
// ✅ Good: Paginated query
const result = await executePaginatedQuery(
  dataQuery,
  countQuery,
  { page: 1, pageSize: 20 }
);

// ❌ Bad: Fetching all results
const allUsers = await db.select().from(users);  // Could be thousands
```

### 4. Invalidate Cache on Updates

```typescript
// ✅ Good: Invalidate related cache entries
await updateCourse(courseId, data);
CacheInvalidation.onCourseUpdate(courseId, teacherId);

// ❌ Bad: Stale cache data
await updateCourse(courseId, data);
// Cache still has old data
```

### 5. Profile in Development

```typescript
// ✅ Good: Profile queries during development
if (process.env.NODE_ENV === 'development') {
  return profileQuery('complexQuery', () => complexQuery());
}

// ❌ Bad: No visibility into query performance
return complexQuery();
```

### 6. Use Composite Indexes

```typescript
// ✅ Good: Query uses composite index (student_id, course_id)
const enrollment = await db
  .select()
  .from(enrollments)
  .where(
    and(
      eq(enrollments.studentId, studentId),
      eq(enrollments.courseId, courseId)
    )
  );

// ❌ Bad: Separate queries
const byStudent = await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
const filtered = byStudent.filter(e => e.courseId === courseId);
```

### 7. Avoid N+1 Queries

```typescript
// ✅ Good: Single query with join
const coursesWithTeachers = await db
  .select()
  .from(courses)
  .leftJoin(users, eq(courses.teacherId, users.id));

// ❌ Bad: N+1 queries
const courses = await db.select().from(courses);
for (const course of courses) {
  const teacher = await db.select().from(users).where(eq(users.id, course.teacherId));
}
```

### 8. Use Parallel Queries

```typescript
// ✅ Good: Parallel execution
const [courses, students, activity] = await Promise.all([
  getTeacherCourses(teacherId),
  getTeacherStudents(teacherId),
  getTeacherActivity(teacherId)
]);

// ❌ Bad: Sequential execution
const courses = await getTeacherCourses(teacherId);
const students = await getTeacherStudents(teacherId);
const activity = await getTeacherActivity(teacherId);
```

## Performance Monitoring Checklist

- [ ] Database indexes are in place for frequently queried columns
- [ ] Expensive queries are cached with appropriate TTL
- [ ] Large result sets are paginated
- [ ] Cache is invalidated when data changes
- [ ] Query profiling is enabled in development
- [ ] Slow queries are identified and optimized
- [ ] N+1 queries are eliminated
- [ ] Parallel queries are used where possible
- [ ] Composite indexes are used for multi-column queries
- [ ] Performance metrics are monitored in production

## Troubleshooting

### Slow Queries

1. Enable profiling and identify slow queries
2. Check if appropriate indexes exist
3. Consider adding caching
4. Optimize query structure (reduce joins, use aggregations)
5. Add pagination if returning large result sets

### High Cache Miss Rate

1. Check if TTL is too short
2. Verify cache keys are consistent
3. Ensure cache invalidation isn't too aggressive
4. Consider increasing cache size

### Memory Issues

1. Reduce cache size limit
2. Decrease TTL values
3. Clear profiler metrics periodically
4. Use cursor-based pagination for large datasets

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Database Performance Best Practices](https://www.postgresql.org/docs/current/performance-tips.html)
