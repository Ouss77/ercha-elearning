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

// Re-export next-auth types
export type { Role } from "@/lib/schemas/user"
