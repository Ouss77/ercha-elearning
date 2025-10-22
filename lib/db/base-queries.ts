/**
 * Base query utilities for generic CRUD operations
 * 
 * This module provides reusable base functions for common database operations,
 * reducing code duplication and ensuring consistent patterns across all query modules.
 * 
 * @example
 * ```typescript
 * // Create base queries for a table
 * const userBaseQueries = createBaseQueries(users, users.id);
 * 
 * // Use base operations
 * const user = await userBaseQueries.findById(1);
 * const allUsers = await userBaseQueries.findMany();
 * ```
 */

import { eq, sql, SQL } from 'drizzle-orm';
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { db } from './db';
import { DbResult, DbErrorCode } from './types';
import { handleDbError } from './error-handler';
import { validateId } from './validation';

/**
 * Generic interface for base CRUD operations on any table
 */
export interface BaseQueryOperations<TSelect, TInsert> {
  /**
   * Find a single record by ID
   * @param id - The record ID
   * @returns Result with the record or null if not found
   */
  findById(id: number): Promise<DbResult<TSelect | null>>;

  /**
   * Find multiple records matching a condition
   * @param where - Optional SQL condition
   * @returns Result with array of matching records
   */
  findMany(where?: SQL): Promise<DbResult<TSelect[]>>;

  /**
   * Find a single record matching a condition
   * @param where - SQL condition
   * @returns Result with the first matching record or null
   */
  findOne(where: SQL): Promise<DbResult<TSelect | null>>;

  /**
   * Create a new record
   * @param data - The data to insert
   * @returns Result with the created record
   */
  create(data: TInsert): Promise<DbResult<TSelect>>;

  /**
   * Update a record by ID
   * @param id - The record ID
   * @param data - Partial data to update
   * @returns Result with the updated record
   */
  update(id: number, data: Partial<TInsert>): Promise<DbResult<TSelect>>;

  /**
   * Delete a record by ID
   * @param id - The record ID
   * @returns Result with the deleted record
   */
  delete(id: number): Promise<DbResult<TSelect>>;

  /**
   * Check if a record exists matching a condition
   * @param where - SQL condition
   * @returns Result with boolean indicating existence
   */
  exists(where: SQL): Promise<DbResult<boolean>>;

  /**
   * Count records matching a condition
   * @param where - Optional SQL condition
   * @returns Result with the count
   */
  count(where?: SQL): Promise<DbResult<number>>;
}

/**
 * Factory function to create base query operations for any table
 * 
 * @param table - The Drizzle table definition
 * @param idColumn - The ID column of the table
 * @returns Object with base CRUD operations
 * 
 * @example
 * ```typescript
 * import { users } from '@/drizzle/schema';
 * 
 * const userQueries = createBaseQueries(users, users.id);
 * const user = await userQueries.findById(1);
 * ```
 */
export function createBaseQueries<
  TTable extends PgTable,
  TSelect = TTable['$inferSelect'],
  TInsert = TTable['$inferInsert']
