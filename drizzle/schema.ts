import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  pgEnum,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", [
  "STUDENT",
  "TRAINER",
  "SUB_ADMIN",
  "ADMIN",
]);
export const courseStatusEnum = pgEnum("course_status", ["draft", "validated"]);
export const quizTypeEnum = pgEnum("quiz_type", ["auto", "manual"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("STUDENT"),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  isActive: boolean("is_active").default(true),

  // Student-specific information
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("Morocco"),

  // Additional info
  bio: text("bio"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Domains table
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#6366f1"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  domainId: integer("domain_id").references(() => domains.id),
  teacherId: integer("teacher_id").references(() => users.id),
  thumbnailUrl: text("thumbnail_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chapters table
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  contentType: varchar("content_type", { length: 20 }).notNull(),
  contentData: jsonb("content_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chapter Progress table
export const chapterProgress = pgTable("chapter_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").references(() => chapters.id),
  title: varchar("title", { length: 200 }).notNull(),
  questions: jsonb("questions").notNull(),
  passingScore: integer("passing_score").default(70),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quiz Attempts table
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

// Final Projects table
export const finalProjects = pgTable("final_projects", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Submissions table
export const projectSubmissions = pgTable("project_submissions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id),
  finalProjectId: integer("final_project_id").references(
    () => finalProjects.id
  ),
  submissionUrl: text("submission_url"),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("submitted"),
  feedback: text("feedback"),
  grade: integer("grade"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Classes table (for grouping students by teacher)
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  teacherId: integer("teacher_id")
    .references(() => users.id)
    .notNull(),
  domainId: integer("domain_id").references(() => domains.id),
  isActive: boolean("is_active").default(true),
  maxStudents: integer("max_students"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Class Enrollments table (students enrolled in a class)
export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .references(() => classes.id)
    .notNull(),
  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});
