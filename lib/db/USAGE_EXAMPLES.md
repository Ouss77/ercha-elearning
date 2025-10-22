# Database Query Layer - Usage Examples

This document provides comprehensive examples of common patterns and use cases for the refactored database query layer.

## Table of Contents

1. [Basic CRUD Operations](#basic-crud-operations)
2. [Validation Patterns](#validation-patterns)
3. [Transaction Usage](#transaction-usage)
4. [Query Composition](#query-composition)
5. [Error Handling](#error-handling)
6. [Pagination](#pagination)
7. [Complex Queries](#complex-queries)
8. [Performance Optimization](#performance-optimization)

## Basic CRUD Operations

### Creating Records

```typescript
import { createUser } from '@/lib/db/user-queries';

// Create a new user
const result = await createUser({
  email: 'student@example.com',
  password: 'hashedPassword123',
  name: 'John Doe',
  role: 'STUDENT'
});

if (result.success) {
  console.log('User created:', result.data.id);
} else {
  console.error('Error:', result.error);
  // Handle specific error codes
  if (result.code === 'CONSTRAINT_VIOLATION') {
    console.log('Email already exists');
  }
}
```

### Reading Records

```typescript
import { getUserById, getAllUsers } from '@/lib/db/user-queries';

// Get single user
const userResult = await getUserById(1);
if (userResult.success && userResult.data) {
  console.log('User:', userResult.data.name);
}

// Get all users with role filter
const studentsResult = await getAllUsers('STUDENT');
if (studentsResult.success) {
  console.log('Total students:', studentsResult.data.length);
}
```

### Updating Records

```typescript
import { updateUser } from '@/lib/db/user-queries';

const result = await updateUser(1, {
  name: 'Jane Doe',
  isActive: false
});

if (result.success) {
  console.log('User updated:', result.data);
}
```

### Deleting Records

```typescript
import { deleteCourse } from '@/lib/db/course-queries';

const result = await deleteCourse(courseId);
if (result.success) {
  console.log('Course deleted');
} else if (result.code === 'NOT_FOUND') {
  console.log('Course not found');
}
```

## Validation Patterns

### Validating Individual Fields

```typescript
import { 
  validateId, 
  validateEmail, 
  validateString,
  validateRequired 
} from '@/lib/db/validation';

// Validate ID
const idResult = validateId(userId);
if (!idResult.success) {
  return { success: false, error: idResult.error };
}

// Validate email
const emailResult = validateEmail('user@example.com');
if (!emailResult.success) {
  return { success: false, error: emailResult.error };
}

// Validate string with constraints
const nameResult = validateString(name, 'name', { 
  minLength: 2, 
  maxLength: 100 
});
```

### Batch Validation

```typescript
import { validateBatch } from '@/lib/db/validation';

// Validate multiple fields at once
const validation = await validateBatch([
  () => validateId(userId),
  () => validateEmail(email),
  () => validateString(name, 'name', { minLength: 2 }),
  () => validateForeignKey(courses, courses.id, courseId, 'courseId')
]);

if (!validation.success) {
  return validation; // Returns first error encountered
}

// All validations passed
const [validUserId, validEmail, validName, courseExists] = validation.data;
```

### Foreign Key Validation

```typescript
import { validateForeignKey } from '@/lib/db/validation';
import { courses, users } from '@/drizzle/schema';

// Validate that a course exists before creating enrollment
const courseExists = await validateForeignKey(
  courses,
  courses.id,
  courseId,
  'courseId'
);

if (!courseExists.success) {
  return courseExists; // Returns validation error
}
```

## Transaction Usage

### Simple Transaction

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
    data: { 
      user: userResult.data, 
      enrollment: enrollmentResult.data 
    } 
  };
});
```

### Batch Operations in Transaction

```typescript
import { batchCreate, batchUpdate } from '@/lib/db/transactions';
import { users } from '@/drizzle/schema';

// Create multiple users atomically
const createResult = await batchCreate(users, [
  { email: 'user1@example.com', name: 'User 1', password: 'hash1', role: 'STUDENT' },
  { email: 'user2@example.com', name: 'User 2', password: 'hash2', role: 'STUDENT' },
  { email: 'user3@example.com', name: 'User 3', password: 'hash3', role: 'STUDENT' },
]);

if (createResult.success) {
  console.log('Created users:', createResult.data.length);
}

// Update multiple users atomically
const updateResult = await batchUpdate(
  users,
  [
    { id: 1, data: { name: 'Updated Name 1' } },
    { id: 2, data: { name: 'Updated Name 2' } },
  ],
  users.id
);
```

### Complex Transaction with Validation

```typescript
import { withTransaction } from '@/lib/db/transactions';

const result = await withTransaction(async (tx) => {
  // Validate business rules
  const teacher = await tx
    .select()
    .from(users)
    .where(eq(users.id, teacherId))
    .limit(1);

  if (teacher.length === 0) {
    return { success: false, error: 'Teacher not found' };
  }

  if (teacher[0].role !== 'TRAINER') {
    return { success: false, error: 'User is not a trainer' };
  }

  // Perform updates
  const courseResult = await tx
    .update(courses)
    .set({ teacherId: teacherId })
    .where(eq(courses.id, courseId))
    .returning();

  if (courseResult.length === 0) {
    return { success: false, error: 'Course not found' };
  }

  return { success: true, data: courseResult[0] };
});
```

## Query Composition

### Using Query Fragments

```typescript
import { db } from '@/lib/db';
import { courses } from '@/drizzle/schema';
import { 
  withDomain, 
  withTeacher, 
  activeFilter,
  orderBy 
} from '@/lib/db/query-builders';
import { eq } from 'drizzle-orm';

// Build query using composition
const query = db
  .select()
  .from(courses)
  .$dynamic();

// Add domain join
const withDomainQuery = withDomain(query);

// Add teacher join
const withTeacherQuery = withTeacher(withDomainQuery);

// Add filters
const filteredQuery = withTeacherQuery.where(activeFilter(courses));

// Add sorting
const sortedQuery = orderBy(filteredQuery, courses.createdAt, 'desc');

// Execute
const result = await sortedQuery;
```

### Using Pre-built Query Fragments

```typescript
import { 
  courseWithStatsBase,
  courseWithDetailsBase,
  enrollmentWithDetailsBase 
} from '@/lib/db/query-builders';
import { eq } from 'drizzle-orm';

// Get course with statistics
const courseStats = await courseWithStatsBase()
  .where(eq(courses.id, courseId))
  .limit(1);

// Get course with full details
const courseDetails = await courseWithDetailsBase()
  .where(eq(courses.id, courseId))
  .limit(1);

// Get enrollments with student and course details
const enrollments = await enrollmentWithDetailsBase()
  .where(eq(enrollments.studentId, studentId));
```

### Using Aggregation Helpers

```typescript
import { 
  enrollmentCountSql,
  chapterCountSql,
  completionPercentageSql 
} from '@/lib/db/query-builders';
import { db } from '@/lib/db';
import { courses, enrollments, chapters } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

const result = await db
  .select({
    courseId: courses.id,
    courseTitle: courses.title,
    enrollmentCount: enrollmentCountSql(),
    chapterCount: chapterCountSql(),
    completionRate: completionPercentageSql()
  })
  .from(courses)
  .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
  .leftJoin(chapters, eq(courses.id, chapters.courseId))
  .groupBy(courses.id);
```

## Error Handling

### Handling Specific Error Codes

```typescript
import { DbErrorCode } from '@/lib/db/types';
import { createUser } from '@/lib/db/user-queries';

const result = await createUser(userData);

if (!result.success) {
  switch (result.code) {
    case DbErrorCode.VALIDATION_ERROR:
      return res.status(400).json({ error: result.error });
    
    case DbErrorCode.CONSTRAINT_VIOLATION:
      return res.status(409).json({ error: 'Email already exists' });
    
    case DbErrorCode.NOT_FOUND:
      return res.status(404).json({ error: result.error });
    
    case DbErrorCode.UNAUTHORIZED:
      return res.status(403).json({ error: result.error });
    
    case DbErrorCode.DATABASE_ERROR:
    default:
      console.error('Database error:', result.error);
      return res.status(500).json({ error: 'Internal server error' });
  }
}

// Success case
return res.status(201).json(result.data);
```

### Early Return Pattern

```typescript
async function enrollStudent(studentId: number, courseId: number) {
  // Validate student exists
  const student = await getUserById(studentId);
  if (!student.success) return student;
  if (!student.data) {
    return { success: false, error: 'Student not found', code: 'NOT_FOUND' };
  }

  // Validate course exists
  const course = await getCourseById(courseId);
  if (!course.success) return course;
  if (!course.data) {
    return { success: false, error: 'Course not found', code: 'NOT_FOUND' };
  }

  // Create enrollment
  return createEnrollment({ studentId, courseId });
}
```

### Chaining Operations

```typescript
async function createCourseWithChapters(courseData, chaptersData) {
  return withTransaction(async (tx) => {
    // Create course
    const courseResult = await createCourse(courseData, tx);
    if (!courseResult.success) return courseResult;

    // Create chapters
    const chaptersResult = await batchCreate(
      chapters,
      chaptersData.map(ch => ({ ...ch, courseId: courseResult.data.id })),
      tx
    );
    if (!chaptersResult.success) return chaptersResult;

    // Return combined result
    return {
      success: true,
      data: {
        course: courseResult.data,
        chapters: chaptersResult.data
      }
    };
  });
}
```

## Pagination

### Basic Pagination

```typescript
import { paginate, createPaginationMeta } from '@/lib/db/query-builders';
import { db } from '@/lib/db';
import { courses } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';

async function getCoursesPaginated(page: number, pageSize: number) {
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(courses);
  const total = countResult[0]?.count || 0;

  // Get paginated results
  const query = db
    .select()
    .from(courses)
    .orderBy(desc(courses.createdAt))
    .$dynamic();

  const paginatedQuery = paginate(query, { page, pageSize });
  const items = await paginatedQuery;

  // Create metadata
  const meta = createPaginationMeta(total, { page, pageSize });

  return {
    success: true,
    data: { items, meta }
  };
}
```

### Pagination with Filters

```typescript
import { paginate, activeFilter, combineFilters } from '@/lib/db/query-builders';
import { eq } from 'drizzle-orm';

async function getFilteredCoursesPaginated(
  domainId: number | null,
  page: number,
  pageSize: number
) {
  // Build filters
  const filters = combineFilters(
    activeFilter(courses),
    domainId ? eq(courses.domainId, domainId) : undefined
  );

  // Get count with filters
  const countQuery = db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(courses);
  
  const countResult = filters 
    ? await countQuery.where(filters)
    : await countQuery;
  
  const total = countResult[0]?.count || 0;

  // Get paginated results with filters
  const query = db
    .select()
    .from(courses)
    .orderBy(desc(courses.createdAt))
    .$dynamic();

  const filteredQuery = filters ? query.where(filters) : query;
  const paginatedQuery = paginate(filteredQuery, { page, pageSize });
  const items = await paginatedQuery;

  return {
    success: true,
    data: {
      items,
      meta: createPaginationMeta(total, { page, pageSize })
    }
  };
}
```

## Complex Queries

### Dashboard Summary Query

```typescript
import { getTeacherDashboardSummary } from '@/lib/db/queries';

// This query executes multiple sub-queries in parallel
const result = await getTeacherDashboardSummary(teacherId);

if (result.success) {
  console.log('Courses:', result.data.courses.length);
  console.log('Total students:', result.data.students.totalStudents);
  console.log('Recent activity:', result.data.recentActivity.length);
}
```

### Student Progress Query

```typescript
import { getStudentEnrolledCoursesWithProgress } from '@/lib/db/queries';

const result = await getStudentEnrolledCoursesWithProgress(studentId);

if (result.success) {
  result.data.forEach(enrollment => {
    console.log(`Course: ${enrollment.courseTitle}`);
    console.log(`Progress: ${enrollment.completionPercentage}%`);
    console.log(`Completed: ${enrollment.completedChapters}/${enrollment.totalChapters}`);
  });
}
```

### Chapters with Content

```typescript
import { getChaptersWithContent } from '@/lib/db/chapter-queries';

// Optimized query that avoids N+1 problem
const result = await getChaptersWithContent(courseId);

if (result.success) {
  result.data.forEach(chapter => {
    console.log(`Chapter: ${chapter.title}`);
    console.log(`Content items: ${chapter.contentItems.length}`);
    
    chapter.contentItems.forEach(item => {
      console.log(`  - ${item.type}: ${item.title}`);
    });
  });
}
```

## Performance Optimization

### Using Base Queries for Efficiency

```typescript
import { createBaseQueries } from '@/lib/db/base-queries';
import { users } from '@/drizzle/schema';

// Create base queries once
const userQueries = createBaseQueries(users, users.id);

// Reuse for multiple operations
const user1 = await userQueries.findById(1);
const user2 = await userQueries.findById(2);
const activeUsers = await userQueries.findMany(eq(users.isActive, true));
```

### Parallel Query Execution

```typescript
// Execute independent queries in parallel
const [users, courses, domains] = await Promise.all([
  getAllUsers(),
  getAllCourses(),
  getAllDomains()
]);
```

### Batch Operations Instead of Loops

```typescript
// ❌ Bad: N queries in a loop
for (const userId of userIds) {
  await updateUser(userId, { isActive: false });
}

// ✅ Good: Single batch operation
await batchUpdate(
  users,
  userIds.map(id => ({ id, data: { isActive: false } })),
  users.id
);
```

### Using Exists Instead of Count

```typescript
import { createBaseQueries } from '@/lib/db/base-queries';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

const userQueries = createBaseQueries(users, users.id);

// ❌ Slower: Count all matching records
const countResult = await userQueries.count(eq(users.email, email));
const exists = countResult.success && countResult.data > 0;

// ✅ Faster: Check existence only
const existsResult = await userQueries.exists(eq(users.email, email));
const exists = existsResult.success && existsResult.data;
```

### Caching Expensive Queries

```typescript
import { getTeacherDashboardSummary } from '@/lib/db/queries';

// Example with simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedDashboard(teacherId: number) {
  const cacheKey = `dashboard:${teacherId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const result = await getTeacherDashboardSummary(teacherId);
  
  if (result.success) {
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
  }

  return result;
}
```

## Best Practices Summary

### DO ✅

- Always validate inputs before executing queries
- Use transactions for multi-step operations
- Return `DbResult<T>` types from all query functions
- Use base queries for common CRUD operations
- Execute independent queries in parallel
- Use batch operations instead of loops
- Check for errors after every database operation
- Add JSDoc comments to exported functions

### DON'T ❌

- Don't throw exceptions from query functions
- Don't ignore validation errors
- Don't execute queries in loops
- Don't mix business logic with query logic
- Don't return raw database records (use mappers)
- Don't use `select()` without fields for large tables
- Don't forget to handle all error codes

## Additional Resources

- [Main Documentation](./README.md)
- [Base Queries Examples](./base-queries.example.ts)
- [Query Builders Examples](./query-builders.example.ts)
- [Transactions Examples](./transactions.example.ts)
