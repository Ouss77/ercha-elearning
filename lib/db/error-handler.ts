/**
 * Enhanced error handling utilities for database operations
 * 
 * This module provides consistent error handling, categorization,
 * and logging for all database operations.
 */

import { DbResult, DbErrorCode, DbError } from './types';

/**
 * PostgreSQL error codes for constraint violations
 */
const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502',
} as const;

/**
 * Main error handler that categorizes and formats database errors
 * 
 * @param error - The caught error object
 * @param context - Optional context string for logging
 * @returns Formatted error result
 * 
 * @example
 * ```typescript
 * try {
 *   await db.insert(users).values(data);
 * } catch (error) {
 *   return handleDbError(error, 'createUser');
 * }
 * ```
 */
export function handleDbError(
  error: unknown,
  context?: string
): DbResult<never> {
  // Handle PostgreSQL errors
  if (isPostgresError(error)) {
    return handlePostgresError(error, context);
  }

  // Handle known DbError objects
  if (isDbError(error)) {
    logDbError(error, { operation: context || 'unknown', entity: 'unknown' });
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'Unknown database error';
  const dbError: DbError = {
    message,
    code: DbErrorCode.DATABASE_ERROR,
    details: error,
  };

  logDbError(dbError, { operation: context || 'unknown', entity: 'unknown' });

  return {
    success: false,
    error: message,
    code: DbErrorCode.DATABASE_ERROR,
  };
}

/**
 * Creates a NOT_FOUND error result
 * 
 * @param entity - The entity type that was not found
 * @param id - The ID that was searched for
 * @returns Error result with NOT_FOUND code
 * 
 * @example
 * ```typescript
 * const user = await findUser(id);
 * if (!user) return handleNotFound('User', id);
 * ```
 */
export function handleNotFound(
  entity: string,
  id: number | string
): DbResult<never> {
  const message = `${entity} with ID ${id} not found`;
  const error: DbError = {
    message,
    code: DbErrorCode.NOT_FOUND,
    details: { entity, id },
  };

  return {
    success: false,
    error: message,
    code: DbErrorCode.NOT_FOUND,
  };
}

/**
 * Creates a VALIDATION_ERROR result
 * 
 * @param message - Description of the validation error
 * @param details - Optional additional validation details
 * @returns Error result with VALIDATION_ERROR code
 * 
 * @example
 * ```typescript
 * if (!email.includes('@')) {
 *   return handleValidationError('Invalid email format', { email });
 * }
 * ```
 */
export function handleValidationError(
  message: string,
  details?: unknown
): DbResult<never> {
  const error: DbError = {
    message,
    code: DbErrorCode.VALIDATION_ERROR,
    details,
  };

  return {
    success: false,
    error: message,
    code: DbErrorCode.VALIDATION_ERROR,
  };
}

/**
 * Handles PostgreSQL constraint violation errors
 * 
 * @param error - PostgreSQL error object
 * @returns Error result with CONSTRAINT_VIOLATION code
 */
export function handleConstraintViolation(
  error: PostgresError
): DbResult<never> {
  let message = 'Database constraint violation';

  // Provide more specific messages based on constraint type
  switch (error.code) {
    case PG_ERROR_CODES.UNIQUE_VIOLATION:
      message = extractUniqueViolationMessage(error);
      break;
    case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      message = 'Referenced record does not exist';
      break;
    case PG_ERROR_CODES.CHECK_VIOLATION:
      message = 'Data does not meet constraint requirements';
      break;
    case PG_ERROR_CODES.NOT_NULL_VIOLATION:
      message = extractNotNullViolationMessage(error);
      break;
  }

  const dbError: DbError = {
    message,
    code: DbErrorCode.CONSTRAINT_VIOLATION,
    details: {
      pgCode: error.code,
      constraint: error.constraint_name,
      table: error.table_name,
      column: error.column_name,
    },
  };

  logDbError(dbError, { operation: 'constraint_check', entity: error.table_name || 'unknown' });

  return {
    success: false,
    error: message,
    code: DbErrorCode.CONSTRAINT_VIOLATION,
  };
}

/**
 * Creates an UNAUTHORIZED error result
 * 
 * @param message - Description of the authorization failure
 * @returns Error result with UNAUTHORIZED code
 */
export function handleUnauthorized(message: string): DbResult<never> {
  return {
    success: false,
    error: message,
    code: DbErrorCode.UNAUTHORIZED,
  };
}

/**
 * Logs database errors with contextual information
 * 
 * @param error - The DbError to log
 * @param context - Contextual information about the operation
 */
export function logDbError(
  error: DbError,
  context: {
    operation: string;
    entity: string;
    userId?: number;
  }
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    errorCode: error.code,
    message: error.message,
    operation: context.operation,
    entity: context.entity,
    userId: context.userId,
    details: error.details,
  };

  // Use appropriate log level based on error type
  switch (error.code) {
    case DbErrorCode.NOT_FOUND:
    case DbErrorCode.VALIDATION_ERROR:
      console.warn('[DB Warning]', logData);
      break;
    case DbErrorCode.CONSTRAINT_VIOLATION:
    case DbErrorCode.UNAUTHORIZED:
      console.error('[DB Error]', logData);
      break;
    case DbErrorCode.DATABASE_ERROR:
      console.error('[DB Critical]', logData);
      break;
  }
}

// Type guards and helper functions

/**
 * Type guard for PostgreSQL errors
 */
function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

/**
 * Type guard for DbError objects
 */
function isDbError(error: unknown): error is DbError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error &&
    Object.values(DbErrorCode).includes((error as any).code)
  );
}

/**
 * Handles PostgreSQL-specific errors
 */
function handlePostgresError(
  error: PostgresError,
  context?: string
): DbResult<never> {
  // Check if it's a constraint violation
  if (Object.values(PG_ERROR_CODES).includes(error.code as any)) {
    return handleConstraintViolation(error);
  }

  // Handle other PostgreSQL errors
  const dbError: DbError = {
    message: error.message || 'Database operation failed',
    code: DbErrorCode.DATABASE_ERROR,
    details: {
      pgCode: error.code,
      detail: error.detail,
      hint: error.hint,
    },
  };

  logDbError(dbError, { operation: context || 'unknown', entity: 'unknown' });

  return {
    success: false,
    error: dbError.message,
    code: DbErrorCode.DATABASE_ERROR,
  };
}

/**
 * Extracts a user-friendly message from unique constraint violations
 */
function extractUniqueViolationMessage(error: PostgresError): string {
  if (error.constraint_name) {
    // Try to extract field name from constraint name
    // Common pattern: table_field_key or table_field_unique
    const match = error.constraint_name.match(/^[^_]+_([^_]+)_/);
    if (match) {
      const field = match[1];
      return `A record with this ${field} already exists`;
    }
  }
  return 'A record with these values already exists';
}

/**
 * Extracts a user-friendly message from not-null constraint violations
 */
function extractNotNullViolationMessage(error: PostgresError): string {
  if (error.column_name) {
    return `Field '${error.column_name}' is required`;
  }
  return 'Required field is missing';
}

/**
 * PostgreSQL error interface
 */
interface PostgresError {
  code: string;
  message?: string;
  detail?: string;
  hint?: string;
  constraint_name?: string;
  table_name?: string;
  column_name?: string;
}
