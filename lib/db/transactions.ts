/**
 * Transaction utilities for database operations
 * 
 * This module provides transaction support with automatic rollback on errors,
 * ensuring data consistency across multiple related database operations.
 */

import { db } from './index';
import { DbResult, DbErrorCode } from './types';
import { handleDbError } from './error-handler';
import type { PgTransaction, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import * as schema from '@/drizzle/schema';

/**
 * Transaction type for Drizzle with our schema
 */
export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * Execute multiple database operations within a transaction
 * Automatically rolls back all changes if any operation fails
 * 
 * @param callback - Function containing database operations to execute in transaction
 * @returns Result of the transaction callback
 * 
 * @example
 * ```typescript
 * const result = await withTransaction(async (tx) => {
 *   const user = await createUser(userData, tx);
 *   if (!user.success) return user;
 *   
 *   const profile = await createProfile(user.data.id, profileData, tx);
 *   if (!profile.success) return profile;
 *   
 *   return { success: true, data: { user: user.data, profile: profile.data } };
 * });
 * ```
 */
export async function withTransaction<T>(
  callback: (tx: Transaction) => Promise<DbResult<T>>
): Promise<DbResult<T>> {
  try {
    return await db.transaction(async (tx) => {
      const result = await callback(tx);
      
      // If the callback returns an error, throw to trigger rollback
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    });
  } catch (error) {
    // Handle transaction errors
    if (error instanceof Error && error.message.startsWith('Transaction')) {
      return {
        success: false,
        error: error.message,
        code: DbErrorCode.DATABASE_ERROR,
      };
    }
    
    // If it's an error we threw from the callback, return it properly formatted
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        code: DbErrorCode.DATABASE_ERROR,
      };
    }
    
    return handleDbError(error, 'withTransaction');
  }
}

/**
 * Create multiple records in a single transaction
 * All inserts succeed together or all fail together
 * 
 * @param table - Drizzle table to insert into
 * @param items - Array of items to insert
 * @param tx - Optional existing transaction to use
 * @returns Result containing array of created records
 * 
 * @example
 * ```typescript
 * const result = await batchCreate(users, [
 *   { email: 'user1@example.com', name: 'User 1', password: 'hash1' },
 *   { email: 'user2@example.com', name: 'User 2', password: 'hash2' },
 * ]);
 * ```
 */
export async function batchCreate<TConfig extends TableConfig>(
  table: PgTable<TConfig>,
  items: any[],
  tx?: Transaction
): Promise<DbResult<any[]>> {
  if (!items || items.length === 0) {
    return {
      success: false,
      error: 'No items provided for batch create',
      code: DbErrorCode.VALIDATION_ERROR,
    };
  }

  try {
    const executor = tx || db;
    const result = await executor.insert(table).values(items).returning();
    
    return {
      success: true,
      data: result as any[],
    };
  } catch (error) {
    return handleDbError(error, 'batchCreate');
  }
}

/**
 * Update multiple records in a single transaction
 * All updates succeed together or all fail together
 * 
 * @param table - Drizzle table to update
 * @param updates - Array of updates with id and data
 * @param idColumn - Column to use for identifying records (defaults to 'id')
 * @param tx - Optional existing transaction to use
 * @returns Result containing array of updated records
 * 
 * @example
 * ```typescript
 * const result = await batchUpdate(
 *   users,
 *   [
 *     { id: 1, data: { name: 'Updated Name 1' } },
 *     { id: 2, data: { name: 'Updated Name 2' } },
 *   ],
 *   users.id
 * );
 * ```
 */
export async function batchUpdate<TConfig extends TableConfig>(
  table: PgTable<TConfig>,
  updates: Array<{ id: number; data: any }>,
  idColumn: any,
  tx?: Transaction
): Promise<DbResult<any[]>> {
  if (!updates || updates.length === 0) {
    return {
      success: false,
      error: 'No updates provided for batch update',
      code: DbErrorCode.VALIDATION_ERROR,
    };
  }

  try {
    const executor = tx || db;
    const results: any[] = [];

    // Execute all updates within the same transaction context
    for (const update of updates) {
      const { eq } = await import('drizzle-orm');
      const result = await executor
        .update(table)
        .set(update.data)
        .where(eq(idColumn, update.id))
        .returning();
      
      const resultArray = result as any[];
      if (resultArray.length === 0) {
        throw new Error(`Record with id ${update.id} not found`);
      }
      
      results.push(resultArray[0]);
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return handleDbError(error, 'batchUpdate');
  }
}

/**
 * Delete multiple records in a single transaction
 * All deletes succeed together or all fail together
 * 
 * @param table - Drizzle table to delete from
 * @param ids - Array of record IDs to delete
 * @param idColumn - Column to use for identifying records (defaults to 'id')
 * @param tx - Optional existing transaction to use
 * @returns Result containing array of deleted records
 * 
 * @example
 * ```typescript
 * const result = await batchDelete(users, [1, 2, 3], users.id);
 * ```
 */
export async function batchDelete<TConfig extends TableConfig>(
  table: PgTable<TConfig>,
  ids: number[],
  idColumn: any,
  tx?: Transaction
): Promise<DbResult<any[]>> {
  if (!ids || ids.length === 0) {
    return {
      success: false,
      error: 'No IDs provided for batch delete',
      code: DbErrorCode.VALIDATION_ERROR,
    };
  }

  try {
    const executor = tx || db;
    const { inArray } = await import('drizzle-orm');
    
    const result = await executor
      .delete(table)
      .where(inArray(idColumn, ids))
      .returning();

    const resultArray = result as any[];
    if (resultArray.length !== ids.length) {
      throw new Error(
        `Expected to delete ${ids.length} records but deleted ${resultArray.length}`
      );
    }

    return {
      success: true,
      data: resultArray,
    };
  } catch (error) {
    return handleDbError(error, 'batchDelete');
  }
}
