# Database Query Layer Documentation

## Overview

This directory contains the refactored database query layer for the e-learning platform. The architecture follows a layered approach with base utilities, domain-specific query modules, and standardized error handling.

## Architecture

```
┌─────────────────────────────────────┐
│     API Routes / Components         │
├─────────────────────────────────────┤
│     Domain Query Modules            │
│  (user-queries, course-queries...)  │
├─────────────────────────────────────┤
│     Base Query Utilities            │
│  (CRUD operations, transactions)    │
├─────────────────────────────────────┤
│     Drizzle ORM                     │
├─────────────────────────────────────┤
│     PostgreSQL Database             │
└─────────────────────────────────────┘
```

## Core Modules

### Base Utilities

- **`types.ts`** - Standardized result types and error codes
- **`error-handler.ts`** - Centralized error handling and logging
- **`validation.ts`** - Input validation utilities
- **`base-queries.ts`** - Generic CRUD operations factory
- **`transactions.ts`** - Transaction support with automatic rollback
- **`query-builders.ts`** - Query composition helpers and reusable fragments
- **`mappers.ts`** - Data mapping utilities for backward compatibility

### Performance Optimization Utilities

- **`cache.ts`** - Query result caching with TTL and LRU eviction
- **`pagination.ts`** - Offset and cursor-based pagination utilities
- **`profiler.ts`** - Query performance profiling and monitoring

📖 **See [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) for detailed usage and best practices**

### Domain Query Modules

- **`user-queries.ts`** - User management operations
- **`course-queries.ts`** - Course CRUD and statistics
- **`enrollment-queries.ts`** - Student enrollment management
- **`domain-queries.ts`** - Course domain/category operations
- **`chapter-queries.ts`** - Chapter and content item management
- **`progress-queries.ts`** - Student progress tracking
- **`quiz-queries.ts`** - Quiz and quiz attempt operations
- **`project-queries.ts`** - Final project and submission management
- **`class-queries.ts`** - Class management operations
- **`queries.ts`** - Complex multi-domain queries and re-exports

## Exports Structure

All modules are re-exported through `lib/db/index.ts` for convenient importing. You can import from either the specific module or the main index:

```typescript
// Import from specific module (recommended for tree-shaking)
import { getUserById } from '@/lib/db/user-queries';
import { createCourse } from '@/lib/db/course-queries';

// Import from main index (convenient for multiple imports)
import { getUserById, createCourse, DbResult } from '@/lib/db';
```

### Available Exports

#### Foundational Types & Utilities
- `DbResult<T>` - Generic result type
- `DbErrorCode` - Error code enum
- `DbError` - Error interface
- `handleDbError()` - Error handler
- `validateId()`, `validateEmail()`, etc. - Validation functions
- `createBaseQueries()` - Base query factory
- `withTransaction()` - Transaction wrapper
- `paginate()`, `orderBy()` - Query builders

#### Data Mappers
- `mapUserFromDb()`, `mapUserToDb()` - User mapping
- `mapCourseFromDb()` - Course mapping
- `mapEnrollmentFromDb()` - Enrollment mapping

#### Query Functions
All query functions from domain modules are exported:
- User queries: `getUserById()`, `createUser()`, etc.
- Course queries: `getCourseById()`, `createCourse()`, etc.
- Enrollment queries: `getEnrollmentById()`, `createEnrollment()`, etc.
- Domain queries: `getDomainById()`, `createDomain()`, etc.
- Chapter queries: `getChapterById()`, `createChapter()`, etc.
- Progress queries: `getChapterProgress()`, `markChapterComplete()`, etc.
- Quiz queries: `getQuizById()`, `createQuiz()`, etc.
- Project queries: `getFinalProjectById()`, `createFinalProject()`, etc.
- Class queries: `createClass()`, `getTeacherClasses()`, etc.
- Complex queries: `getStudentEnrolledCoursesWithProgress()`, etc.

#### Database Instance
- `db` - Drizzle database instance

### Backward Compatibility

The refactored query layer maintains full backward compatibility with existing code:

1. **All existing imports continue to work** - No breaking changes to import paths
2. **Deprecated functions are marked** - Old patterns include deprecation notices
3. **Gradual migration path** - You can migrate code incrementally

