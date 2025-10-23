/**
 * Parameter validation utilities for database operations
 * 
 * This module provides reusable validation functions to ensure
 * data integrity before executing database queries.
 */

import { eq } from 'drizzle-orm';
import { DbResult, DbErrorCode } from './types';
import { handleValidationError } from './error-handler';
import { db } from './db';

/**
 * Validates that a value is a valid positive integer ID
 * 
 * @param id - The value to validate
 * @returns Success with validated ID or validation error
 * 
 * @example
 * ```typescript
 * const validId = validateId(userId);
 * if (!validId.success) return validId;
 * // Use validId.data safely
 * ```
 */
export function validateId(id: unknown): DbResult<number> {
  // Check if id is provided
  if (id === null || id === undefined) {
    return handleValidationError('ID is required');
  }

  // Convert to number if string
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;

  // Validate it's a number
  if (typeof numId !== 'number' || isNaN(numId)) {
    return handleValidationError('ID must be a valid number', { provided: id });
  }

  // Validate it's a positive integer
  if (!Number.isInteger(numId) || numId <= 0) {
    return handleValidationError('ID must be a positive integer', { provided: id });
  }

  return { success: true, data: numId };
}

/**
 * Validates that a required value is present and not null/undefined
 * 
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @returns Success with the value or validation error
 * 
 * @example
 * ```typescript
 * const validEmail = validateRequired(email, 'email');
 * if (!validEmail.success) return validEmail;
 * ```
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): DbResult<T> {
  if (value === null || value === undefined) {
    return handleValidationError(`${fieldName} is required`);
  }

  // Check for empty strings
  if (typeof value === 'string' && value.trim() === '') {
    return handleValidationError(`${fieldName} cannot be empty`);
  }

  return { success: true, data: value };
}

/**
 * Validates that a string is not empty after trimming
 * 
 * @param value - The string to validate
 * @param fieldName - Name of the field for error messages
 * @param minLength - Optional minimum length requirement
 * @param maxLength - Optional maximum length requirement
 * @returns Success with trimmed string or validation error
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number }
): DbResult<string> {
  // Check type
  if (typeof value !== 'string') {
    return handleValidationError(`${fieldName} must be a string`, { provided: typeof value });
  }

  const trimmed = value.trim();

  // Check not empty
  if (trimmed === '') {
    return handleValidationError(`${fieldName} cannot be empty`);
  }

  // Check minimum length
  if (options?.minLength && trimmed.length < options.minLength) {
    return handleValidationError(
      `${fieldName} must be at least ${options.minLength} characters`,
      { length: trimmed.length }
    );
  }

  // Check maximum length
  if (options?.maxLength && trimmed.length > options.maxLength) {
    return handleValidationError(
      `${fieldName} must be at most ${options.maxLength} characters`,
      { length: trimmed.length }
    );
  }

  return { success: true, data: trimmed };
}

/**
 * Validates that an email address has a basic valid format
 * 
 * @param email - The email to validate
 * @returns Success with lowercase email or validation error
 */
export function validateEmail(email: unknown): DbResult<string> {
  const stringResult = validateString(email, 'email');
  if (!stringResult.success) return stringResult;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(stringResult.data)) {
    return handleValidationError('Invalid email format', { provided: email });
  }

  return { success: true, data: stringResult.data.toLowerCase() };
}

/**
 * Validates that a foreign key reference exists in the database
 * 
 * @param table - The table to check
 * @param idColumn - The ID column to query
 * @param id - The ID value to check
 * @param fieldName - Name of the field for error messages
 * @returns Success with true if exists, or validation error
 * 
 * @example
 * ```typescript
 * const courseExists = await validateForeignKey(
 *   courses,
 *   courses.id,
 *   courseId,
 *   'courseId'
 * );
 * if (!courseExists.success) return courseExists;
 * ```
 */
