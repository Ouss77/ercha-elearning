# Classes (Student Groups) Feature

## Overview

The Classes feature allows administrators and sub-administrators to organize students into groups and manage their course enrollments collectively. When courses are assigned to a class, all students in that class are automatically enrolled.

## Key Features

### 1. Class Management
- **Create Classes**: Admins can create classes with name, description, teacher, domain, and max capacity
- **Edit Classes**: Update class information including teacher assignment and capacity
- **Delete Classes**: Remove classes (cascade deletes all enrollments)
- **View Classes**: List all classes with student counts and domain information

### 2. Student Management
- **Add Students to Class**: Assign students to a class
- **Auto-enrollment**: Students automatically enroll in all courses assigned to their class
- **Remove Students**: Remove students from a class
- **Class Selection on User Creation**: Assign students to a class during account creation

### 3. Course Assignment
- **Assign Courses to Class**: Link multiple courses to a class
- **Auto-enrollment**: All class students automatically enroll when a course is assigned
- **Remove Courses**: Unlink courses from a class
- **View Class Courses**: See all courses assigned to a class

## Database Schema

### Tables

#### `classes`
- `id`: Primary key
- `name`: Class name
- `description`: Optional description
- `teacherId`: Reference to teacher (users table)
- `domainId`: Optional reference to domain
- `isActive`: Active status
- `maxStudents`: Optional maximum capacity
- `createdAt`, `updatedAt`: Timestamps

#### `class_enrollments`
- `id`: Primary key
- `classId`: Reference to class (CASCADE on delete)
- `studentId`: Reference to student (CASCADE on delete)
- `enrolledAt`: Enrollment timestamp

#### `class_courses`
- `id`: Primary key
- `classId`: Reference to class (CASCADE on delete)
- `courseId`: Reference to course (CASCADE on delete)
- `assignedAt`: Assignment timestamp
- Unique constraint on (classId, courseId)

## API Endpoints

### Admin/Sub-Admin Endpoints

#### Classes
- `GET /api/admin/classes` - List all classes
- `POST /api/admin/classes` - Create a new class
- `GET /api/admin/classes/[id]` - Get class details
- `PUT /api/admin/classes/[id]` - Update class
- `DELETE /api/admin/classes/[id]` - Delete class

#### Students
- `GET /api/admin/classes/[id]/students` - List class students
- `POST /api/admin/classes/[id]/students` - Add student to class
- `DELETE /api/admin/classes/[id]/students/[studentId]` - Remove student from class

#### Courses
- `GET /api/admin/classes/[id]/courses` - List class courses
- `POST /api/admin/classes/[id]/courses` - Assign course to class
- `DELETE /api/admin/classes/[id]/courses?classId=X&courseId=Y` - Remove course from class

## UI Components

### Admin Pages
- `/admin/classes` - Classes management page with table and statistics

### Components
- `ClassesManagement` - Main management component
- `ClassesTable` - Table displaying all classes
- `CreateClassDialog` - Dialog for creating new classes
- `ClassDetailsDialog` - Dialog for managing class students and courses

## Usage Examples

### Creating a Class

```typescript
const response = await fetch("/api/admin/classes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Web Development 2024",
    description: "Advanced web development class",
    teacherId: 1,
    domainId: 2,
    maxStudents: 30
  })
});
```

### Adding a Student to a Class

```typescript
const response = await fetch(`/api/admin/classes/${classId}/students`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ studentId: 5 })
});
// Student is automatically enrolled in all class courses
```

### Assigning a Course to a Class

```typescript
const response = await fetch(`/api/admin/classes/${classId}/courses`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ courseId: 10 })
});
// All class students are automatically enrolled in the course
```

## Auto-Enrollment Logic

### When a Student Joins a Class
1. Student is added to `class_enrollments`
2. System fetches all courses assigned to the class from `class_courses`
3. Student is automatically enrolled in all those courses via `enrollments` table
4. Duplicate enrollments are ignored (ON CONFLICT DO NOTHING)

### When a Course is Assigned to a Class
1. Course is added to `class_courses`
2. System fetches all students in the class from `class_enrollments`
3. All students are automatically enrolled in the course via `enrollments` table
4. Duplicate enrollments are ignored (ON CONFLICT DO NOTHING)

## Database Functions

Key functions in `lib/db/class-queries.ts`:

- `createClass()` - Create a new class
- `getAllClasses()` - Get all classes with stats
- `getClassById()` - Get class by ID
- `updateClass()` - Update class information
- `deleteClass()` - Delete a class
- `getClassStudents()` - Get all students in a class
- `addStudentToClass()` - Add student and auto-enroll in courses
- `removeStudentFromClass()` - Remove student from class
- `getClassCourses()` - Get all courses assigned to class
- `assignCourseToClass()` - Assign course and auto-enroll students
- `removeCourseFromClass()` - Remove course from class
- `autoEnrollStudentInClassCourses()` - Auto-enroll student in all class courses

## Authorization

- **ADMIN**: Full access to all class operations
- **SUB_ADMIN**: Full access to all class operations
- **TRAINER**: View only their assigned classes (via teacher API)
- **STUDENT**: No access to class management

## Migration

To add the `class_courses` table to an existing database:

```sql
-- Run the migration script
psql your_database < drizzle/migrations/add_class_courses_table.sql
```

Or use Drizzle Kit:
```bash
npx drizzle-kit push:pg
```

## Future Enhancements

Potential improvements:
- Bulk student import to classes
- Class schedules and timetables
- Class-specific announcements
- Progress tracking by class
- Class performance analytics
- Student transfer between classes
- Class templates