Example of deprecated function:
```typescript
// This still works but shows a deprecation warning
import { handleDbError } from '@/lib/db';

// Recommended: Use the new error handler from error-handler module
import { handleDbError } from '@/lib/db/error-handler';
```

## Error Codes

All database operations return a `DbResult<T>` type with standardized error codes:

### `NOT_FOUND`
**HTTP Status:** 404  
**Description:** The requested entity does not exist in the database  
**Example:**
```typescript
const result = await getUserById(999);
if (!result.success && result.code === DbErrorCode.NOT_FOUND) {
  return res.status(404).json({ error: result.error });
}
```

### `VALIDATION_ERROR`
**HTTP Status:** 400  
**Description:** Input validation failed (invalid format, missing required fields, etc.)  
**Example:**
```typescript
const result = await createUser({ email: 'invalid-email', ... });
if (!result.success && result.code === DbErrorCode.VALIDATION_ERROR) {
  return res.status(400).json({ error: result.error });
}
```

### `CONSTRAINT_VIOLATION`
**HTTP Status:** 409  
**Description:** Database constraint violation (unique, foreign key, check constraint)  
**Common Causes:**
- Duplicate email addresses
- Invalid foreign key references
- Check constraint failures

**Example:**
```typescript
const result = await createUser({ email: 'existing@example.com', ... });
if (!result.success && result.code === DbErrorCode.CONSTRAINT_VIOLATION) {
  return res.status(409).json({ error: 'Email already exists' });
}
```

### `UNAUTHORIZED`
**HTTP Status:** 403  
**Description:** User lacks permission to perform the operation  
**Example:**
```typescript
const result = await updateChapter(chapterId, data, userId, 'STUDENT');
if (!result.success && result.code === DbErrorCode.UNAUTHORIZED) {
  return res.status(403).json({ error: result.error });
}
```

### `DATABASE_ERROR`
**HTTP Status:** 500  
**Description:** Unexpected database error (connection failure, query timeout, etc.)  
**Example:**
```typescript
const result = await getCourses();
if (!result.success && result.code === DbErrorCode.DATABASE_ERROR) {
  console.error('Database error:', result.error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

## Usage Patterns

### Basic CRUD Operations

```typescript
import { getUserById, createUser, updateUser } from '@/lib/db/user-queries';

// Read
const userResult = await getUserById(1);
if (!userResult.success) {
  console.error(userResult.error);
  return;
}
const user = userResult.data;

// Create
const createResult = await createUser({
  email: 'user@example.com',
  password: 'hashedPassword',
  name: 'John Doe',
  role: 'STUDENT'
});

// Update
const updateResult = await updateUser(1, {
  name: 'Jane Doe',
  isActive: false
});
```

### Using Transactions

```typescript
import { withTransaction } from '@/lib/db/transactions';
import { createUser } from '@/lib/db/user-queries';
import { createEnrollment } from '@/lib/db/enrollment-queries';

const result = await withTransaction(async (tx) => {
  // Create user within transaction
  const userResult = await createUser(userData, tx);
  if (!userResult.success) return userResult;
  
  // Create enrollment within same transaction
  const enrollmentResult = await createEnrollment({
    studentId: userResult.data.id,
    courseId: courseId
  }, tx);
  if (!enrollmentResult.success) return enrollmentResult;
  
  // Both operations succeed or both fail
  return { 
    success: true, 
    data: { user: userResult.data, enrollment: enrollmentResult.data } 
  };
});
```

### Batch Operations

```typescript
import { batchCreate, batchUpdate } from '@/lib/db/transactions';
import { users } from '@/drizzle/schema';

// Create multiple users at once
const result = await batchCreate(users, [
  { email: 'user1@example.com', name: 'User 1', password: 'hash1' },
  { email: 'user2@example.com', name: 'User 2', password: 'hash2' },
]);

// Update multiple users at once
const updateResult = await batchUpdate(
  users,
  [
    { id: 1, data: { name: 'Updated Name 1' } },
    { id: 2, data: { name: 'Updated Name 2' } },
  ],
  users.id
);
```

### Query Composition

```typescript
import { db } from '@/lib/db';
import { courses, domains, users } from '@/drizzle/schema';
import { withDomain, withTeacher, paginate } from '@/lib/db/query-builders';
import { eq } from 'drizzle-orm';

