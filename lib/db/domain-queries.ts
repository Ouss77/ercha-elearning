/**
 * Domain query functions
 * 
 * This module provides database operations for managing domains (course categories).
 * All functions return standardized DbResult types for consistent error handling.
 */

import { eq, and, desc, sql, ne } from "drizzle-orm";
import { db } from "./index";
import { domains, courses } from "@/drizzle/schema";
import { createBaseQueries } from "./base-queries";
import { validateString, validateId } from "./validation";
import { DbResult } from "./types";
import { handleDbError } from "./error-handler";

// Create base query operations for domains table
const domainBaseQueries = createBaseQueries(domains, domains.id);

/**
 * Get all domains
 * @returns Result with array of all domains
 */
export async function getAllDomains() {
  return domainBaseQueries.findMany();
}

/**
 * Get a domain by ID
 * @param id - The domain ID
 * @returns Result with the domain or null if not found
 */
export async function getDomainById(id: number) {
  return domainBaseQueries.findById(id);
}

/**
 * Create a new domain with name uniqueness validation
 * @param data - Domain data to create
 * @returns Result with the created domain
 */
export async function createDomain(data: {
  name: string;
  description?: string | null;
  color?: string;
}): Promise<DbResult<typeof domains.$inferSelect>> {
  // Validate domain name
  const validName = validateString(data.name, 'name', { minLength: 1, maxLength: 100 });
  if (!validName.success) return validName as any;

  // Check if domain name already exists
  const nameExists = await domainNameExists(validName.data);
  if (!nameExists.success) return nameExists as any;
  
  if (nameExists.data) {
    return {
      success: false,
      error: `Domain with name "${validName.data}" already exists`,
    };
  }

  // Create the domain
  return domainBaseQueries.create({
    name: validName.data,
    description: data.description,
    color: data.color || "#6366f1",
  });
}

/**
 * Update a domain by ID
 * @param id - The domain ID
 * @param data - Partial domain data to update
 * @returns Result with the updated domain
 */
export async function updateDomain(
  id: number,
  data: Partial<{
    name: string;
    description: string | null;
    color: string;
  }>
): Promise<DbResult<typeof domains.$inferSelect>> {
  // Validate name if provided
  if (data.name !== undefined) {
    const validName = validateString(data.name, 'name', { minLength: 1, maxLength: 100 });
    if (!validName.success) return validName as any;

    // Check if name already exists (excluding current domain)
    const nameExists = await domainNameExists(validName.data, id);
    if (!nameExists.success) return nameExists as any;
    
    if (nameExists.data) {
      return {
        success: false,
        error: `Domain with name "${validName.data}" already exists`,
      };
    }

    // Update data with validated name
    data = { ...data, name: validName.data };
  }

  return domainBaseQueries.update(id, data);
}

/**
 * Delete a domain by ID
 * @param id - The domain ID
 * @returns Result with the deleted domain
 */
export async function deleteDomain(id: number) {
  return domainBaseQueries.delete(id);
}

/**
 * Get all domains with their course counts
 * Uses aggregation for optimal performance
 * @returns Result with array of domains including course counts
 */
export async function getDomainsWithCounts(): Promise<DbResult<Array<{
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: Date | null;
  coursesCount: number;
}>>> {
  try {
    const result = await db
      .select({
        id: domains.id,
        name: domains.name,
        description: domains.description,
        color: domains.color,
        createdAt: domains.createdAt,
        coursesCount: sql<number>`cast(count(${courses.id}) as int)`,
      })
      .from(domains)
      .leftJoin(courses, eq(domains.id, courses.domainId))
      .groupBy(domains.id)
      .orderBy(desc(domains.createdAt));

    return { success: true, data: result };
  } catch (error) {
    return handleDbError(error, 'getDomainsWithCounts');
  }
}

/**
 * Check if a domain name already exists
 * @param name - The domain name to check
 * @param excludeId - Optional domain ID to exclude from check (for updates)
 * @returns Result with boolean indicating if name exists
 */
export async function domainNameExists(
  name: string,
  excludeId?: number
): Promise<DbResult<boolean>> {
  // Build the where condition
  const whereCondition = excludeId !== undefined
    ? and(eq(domains.name, name), ne(domains.id, excludeId))
    : eq(domains.name, name);

  // Use the exists utility from base queries
  return domainBaseQueries.exists(whereCondition!);
}

/**
 * Check if a domain has any associated courses
 * @param domainId - The domain ID to check
 * @returns Result with boolean indicating if domain has courses
 */
export async function domainHasCourses(domainId: number): Promise<DbResult<boolean>> {
  // Validate domain ID
  const validId = validateId(domainId);
  if (!validId.success) return validId as any;

  // Use the exists utility from base queries for courses table
  const courseBaseQueries = createBaseQueries(courses, courses.id);
  return courseBaseQueries.exists(eq(courses.domainId, validId.data));
}

