// Auth schemas
export {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput
} from "./auth"

// User schemas
export {
  roleSchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  userIdSchema,
  type Role,
  type CreateUserInput,
  type UpdateUserInput,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type UserIdParam
} from "./user"

// Domain schemas
export {
  createDomainSchema,
  updateDomainSchema,
  domainIdSchema,
  type CreateDomainInput,
  type UpdateDomainInput,
  type DomainIdParam
} from "./domain"

// Course schemas
export {
  createCourseSchema,
  updateCourseSchema,
  courseIdSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CourseIdParam
} from "./course"

// Chapter schemas
export {
  contentTypeEnum,
  difficultyEnum,
  videoContentSchema,
  textContentSchema,
  quizContentSchema,
  testContentSchema,
  examContentSchema,
  contentDataSchema,
  quizQuestionSchema,
  testQuestionSchema,
  examQuestionSchema,
  createChapterSchema,
  updateChapterSchema,
  chapterIdSchema,
  reorderChaptersSchema,
  createContentItemSchema,
  updateContentItemSchema,
  contentItemIdSchema,
  reorderContentItemsSchema,
  type ContentType,
  type Difficulty,
  type VideoContent,
  type TextContent,
  type QuizContent,
  type TestContent,
  type ExamContent,
  type ContentData,
  type QuizQuestion,
  type TestQuestion,
  type ExamQuestion,
  type Attachment,
  type CreateChapterInput,
  type UpdateChapterInput,
  type ChapterIdParam,
  type ReorderChaptersInput,
  type CreateContentItemInput,
  type UpdateContentItemInput,
  type ContentItemIdParam,
  type ReorderContentItemsInput
} from "./chapter"
