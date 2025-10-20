# Teacher Class Management System - Documentation

## Overview

This document explains the teacher class creation and management system implementation in the Najm Academy Platform.

## Architecture

### Database Schema

#### 1. **Classes Table**

Stores information about teacher-created classes for organizing students.

```sql
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  domain_id INTEGER REFERENCES domains(id),
  is_active BOOLEAN DEFAULT true,
  max_students INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Fields:**

- `id`: Unique identifier for the class
- `name`: Name of the class (e.g., "Promotion 2025 - React")
- `description`: Optional description of the class
- `teacher_id`: Foreign key to the teacher who created the class
- `domain_id`: Optional foreign key to link class to a specific domain
- `is_active`: Boolean flag to activate/deactivate the class
- `max_students`: Optional maximum capacity for the class
- `created_at`: Timestamp when the class was created
- `updated_at`: Timestamp when the class was last updated

#### 2. **Class Enrollments Table**

Manages the many-to-many relationship between classes and students.

```sql
CREATE TABLE class_enrollments (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(class_id, student_id)
);
```

**Fields:**

- `id`: Unique identifier for the enrollment
- `class_id`: Foreign key to the class
- `student_id`: Foreign key to the student user
- `enrolled_at`: Timestamp when the student was added to the class
- **UNIQUE constraint**: Prevents duplicate enrollments (same student can't be added twice to the same class)

**ON DELETE CASCADE**: When a class or user is deleted, related enrollments are automatically removed.

## API Endpoints

### POST `/api/teacher/classes`

Creates a new class for the authenticated teacher.

**Request Body:**

```json
{
  "name": "Promotion 2025 - React",
  "description": "Class for React development course",
  "maxStudents": 30,
  "domainId": 1
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "name": "Promotion 2025 - React",
  "description": "Class for React development course",
  "teacherId": 5,
  "domainId": 1,
  "isActive": true,
  "maxStudents": 30,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

**Validation:**

- Requires authentication with "teacher" role
- Class name is required and must not be empty
- Description, maxStudents, and domainId are optional

### GET `/api/teacher/classes`

Retrieves all classes created by the authenticated teacher.

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Promotion 2025 - React",
    "description": "Class for React development course",
    "domainId": 1,
    "domainName": "Développement Web",
    "domainColor": "#3b82f6",
    "isActive": true,
    "maxStudents": 30,
    "createdAt": "2025-01-15T10:00:00Z",
    "studentCount": 15
  }
]
```

## Database Query Functions

### `createClass(data)`

Creates a new class in the database.

**Parameters:**

```typescript
{
  name: string;           // Required
  description?: string;   // Optional
  teacherId: number;      // Required
  domainId?: number;      // Optional
  maxStudents?: number;   // Optional
}
```

**Returns:** `{ success: boolean, data?: Class, error?: string }`

### `getTeacherClasses(teacherId)`

Fetches all classes created by a specific teacher with student counts.

**SQL Logic:**

- Joins `classes` table with `domains` to get domain information
- LEFT JOINs with `class_enrollments` to count enrolled students
- Groups by class and domain fields
- Orders by creation date (newest first)

### `getClassDetails(classId, teacherId)`

Retrieves detailed information about a specific class including enrolled students.

**Returns:**

```typescript
{
  success: boolean;
  data?: {
    class: {
      id, name, description, domainId, domainName,
      domainColor, isActive, maxStudents, createdAt
    };
    students: Array<{
      studentId, studentName, studentEmail,
      studentAvatarUrl, studentPhone, enrolledAt
    }>;
    studentCount: number;
  };
  error?: string;
}
```

**Security:** Validates that the requesting teacher owns the class.

### `addStudentToClass(classId, studentId)`

Adds a student to a class with validation.

**Validation Logic:**

1. **Duplicate Check**: Verifies student is not already enrolled
2. **Capacity Check**:
   - Fetches current student count
   - Compares with `maxStudents` if set
   - Prevents enrollment if class is full
3. **Insertion**: Creates new enrollment record

**Returns:** `{ success: boolean, data?: Enrollment, error?: string }`

### `removeStudentFromClass(classId, studentId)`

Removes a student from a class.

**Returns:** `{ success: boolean, data?: Enrollment, error?: string }`

### `updateClass(classId, teacherId, data)`

Updates class information.

**Updatable Fields:**

- name
- description
- domainId
- maxStudents
- isActive

**Security:** Only the class owner (teacher) can update it.

### `deleteClass(classId, teacherId)`

Deletes a class and all its enrollments.

**Process:**

1. Deletes all `class_enrollments` records for the class
2. Deletes the class record itself

**Security:** Only the class owner can delete it.

## Student Fetching Logic

### `getTeacherStudents(teacherId)`

Comprehensive query that fetches all students enrolled in a teacher's courses with detailed statistics.

**Query Process:**

1. **Main Join:**

   - Starts from `enrollments` table
   - Joins with `users` (students)
   - Joins with `courses` (filters by teacherId)
   - Joins with `domains` for course domain info
   - LEFT JOIN with `chapterProgress` for progress tracking

2. **Calculated Fields:**

   - `chaptersCompleted`: COUNT of distinct completed chapters per student
   - `lastActivityDate`: MAX timestamp from chapter progress

3. **Enrichment (Post-Query):**
   - **Chapter Totals**: Separate query to get total chapters per course
   - **Progress Calculation**: `(chaptersCompleted / totalChapters) * 100`
   - **Quiz Statistics**:
     - Separate query for average quiz scores
     - Count of completed quizzes per student per course
4. **Status Determination:**
   ```typescript
   - "inactive": No activity in last 7 days
   - "struggling": Progress < 30% AND no activity in 3+ days
   - "active": All other cases
   ```

**Performance Optimization:**

- Groups by student and course to avoid duplicates
- Uses Maps for O(1) lookups when enriching data
- Single query for all students, then enrich with aggregated data

## UI Components

### StudentProgress Component

**Features:**

1. **Statistics Dashboard:**

   - Total students count
   - Active students (green badge)
   - Struggling students (yellow badge)
   - Inactive students (gray badge)
   - Average progress percentage

2. **Two Main Tabs:**

   **a) Students Tab:**

   - Filterable table with search by name/email/course
   - Filter by course dropdown
   - Filter by status dropdown
   - Displays:
     - Student avatar and name
     - Enrolled course with domain badge
     - Progress bar with percentage
     - Chapters completed (X/Y format)
     - Average quiz score
     - Status badge
     - Last activity date
     - Actions (View details)

   **b) Classes Tab:**

   - Grid of class cards
   - Create class dialog button
   - Each card shows:
     - Class name
     - Domain badge (if linked)
     - Active/Inactive status
     - Description
     - Student count (current/max)
     - View and Settings buttons

3. **Create Class Dialog:**
   - Form fields:
     - Name (required)
     - Description (optional)
     - Max students (optional, number input)
   - Client-side validation
   - API call to create class
   - Toast notifications for success/error
   - Auto-refresh on success

## How It Works (Step-by-Step)

### Teacher Creates a Class:

1. Teacher clicks "Créer une classe" button
2. Dialog opens with form
3. Teacher enters:
   - Class name: "Promotion 2025 - React"
   - Description: "Advanced React development bootcamp"
   - Max students: 30
4. Clicks "Créer" button
5. Frontend makes POST request to `/api/teacher/classes`
6. Backend validates:
   - User is authenticated as teacher
   - Name is not empty
7. `createClass()` query executes:
   ```sql
   INSERT INTO classes (name, description, teacher_id, max_students, is_active)
   VALUES ('Promotion 2025 - React', 'Advanced React...', 5, 30, true)
   RETURNING *;
   ```
8. New class record returned to frontend
9. Success toast displayed
10. Page refreshes to show new class

### Adding Students to Class:

1. Teacher views class details
2. Sees list of available students (from their courses)
3. Clicks "Add Student" button next to student name
4. System calls `addStudentToClass(classId, studentId)`
5. Validations:
   - Check if student already enrolled: `SELECT * FROM class_enrollments WHERE class_id = ? AND student_id = ?`
   - If exists, return error "Already enrolled"
   - Check capacity: `SELECT max_students, COUNT(student_id) FROM classes LEFT JOIN class_enrollments`
   - If full, return error "Class is full"
6. If valid, insert enrollment:
   ```sql
   INSERT INTO class_enrollments (class_id, student_id)
   VALUES (1, 10)
   RETURNING *;
   ```
7. Student added to class, UI updates

## Benefits of This Architecture

1. **Separation of Concerns:**

   - Classes are separate from course enrollments
   - Students can be in multiple classes
   - One class can contain students from different courses

2. **Flexibility:**

   - Teachers can organize students by cohort, skill level, or any criteria
   - Classes can span multiple courses or domains
   - No hard dependency between classes and courses

3. **Scalability:**

   - Indexed foreign keys for fast lookups
   - Efficient COUNT aggregation for student counts
   - Paginated queries ready to implement

4. **Data Integrity:**

   - UNIQUE constraint prevents duplicate enrollments
   - CASCADE deletes maintain referential integrity
   - Foreign key constraints ensure valid relationships

5. **User Experience:**
   - Teachers see all students from their courses in one view
   - Can filter and search across all courses
   - Can organize students into logical groups (classes)
   - Clear visual indicators for student status

## Future Enhancements

- **Class-based assignments**: Assign courses or content to entire class
- **Bulk operations**: Add multiple students at once
- **Class analytics**: Performance metrics at class level
- **Communication**: Send messages to entire class
- **Scheduling**: Link classes to specific time slots or schedules
- **Attendance tracking**: Mark student attendance in class sessions
- **Class cloning**: Duplicate class structure for new cohorts

## Example Use Cases

1. **Bootcamp Management:**

   - Create class "Web Dev Bootcamp Jan 2025"
   - Add 25 students to this class
   - Track their progress across multiple courses (HTML, CSS, JS, React)
   - View class-wide statistics

2. **Subject-Specific Groups:**

   - Create class "Advanced JavaScript Students"
   - Add students who excel in JS course
   - Provide additional resources or challenges

3. **Remedial Classes:**
   - Create class "Need Extra Help - React Basics"
   - Add struggling students (status: "struggling")
   - Focus on their specific needs

This architecture provides a solid foundation for comprehensive student and class management while maintaining flexibility for future requirements.