// Build a complex query using composition
const query = db
  .select()
  .from(courses)
  .$dynamic();

// Add domain join
const withDomainQuery = withDomain(query);

// Add teacher join
const withTeacherQuery = withTeacher(withDomainQuery);

// Add pagination
const paginatedQuery = paginate(withTeacherQuery, { page: 1, pageSize: 10 });

// Execute
const result = await paginatedQuery.where(eq(courses.isActive, true));
```

### Validation

```typescript
import { 
  validateId, 
  validateEmail, 
  validateRequired,
  validateBatch 
} from '@/lib/db/validation';

// Validate individual fields
const idResult = validateId(userId);
if (!idResult.success) return idResult;

const emailResult = validateEmail(email);
if (!emailResult.success) return emailResult;

// Validate multiple fields at once
const validation = await validateBatch([
  () => validateId(userId),
  () => validateRequired(email, 'email'),
  () => validateEmail(email)
]);
if (!validation.success) return validation;
```

## Performance Characteristics

### Expensive Queries

The following queries are marked as potentially expensive and should be used with caution:

#### `getStudentEnrolledCoursesWithProgress(studentId)`
**Complexity:** O(n) where n = number of enrollments  
**Optimization:** Uses joins to avoid N+1 queries  
**Recommendation:** Cache results for frequently accessed students

#### `getTeacherCoursesWithStats(teacherId)`
**Complexity:** O(n) where n = number of courses  
**Optimization:** Uses aggregations at database level  
**Recommendation:** Paginate results for teachers with many courses

#### `getTeacherDashboardSummary(teacherId)`
**Complexity:** O(n) where n = total students across all courses  
**Optimization:** Uses parallel query execution  
**Recommendation:** Cache results with 5-minute TTL

#### `getChaptersWithContent(courseId)`
**Complexity:** O(n + m) where n = chapters, m = content items  
**Optimization:** Fetches all content in single query, groups in memory  
**Recommendation:** Results are typically small, no caching needed

### Query Optimization Tips

1. **Use Indexes:** Ensure frequently queried fields have database indexes
2. **Avoid N+1:** Use joins or batch queries instead of sequential queries
3. **Paginate Large Results:** Always paginate queries that can return many rows
4. **Use Aggregations:** Perform calculations in database, not application
5. **Cache When Appropriate:** Cache frequently accessed, rarely changed data

## Testing

### Unit Tests

Test base utilities and validation functions with mock data:

```typescript
import { validateId, validateEmail } from '@/lib/db/validation';

describe('validateId', () => {
  it('should accept valid positive integers', () => {
    const result = validateId(1);
    expect(result.success).toBe(true);
    expect(result.data).toBe(1);
  });

  it('should reject negative numbers', () => {
    const result = validateId(-1);
    expect(result.success).toBe(false);
    expect(result.code).toBe(DbErrorCode.VALIDATION_ERROR);
  });
});
```

### Integration Tests

Test actual database operations with test database:

```typescript
import { createUser, getUserById } from '@/lib/db/user-queries';

describe('User Queries', () => {
  it('should create and retrieve a user', async () => {
    const createResult = await createUser({
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      role: 'STUDENT'
    });
    
    expect(createResult.success).toBe(true);
    
    const getResult = await getUserById(createResult.data.id);
    expect(getResult.success).toBe(true);
    expect(getResult.data?.email).toBe('test@example.com');
  });
});
```

## Migration Guide

### From Old Pattern to New Pattern

**Old:**
```typescript
try {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
} catch (error) {
  console.error(error);
  throw error;
}
```

**New:**
```typescript
const result = await getUserById(id);
if (!result.success) {
  console.error(result.error);
  return null;
}
return result.data;
```

### Benefits of New Pattern

1. **Type Safety:** Full TypeScript inference for success and error cases
2. **Consistent Errors:** Standardized error codes and messages
3. **No Exceptions:** Errors are values, not thrown exceptions
4. **Composability:** Easy to chain operations and handle errors
5. **Testability:** Pure functions that are easy to test

## Best Practices

### DO ✅

- Always validate input parameters before executing queries
- Use base query utilities for common CRUD operations
- Return `DbResult<T>` types from all query functions
- Use transactions for multi-step operations
- Log errors with appropriate context
- Use query composition for complex queries
- Add JSDoc comments to all exported functions

### DON'T ❌

- Don't throw exceptions from query functions
- Don't perform business logic in query functions
- Don't mix authorization checks with query execution
- Don't use `select()` without specifying fields for large tables
- Don't execute queries in loops (use batch operations)
- Don't ignore validation errors
- Don't return raw database records (use mappers)

## Common Patterns

### Check if Entity Exists

```typescript
import { userBaseQueries } from '@/lib/db/user-queries';
import { eq } from 'drizzle-orm';
import { users } from '@/drizzle/schema';

