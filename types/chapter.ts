/**
 * Chapter and Content Item Type Definitions
 *
 * These types represent the database models and their relationships
 */

import type {
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
  Difficulty,
} from "../lib/schemas/chapter";

// ============================================================================
// Database Model Types
// ============================================================================

/**
 * Chapter database model
 */
export interface Chapter {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Content Item database model
 */
export interface ContentItem {
  id: number;
  chapterId: number;
  title: string;
  contentType: ContentType;
  orderIndex: number;
  contentData: ContentData;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Extended Types with Relations
// ============================================================================

/**
 * Chapter with associated content items
 */
export interface ChapterWithContent extends Chapter {
  contentItems: ContentItem[];
}

/**
 * Content Item with typed content data
 */
export type TypedContentItem<T extends ContentType = ContentType> =
  T extends "video"
    ? ContentItem & { contentType: "video"; contentData: VideoContent }
    : T extends "text"
    ? ContentItem & { contentType: "text"; contentData: TextContent }
    : T extends "quiz"
    ? ContentItem & { contentType: "quiz"; contentData: QuizContent }
    : T extends "test"
    ? ContentItem & { contentType: "test"; contentData: TestContent }
    : T extends "exam"
    ? ContentItem & { contentType: "exam"; contentData: ExamContent }
    : ContentItem;

// ============================================================================
// Re-export schema types for convenience
// ============================================================================

export type {
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
  Difficulty,
};
