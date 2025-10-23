# Quiz Attempts Table - Database Migration

## Overview

This document describes the `quiz_attempts` table created for tracking student quiz, test, and exam attempts in the e-learning platform.

## Migration Information

- **Created**: October 22, 2025
- **Script**: `scripts/create-quiz-attempts-table.ts`
- **Status**: ✅ Successfully deployed

## Table Structure

### `quiz_attempts`

Stores all student attempts at quizzes, tests, and exams with their scores and results.

| Column Name    | Data Type   | Nullable | Description                                                    |
| -------------- | ----------- | -------- | -------------------------------------------------------------- |
| `id`           | `SERIAL`    | NO       | Primary key, auto-incrementing                                 |
| `student_id`   | `INTEGER`   | YES      | Foreign key to `users.id` - the student who took the quiz      |
| `quiz_id`      | `INTEGER`   | YES      | Foreign key to `content_items.id` - the quiz/test/exam content |
| `answers`      | `JSONB`     | NO       | JSON object storing the student's answers                      |
| `score`        | `INTEGER`   | NO       | Score percentage (0-100)                                       |
| `passed`       | `BOOLEAN`   | NO       | Whether the student passed based on passing score              |
| `attempted_at` | `TIMESTAMP` | YES      | When the attempt was made (default: NOW())                     |

## Indexes

For optimal query performance, the following indexes are created:

| Index Name                     | Column       | Purpose                                     |
| ------------------------------ | ------------ | ------------------------------------------- |
| `quiz_attempts_pkey`           | `id`         | Primary key index                           |
| `quiz_attempts_student_id_idx` | `student_id` | Fast lookup of student's attempts           |
| `quiz_attempts_quiz_id_idx`    | `quiz_id`    | Fast lookup of attempts for a specific quiz |
| `quiz_attempts_passed_idx`     | `passed`     | Filter passed/failed attempts efficiently   |

## Relationships

```
users (1) ─────< (N) quiz_attempts
  id                   student_id

content_items (1) ─────< (N) quiz_attempts
  id                        quiz_id
```

## Sample Data Structure

### Answers JSONB Format

```json
{
  "0": 2, // Question 0, selected option index 2
  "1": 1, // Question 1, selected option index 1
  "2": 0, // Question 2, selected option index 0
  "3": null // Question 3, not answered
}
```

### Example Row

```json
{
  "id": 1,
  "student_id": 37,
  "quiz_id": 11,
  "answers": { "0": 0, "1": 1 },
  "score": 100,
  "passed": true,
  "attempted_at": "2025-10-22T14:30:00Z"
}
```

## Business Rules

1. **Attempt Limit**: Students get 3 attempts per quiz (enforced at application level)
2. **Score Calculation**: Percentage of correct answers out of total questions
3. **Passing Criteria**: Score >= `passingScore` from quiz content data
4. **Answer Visibility**:
   - Hidden if failed with attempts remaining
   - Shown if passed or all attempts exhausted

## Usage in Application

### API Endpoints

#### POST `/api/quiz-attempts`

Save a quiz attempt after submission.

**Request Body**:

```json
{
  "contentId": 11,
  "answers": { "0": 0, "1": 1 },
  "score": 100,
  "passed": true
}
```

#### GET `/api/quiz-attempts?contentId={id}`

Retrieve all attempts for a specific quiz by the logged-in student.

**Response**:

```json
{
  "attempts": [
    {
      "id": 1,
      "score": 85,
      "passed": true,
      "attemptedAt": "2025-10-22T14:30:00Z"
    }
  ]
}
```

### Features Enabled

1. **Attempt Tracking**: View previous attempts and scores
2. **Score Persistence**: Scores saved and displayed on quiz re-entry
3. **Progress Display**: Show best score and attempts used
4. **Checkpoints Integration**: Passed quizzes appear in student's jalons/achievements
5. **Smart Retry Logic**: Hide answers until passed or attempts exhausted

## Migration Commands

### To Create Table

```bash
bun run scripts/create-quiz-attempts-table.ts
```

### To Verify Table

```bash
bun run scripts/verify-quiz-table.ts
```

### Manual SQL (if needed)

```sql
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
  "id" SERIAL PRIMARY KEY,
  "student_id" INTEGER REFERENCES "users"("id"),
  "quiz_id" INTEGER REFERENCES "content_items"("id"),
  "answers" JSONB NOT NULL,
  "score" INTEGER NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "attempted_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "quiz_attempts_student_id_idx" ON "quiz_attempts"("student_id");
CREATE INDEX IF NOT EXISTS "quiz_attempts_quiz_id_idx" ON "quiz_attempts"("quiz_id");
CREATE INDEX IF NOT EXISTS "quiz_attempts_passed_idx" ON "quiz_attempts"("passed");
```

## Queries Examples

### Get student's best score for a quiz

```sql
SELECT MAX(score) as best_score
FROM quiz_attempts
WHERE student_id = $1 AND quiz_id = $2;
```

### Get all passed quizzes for a student

```sql
SELECT qa.*, ci.title as quiz_title, ci.content_type
FROM quiz_attempts qa
INNER JOIN content_items ci ON qa.quiz_id = ci.id
WHERE qa.student_id = $1 AND qa.passed = true
ORDER BY qa.attempted_at DESC;
```

### Count attempts for a quiz

```sql
SELECT COUNT(*) as attempt_count
FROM quiz_attempts
WHERE student_id = $1 AND quiz_id = $2;
```

### Get attempt history

```sql
SELECT score, passed, attempted_at
FROM quiz_attempts
WHERE student_id = $1 AND quiz_id = $2
ORDER BY attempted_at DESC
LIMIT 3;
```

## Performance Considerations

- **Indexes**: Created on frequently queried columns (student_id, quiz_id, passed)
- **JSONB**: Used for flexible answer storage without schema changes
- **Timestamps**: Automatic timestamp for audit trail
- **Cascading**: No cascade delete to preserve attempt history

## Future Enhancements

Potential improvements to consider:

1. Add `time_spent` column to track how long students took
2. Add `ip_address` for security/proctoring
3. Add `device_info` for analytics
4. Create materialized view for leaderboards
5. Add soft delete for data retention policies

## Related Files

- **Schema**: `drizzle/schema.ts`
- **API Route**: `app/api/quiz-attempts/route.ts`
- **Quiz View**: `components/student/quiz-view.tsx`
- **Checkpoints**: `app/(etudiant)/etudiant/jalons/page.tsx`
- **Migration Script**: `scripts/create-quiz-attempts-table.ts`
- **Verification Script**: `scripts/verify-quiz-table.ts`

---

**Last Updated**: October 22, 2025  
**Database**: PostgreSQL (Neon)  
**ORM**: Drizzle ORM