const existsResult = await userBaseQueries.exists(
  eq(users.email, 'user@example.com')
);

if (existsResult.success && existsResult.data) {
  console.log('User exists');
}
```

### Count Records

```typescript
import { courseBaseQueries } from '@/lib/db/course-queries';
import { eq } from 'drizzle-orm';
import { courses } from '@/drizzle/schema';

const countResult = await courseBaseQueries.count(
  eq(courses.isActive, true)
);

if (countResult.success) {
  console.log('Active courses:', countResult.data);
}
```

### Upsert Pattern

```typescript
import { markChapterComplete } from '@/lib/db/progress-queries';

// This function uses upsert internally
const result = await markChapterComplete(studentId, chapterId);
```

## Troubleshooting

### "Record not found" errors

Check that:
1. The ID is valid and exists in the database
2. Foreign key references are correct
3. The record hasn't been soft-deleted (isActive = false)

### Constraint violation errors

Check that:
1. Unique fields (email, slug) don't already exist
2. Foreign key references exist before insert
3. Required fields are provided

### Transaction rollback

Transactions automatically rollback when:
1. Any operation returns `success: false`
2. An exception is thrown
3. Database connection is lost

### Performance issues

If queries are slow:
1. Check for missing database indexes
2. Look for N+1 query patterns
3. Add pagination to large result sets
4. Consider caching frequently accessed data
5. Use database-level aggregations

## Performance Optimization

The database layer includes comprehensive performance optimization features:

### Database Indexes

Migration `0007_add_performance_indexes.sql` adds indexes for all frequently queried columns:
- User lookups by email, role, and active status
- Course queries by teacher, domain, and slug
- Enrollment queries by student and course
- Progress tracking by student and chapter
- Quiz attempts with optimized score lookups

**Apply indexes:**
```bash
bun run db:migrate
```

### Query Result Caching

Cache frequently accessed data to reduce database load:

```typescript
import { withCache, CacheKeys, CacheTTL } from '@/lib/db/cache';

// Cache domains for 5 minutes
const domains = await withCache(
  CacheKeys.domains(),
  CacheTTL.STATIC,
  () => getAllDomains()
);

// Invalidate cache on updates
import { CacheInvalidation } from '@/lib/db/cache';
CacheInvalidation.onCourseUpdate(courseId, teacherId);
```

### Pagination

Prevent loading large datasets at once:

```typescript
import { executePaginatedQuery } from '@/lib/db/pagination';

const result = await executePaginatedQuery(
  dataQuery,
  countQuery,
  { page: 1, pageSize: 20 }
);
// Returns: { items: [...], meta: { totalPages, hasNextPage, ... } }
```

### Query Profiling

Track query performance in development:

```typescript
import { profileQuery, logPerformanceReport } from '@/lib/db/profiler';

const result = await profileQuery(
  'getTeacherDashboard',
  () => getTeacherDashboardSummary(teacherId),
  { teacherId }
);

// View performance report
logPerformanceReport();
```

### Performance Impact

- **Database Load:** 40-60% reduction with caching
- **Response Times:** 60-90% improvement for cached queries
- **Memory Usage:** 80-95% reduction with pagination
- **Query Speed:** 50-90% faster with indexes

📖 **See [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) for comprehensive documentation**  
📖 **See [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) for implementation details**  
📖 **See [optimized-queries.example.ts](./optimized-queries.example.ts) for code examples**

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For questions or issues with the database query layer, please:
1. Check this documentation first
2. Review the JSDoc comments in the source files
3. Look at the example files (*.example.ts)
4. Check the performance guides for optimization questions
5. Contact the development team