>(
  table: TTable,
  idColumn: any
): BaseQueryOperations<TSelect, TInsert> {
  return {
    async findById(id: number): Promise<DbResult<TSelect | null>> {
      const validId = validateId(id);
      if (!validId.success) return validId as any;

      try {
        const result = await db
          .select()
          .from(table as any)
          .where(eq(idColumn, validId.data))
          .limit(1);

        return {
          success: true,
          data: (result[0] as TSelect) || null,
        };
      } catch (error) {
        return handleDbError(error, `findById:${table}`);
      }
    },

    async findMany(where?: SQL): Promise<DbResult<TSelect[]>> {
      try {
        const query = db.select().from(table as any);
        const result = where ? await query.where(where) : await query;

        return {
          success: true,
          data: result as TSelect[],
        };
      } catch (error) {
        return handleDbError(error, `findMany:${table}`);
      }
    },

    async findOne(where: SQL): Promise<DbResult<TSelect | null>> {
      try {
        const result = await db
          .select()
          .from(table as any)
          .where(where)
          .limit(1);

        return {
          success: true,
          data: (result[0] as TSelect) || null,
        };
      } catch (error) {
        return handleDbError(error, `findOne:${table}`);
      }
    },

    async create(data: TInsert): Promise<DbResult<TSelect>> {
      try {
        const result: any = await db
          .insert(table as any)
          .values(data as any)
          .returning();

        if (!result || result.length === 0) {
          return {
            success: false,
            error: 'Failed to create record',
          };
        }

        return {
          success: true,
          data: result[0] as TSelect,
        };
      } catch (error) {
        return handleDbError(error, `create:${table}`);
      }
    },

    async update(id: number, data: Partial<TInsert>): Promise<DbResult<TSelect>> {
      const validId = validateId(id);
      if (!validId.success) return validId as any;

      try {
        const result = await db
          .update(table as any)
          .set(data as any)
          .where(eq(idColumn, validId.data))
          .returning();

        if (!result || result.length === 0) {
          return {
            success: false,
            error: `Record with ID ${validId.data} not found`,
          };
        }

        return {
          success: true,
          data: result[0] as TSelect,
        };
      } catch (error) {
        return handleDbError(error, `update:${table}`);
      }
    },

    async delete(id: number): Promise<DbResult<TSelect>> {
      const validId = validateId(id);
      if (!validId.success) return validId as any;

      try {
        const result: any = await db
          .delete(table as any)
          .where(eq(idColumn, validId.data))
          .returning();

        if (!result || result.length === 0) {
          return {
            success: false,
            error: `Record with ID ${validId.data} not found`,
          };
        }

        return {
          success: true,
          data: result[0] as TSelect,
        };
      } catch (error) {
        return handleDbError(error, `delete:${table}`);
      }
    },

    async exists(where: SQL): Promise<DbResult<boolean>> {
      try {
        const result = await db
          .select({ exists: sql<number>`1` })
          .from(table as any)
          .where(where)
          .limit(1);

        return {
          success: true,
          data: result.length > 0,
        };
      } catch (error) {
        return handleDbError(error, `exists:${table}`);
      }
    },

    async count(where?: SQL): Promise<DbResult<number>> {
      try {
        const query = db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(table as any);

        const result = where ? await query.where(where) : await query;

        return {
          success: true,
          data: result[0]?.count || 0,
        };
      } catch (error) {
        return handleDbError(error, `count:${table}`);
      }
    },
  };
}

/**
 * Helper function to find a record by ID or return an error
 * Useful for operations that require an existing record
 * 
 * @param table - The Drizzle table definition
 * @param idColumn - The ID column of the table
 * @param id - The record ID
 * @param entityName - Name of the entity for error messages
 * @returns Result with the record or NOT_FOUND error
 * 
 * @example
 * ```typescript
 * const userResult = await findByIdOrFail(users, users.id, 1, 'User');
 * if (!userResult.success) return userResult;
 * // userResult.data is guaranteed to exist here
 * ```
 */
export async function findByIdOrFail<TSelect>(
  table: PgTable,
  idColumn: any,
  id: number,
  entityName: string
): Promise<DbResult<TSelect>> {
  const validId = validateId(id);
  if (!validId.success) return validId as any;

  try {
    const result = await db
      .select()
      .from(table as any)
      .where(eq(idColumn, validId.data))
      .limit(1);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: `${entityName} with ID ${validId.data} not found`,
        code: DbErrorCode.NOT_FOUND,
      };
    }

    return {
      success: true,
      data: result[0] as TSelect,
    };
  } catch (error) {
    return handleDbError(error, `findByIdOrFail:${entityName}`);
  }
}

/**
 * Helper function to find a single record or return an error
 * 
 * @param table - The Drizzle table definition
 * @param where - SQL condition
 * @param entityName - Name of the entity for error messages
 * @returns Result with the record or NOT_FOUND error
 */
export async function findOneOrFail<TSelect>(
  table: PgTable,
  where: SQL,
  entityName: string
): Promise<DbResult<TSelect>> {
  try {
    const result = await db
      .select()
      .from(table as any)
      .where(where)
      .limit(1);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: `${entityName} not found`,
        code: DbErrorCode.NOT_FOUND,
      };
    }

    return {
      success: true,
      data: result[0] as TSelect,
    };
  } catch (error) {
    return handleDbError(error, `findOneOrFail:${entityName}`);
  }
}
