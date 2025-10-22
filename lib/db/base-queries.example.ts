/**
 * Example usage of base query utilities
 *
 * This file demonstrates how to use the createBaseQueries factory
 * to create reusable CRUD operations for any table.
 *
 * NOTE: This is an example file for documentation purposes.
 * It is not meant to be imported or executed directly.
 */

import { createBaseQueries, findByIdOrFail } from "./base-queries";
import { users, courses, domains } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// Example 1: Create base queries for users table
const userBaseQueries = createBaseQueries(users, users.id);

// Example usage of findById
async function exampleFindById() {
  const result = await userBaseQueries.findById(1);

  if (result.success) {
    console.log("User found:", result.data);
  } else {
    console.error("Error:", result.error);
  }
}

// Example usage of findMany
async function exampleFindMany() {
  // Find all users
  const allUsers = await userBaseQueries.findMany();

  // Find users with a condition
  const activeUsers = await userBaseQueries.findMany(eq(users.isActive, true));

  if (activeUsers.success) {
    console.log("Active users:", activeUsers.data);
  }
}

// Example usage of findOne
async function exampleFindOne() {
  const result = await userBaseQueries.findOne(
    eq(users.email, "user@example.com")
  );

  if (result.success && result.data) {
    console.log("User found:", result.data);
  }
}

// Example usage of create
async function exampleCreate() {
  const result = await userBaseQueries.create({
    email: "newuser@example.com",
    password: "hashedpassword",
    name: "New User",
    role: "STUDENT",
  });

  if (result.success) {
    console.log("User created:", result.data);
  } else {
    console.error("Error:", result.error);
  }
}

// Example usage of update
async function exampleUpdate() {
  const result = await userBaseQueries.update(1, {
    name: "Updated Name",
    isActive: true,
  });

  if (result.success) {
    console.log("User updated:", result.data);
  } else {
    console.error("Error:", result.error);
  }
}

// Example usage of delete
async function exampleDelete() {
  const result = await userBaseQueries.delete(1);

  if (result.success) {
    console.log("User deleted:", result.data);
  } else {
    console.error("Error:", result.error);
  }
}

// Example usage of exists
async function exampleExists() {
  const result = await userBaseQueries.exists(
    eq(users.email, "user@example.com")
  );

  if (result.success) {
    console.log("User exists:", result.data);
  }
}

// Example usage of count
async function exampleCount() {
  // Count all users
  const totalUsers = await userBaseQueries.count();

  // Count active users
  const activeUsersCount = await userBaseQueries.count(
    eq(users.isActive, true)
  );

  if (activeUsersCount.success) {
    console.log("Active users count:", activeUsersCount.data);
  }
}

// Example 2: Create base queries for courses table
const courseBaseQueries = createBaseQueries(courses, courses.id);

async function exampleCourseOperations() {
  // Find course by ID
  const course = await courseBaseQueries.findById(1);

  // Find courses by teacher
  const teacherCourses = await courseBaseQueries.findMany(
    eq(courses.teacherId, 5)
  );

  // Check if course exists
  const courseExists = await courseBaseQueries.exists(
    eq(courses.slug, "intro-to-programming")
  );

  // Count courses in a domain
  const domainCoursesCount = await courseBaseQueries.count(
    eq(courses.domainId, 2)
  );
}

// Example 3: Using findByIdOrFail helper
async function exampleFindByIdOrFail() {
  // This will return an error if the user doesn't exist
  const userResult = await findByIdOrFail(users, users.id, 1, "User");

  if (!userResult.success) {
    // Handle error - user not found
    console.error(userResult.error);
    return;
  }

  // TypeScript knows userResult.data exists here
  console.log("User found:", userResult.data);
}

// Example 4: Composing base queries with custom logic
async function exampleComposition() {
  // First, check if user exists
  const userExists = await userBaseQueries.exists(eq(users.id, 1));

  if (!userExists.success || !userExists.data) {
    return { success: false, error: "User not found" };
  }

  // Then, get the user's courses
  const userCourses = await courseBaseQueries.findMany(
    eq(courses.teacherId, 1)
  );

  return userCourses;
}

// Example 5: Error handling patterns
async function exampleErrorHandling() {
  const result = await userBaseQueries.findById(999);

  if (!result.success) {
    // Handle error based on error code
    switch (result.code) {
      case "NOT_FOUND":
        console.log("User not found");
        break;
      case "VALIDATION_ERROR":
        console.log("Invalid input");
        break;
      case "DATABASE_ERROR":
        console.log("Database error occurred");
        break;
      default:
        console.log("Unknown error");
    }
    return;
  }

  // Success case
  if (result.data) {
    console.log("User:", result.data);
  } else {
    console.log("User not found (null)");
  }
}
