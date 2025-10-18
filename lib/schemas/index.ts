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