export async function validateForeignKey(
  table: any,
  idColumn: any,
  id: number,
  fieldName: string
): Promise<DbResult<boolean>> {
  try {
    const result = await db
      .select({ id: idColumn })
      .from(table)
      .where(eq(idColumn, id))
      .limit(1);

    if (result.length === 0) {
      return handleValidationError(
        `Invalid ${fieldName}: referenced record does not exist`,
        { id, table: table }
      );
    }

    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to validate ${fieldName}`,
      code: DbErrorCode.DATABASE_ERROR,
    };
  }
}

/**
 * Validates multiple conditions and returns all results
 * Stops at first failure for efficiency
 * 
 * @param validators - Array of validation functions to execute
 * @returns Success with array of results or first error encountered
 * 
 * @example
 * ```typescript
 * const validation = await validateBatch([
 *   () => validateId(userId),
 *   () => validateRequired(email, 'email'),
 *   () => validateString(name, 'name', { minLength: 2 })
 * ]);
 * if (!validation.success) return validation;
 * ```
 */
export async function validateBatch<T>(
  validators: Array<() => DbResult<T> | Promise<DbResult<T>>>
): Promise<DbResult<T[]>> {
  const results: T[] = [];

  for (const validator of validators) {
    const result = await validator();
    if (!result.success) {
      return result as DbResult<never>;
    }
    results.push(result.data);
  }

  return { success: true, data: results };
}

/**
 * Validates that a value is one of the allowed enum values
 * 
 * @param value - The value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Name of the field for error messages
 * @returns Success with the value or validation error
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): DbResult<T> {
  if (!allowedValues.includes(value as T)) {
    return handleValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      { provided: value, allowed: allowedValues }
    );
  }

  return { success: true, data: value as T };
}

/**
 * Validates that a number is within a specified range
 * 
 * @param value - The number to validate
 * @param fieldName - Name of the field for error messages
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns Success with the number or validation error
 */
export function validateNumberRange(
  value: unknown,
  fieldName: string,
  min?: number,
  max?: number
): DbResult<number> {
  if (typeof value !== 'number' || isNaN(value)) {
    return handleValidationError(`${fieldName} must be a valid number`, { provided: value });
  }

  if (min !== undefined && value < min) {
    return handleValidationError(
      `${fieldName} must be at least ${min}`,
      { provided: value }
    );
  }

  if (max !== undefined && value > max) {
    return handleValidationError(
      `${fieldName} must be at most ${max}`,
      { provided: value }
    );
  }

  return { success: true, data: value };
}

/**
 * Validates that an array is not empty and all items pass validation
 * 
 * @param array - The array to validate
 * @param fieldName - Name of the field for error messages
 * @param itemValidator - Optional validator function for each item
 * @returns Success with the array or validation error
 */
export function validateArray<T>(
  array: unknown,
  fieldName: string,
  itemValidator?: (item: unknown, index: number) => DbResult<T>
): DbResult<T[]> {
  if (!Array.isArray(array)) {
    return handleValidationError(`${fieldName} must be an array`, { provided: typeof array });
  }

  if (array.length === 0) {
    return handleValidationError(`${fieldName} cannot be empty`);
  }

  if (itemValidator) {
    const validatedItems: T[] = [];
    for (let i = 0; i < array.length; i++) {
      const result = itemValidator(array[i], i);
      if (!result.success) {
        return {
          success: false,
          error: `${fieldName}[${i}]: ${result.error}`,
          code: result.code,
        };
      }
      validatedItems.push(result.data);
    }
    return { success: true, data: validatedItems };
  }

  return { success: true, data: array as T[] };
}

/**
 * Validates a date value
 * 
 * @param value - The date to validate (Date object, string, or number)
 * @param fieldName - Name of the field for error messages
 * @returns Success with Date object or validation error
 */
export function validateDate(
  value: unknown,
  fieldName: string
): DbResult<Date> {
  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    return handleValidationError(
      `${fieldName} must be a valid date`,
      { provided: typeof value }
    );
  }

  if (isNaN(date.getTime())) {
    return handleValidationError(`${fieldName} is not a valid date`, { provided: value });
  }

  return { success: true, data: date };
}
