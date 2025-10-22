/**
 * Pagination utilities for database queries
 * 
 * This module provides utilities for implementing efficient pagination
 * in database queries, including offset-based and cursor-based pagination.
 * 
 * @module pagination
 */

import { SQL, asc, desc } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { DbResult } from "./types";

/**
 * Pagination parameters for offset-based pagination
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Pagination metadata returned with paginated results
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** Array of items for current page */
  items: T[];
  /** Pagination metadata */
  meta: PaginationMeta;
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams {
  /** Cursor value (typically an ID or timestamp) */
  cursor?: string | number;
  /** Number of items to fetch */
  limit: number;
  /** Direction of pagination */
  direction?: 'forward' | 'backward';
}

/**
 * Cursor pagination metadata
 */
export interface CursorPaginationMeta {
  /** Cursor for next page */
  nextCursor: string | number | null;
  /** Cursor for previous page */
  previousCursor: string | number | null;
  /** Whether there are more items */
  hasMore: boolean;
  /** Number of items returned */
  count: number;
}

/**
 * Cursor-paginated result wrapper
 */
export interface CursorPaginatedResult<T> {
  /** Array of items */
  items: T[];
  /** Cursor pagination metadata */
  meta: CursorPaginationMeta;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;

/**
 * Validate and normalize pagination parameters
 * 
 * @param params - Raw pagination parameters
 * @returns Validated pagination parameters
 */
export function validatePaginationParams(
  params: Partial<PaginationParams>
): PaginationParams {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(MIN_PAGE_SIZE, params.pageSize || DEFAULT_PAGE_SIZE)
  );

  return { page, pageSize };
}

/**
 * Calculate pagination metadata
 * 
 * @param page - Current page number
 * @param pageSize - Items per page
 * @param totalItems - Total number of items
 * @returns Pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  pageSize: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Calculate offset for SQL LIMIT/OFFSET pagination
 * 
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Offset value for SQL query
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Apply pagination to a Drizzle query builder
 * 
 * @param query - Drizzle query builder
 * @param params - Pagination parameters
 * @returns Query builder with pagination applied
 * 
 * @example
 * ```typescript
 * const query = db.select().from(users);
 * const paginatedQuery = applyPagination(query, { page: 2, pageSize: 20 });
 * const results = await paginatedQuery;
 * ```
 */
export function applyPagination<T>(
  query: any,
  params: PaginationParams
): any {
  const { page, pageSize } = validatePaginationParams(params);
  const offset = calculateOffset(page, pageSize);

  return query.limit(pageSize).offset(offset);
}

/**
 * Create a paginated result from query results and total count
 * 
 * @param items - Query results
 * @param totalItems - Total count of items
 * @param params - Pagination parameters
 * @returns Paginated result with metadata
 * 
 * @example
 * ```typescript
 * const items = await paginatedQuery;
 * const total = await countQuery;
 * const result = createPaginatedResult(items, total, { page: 1, pageSize: 20 });
 * ```
 */
export function createPaginatedResult<T>(
  items: T[],
  totalItems: number,
  params: PaginationParams
): PaginatedResult<T> {
  const { page, pageSize } = validatePaginationParams(params);
  const meta = calculatePaginationMeta(page, pageSize, totalItems);

  return {
    items,
    meta,
  };
}

/**
 * Helper function to execute a paginated query
 * Executes both the data query and count query in parallel
 * 
 * @param dataQuery - Query to fetch paginated data
 * @param countQuery - Query to count total items
 * @param params - Pagination parameters
 * @returns DbResult with paginated data
 * 
 * @example
 * ```typescript
 * const result = await executePaginatedQuery(
 *   db.select().from(users).where(eq(users.role, 'STUDENT')),
 *   db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'STUDENT')),
 *   { page: 1, pageSize: 20 }
 * );
 * ```
 */
export async function executePaginatedQuery<T>(
  dataQuery: any,
  countQuery: any,
  params: PaginationParams
): Promise<DbResult<PaginatedResult<T>>> {
  try {
    const { page, pageSize } = validatePaginationParams(params);

    // Execute both queries in parallel for better performance
    const [items, countResult] = await Promise.all([
      applyPagination(dataQuery, { page, pageSize }),
      countQuery,
    ]);

    const totalItems = Number(countResult[0]?.count || 0);
    const result = createPaginatedResult(items, totalItems, { page, pageSize });

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Pagination query failed',
    };
  }
}

/**
 * Apply cursor-based pagination to a query
 * More efficient for large datasets and real-time data
 * 
 * @param query - Drizzle query builder
 * @param cursorColumn - Column to use for cursor (typically id or created_at)
 * @param params - Cursor pagination parameters
 * @returns Query builder with cursor pagination applied
 * 
 * @example
 * ```typescript
 * const query = db.select().from(posts);
 * const paginatedQuery = applyCursorPagination(
 *   query,
 *   posts.id,
 *   { cursor: 100, limit: 20, direction: 'forward' }
 * );
 * ```
 */
export function applyCursorPagination<T>(
  query: any,
  cursorColumn: PgColumn,
  params: CursorPaginationParams
): any {
  const { cursor, limit, direction = 'forward' } = params;
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit));

  if (cursor !== undefined) {
    if (direction === 'forward') {
      query = query.where(cursorColumn.gt(cursor));
    } else {
      query = query.where(cursorColumn.lt(cursor));
    }
  }

  // Fetch one extra item to determine if there are more results
  return query.limit(safeLimit + 1);
}

/**
 * Create cursor-paginated result from query results
 * 
 * @param items - Query results (should include one extra item)
 * @param limit - Requested limit
 * @param getCursor - Function to extract cursor value from an item
 * @returns Cursor-paginated result with metadata
 * 
 * @example
 * ```typescript
 * const items = await cursorQuery;
 * const result = createCursorPaginatedResult(
 *   items,
 *   20,
 *   (item) => item.id
 * );
 * ```
 */
export function createCursorPaginatedResult<T>(
  items: T[],
  limit: number,
  getCursor: (item: T) => string | number
): CursorPaginatedResult<T> {
  const hasMore = items.length > limit;
  const resultItems = hasMore ? items.slice(0, limit) : items;

  const nextCursor = hasMore && resultItems.length > 0
    ? getCursor(resultItems[resultItems.length - 1])
    : null;

  const previousCursor = resultItems.length > 0
    ? getCursor(resultItems[0])
    : null;

  return {
    items: resultItems,
    meta: {
      nextCursor,
      previousCursor,
      hasMore,
      count: resultItems.length,
    },
  };
}

/**
 * Helper to add sorting to paginated queries
 * 
 * @param query - Drizzle query builder
 * @param column - Column to sort by
 * @param direction - Sort direction
 * @returns Query builder with sorting applied
 */
export function applySorting<T>(
  query: any,
  column: PgColumn,
  direction: 'asc' | 'desc' = 'desc'
): any {
  return direction === 'asc' ? query.orderBy(asc(column)) : query.orderBy(desc(column));
}
