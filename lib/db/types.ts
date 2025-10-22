/**
 * Database query result types and error codes
 * 
 * This module provides standardized types for all database operations,
 * ensuring consistent error handling and type safety across the application.
 */

/**
 * Generic result type for all database operations
 * Uses discriminated unions for type-safe error handling
 */
export type DbResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: DbErrorCode };

/**
 * Standardized error codes for database operations
 */
export enum DbErrorCode {
  /** Entity not found in database */
  NOT_FOUND = 'NOT_FOUND',
  /** Input validation failed */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Database constraint violation (unique, foreign key, check) */
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  /** User lacks permission for operation */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Unexpected database error */
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Structured error information for database operations
 */
export interface DbError {
  /** Human-readable error message */
  message: string;
  /** Categorized error code */
  code: DbErrorCode;
  /** Additional error context (e.g., validation details, stack trace) */
  details?: unknown;
}

/**
 * Helper type to extract the data type from a DbResult
 */
export type ExtractData<T> = T extends DbResult<infer U> ? U : never;

/**
 * Helper type for success results
 */
export type SuccessResult<T> = Extract<DbResult<T>, { success: true }>;

/**
 * Helper type for error results
 */
export type ErrorResult = Extract<DbResult<never>, { success: false }>;
