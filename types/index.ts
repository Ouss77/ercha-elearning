/**
 * Centralized type exports
 * 
 * Import types from this file to ensure consistency across the application
 */

// User types
export type { 
  User, 
  DbUser, 
  AuthUser, 
  UserListItem, 
  UserProfile 
} from "./user"

// Chapter and Content Item types
export type {
  Chapter,
  ContentItem,
  ChapterWithContent,
  TypedContentItem,
  ContentType,
  ContentData,
  VideoContent,
  TextContent,
  QuizContent,
  TestContent,
  ExamContent,
  QuizQuestion,
  TestQuestion,
  ExamQuestion,
  Attachment,
  Difficulty
} from "./chapter"

// Re-export next-auth types
export type { Role } from "@/lib/schemas/user"
