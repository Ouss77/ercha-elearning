/**
 * Query result caching utilities
 * 
 * This module provides in-memory caching for frequently accessed database queries
 * to reduce database load and improve response times.
 * 
 * Features:
 * - TTL-based cache expiration
 * - Automatic cache invalidation
 * - Type-safe cache keys
 * - Memory-efficient LRU eviction
 * 
 * @module cache
 */

import { DbResult } from "./types";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * Simple in-memory cache with TTL support
 * Uses Map for O(1) lookups and automatic ordering
 */
class QueryCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private hits: number;
  private misses: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get a value from the cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    
    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.data;
  }

  /**
   * Set a value in the cache with TTL in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a specific key from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   * Useful for invalidating related cache entries
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }
}

// Global cache instance
const queryCache = new QueryCache(1000);

/**
 * Cache key builders for different entity types
 * Ensures consistent key naming across the application
 */
export const CacheKeys = {
  user: (id: number) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  course: (id: number) => `course:${id}`,
  courseWithDetails: (id: number) => `course:details:${id}`,
  coursesWithDetails: () => `courses:details:all`,
  coursesByTeacher: (teacherId: number) => `courses:teacher:${teacherId}`,
  coursesByDomain: (domainId: number) => `courses:domain:${domainId}`,
  domain: (id: number) => `domain:${id}`,
  domains: () => `domains:all`,
  domainsWithCounts: () => `domains:counts`,
  enrollment: (id: number) => `enrollment:${id}`,
  enrollmentsByStudent: (studentId: number) => `enrollments:student:${studentId}`,
  enrollmentsByCourse: (courseId: number) => `enrollments:course:${courseId}`,
  chaptersByCourse: (courseId: number) => `chapters:course:${courseId}`,
  chaptersWithContent: (courseId: number) => `chapters:content:course:${courseId}`,
  chapterProgress: (studentId: number, chapterId: number) => 
    `progress:student:${studentId}:chapter:${chapterId}`,
  studentProgressByCourse: (studentId: number, courseId: number) => 
    `progress:student:${studentId}:course:${courseId}`,
  teacherDashboard: (teacherId: number) => `dashboard:teacher:${teacherId}`,
  teacherCourseDetails: (courseId: number, teacherId: number) => 
    `course:details:${courseId}:teacher:${teacherId}`,
};

/**
 * Cache invalidation patterns for different operations
 * When data changes, invalidate related cache entries
 */
export const CacheInvalidation = {
  onUserUpdate: (userId: number) => {
    queryCache.delete(CacheKeys.user(userId));
  },
  
  onCourseUpdate: (courseId: number, teacherId?: number) => {
    queryCache.delete(CacheKeys.course(courseId));
    queryCache.delete(CacheKeys.courseWithDetails(courseId));
    queryCache.delete(CacheKeys.coursesWithDetails());
    if (teacherId) {
      queryCache.delete(CacheKeys.coursesByTeacher(teacherId));
      queryCache.delete(CacheKeys.teacherDashboard(teacherId));
    }
  },
  
  onDomainUpdate: (domainId: number) => {
    queryCache.delete(CacheKeys.domain(domainId));
    queryCache.delete(CacheKeys.domains());
    queryCache.delete(CacheKeys.domainsWithCounts());
    queryCache.delete(CacheKeys.coursesByDomain(domainId));
  },
  
  onEnrollmentUpdate: (studentId: number, courseId: number) => {
    queryCache.delete(CacheKeys.enrollmentsByStudent(studentId));
    queryCache.delete(CacheKeys.enrollmentsByCourse(courseId));
    queryCache.deletePattern(`progress:student:${studentId}`);
  },
  
  onChapterUpdate: (courseId: number) => {
    queryCache.delete(CacheKeys.chaptersByCourse(courseId));
    queryCache.delete(CacheKeys.chaptersWithContent(courseId));
  },
  
  onProgressUpdate: (studentId: number, courseId?: number) => {
    queryCache.deletePattern(`progress:student:${studentId}`);
    if (courseId) {
      queryCache.deletePattern(`dashboard:teacher:.*`);
    }
  },
};

/**
 * Wrapper function to cache query results
 * 
 * @param key - Cache key
 * @param ttlSeconds - Time to live in seconds
 * @param queryFn - Function that executes the query
 * @returns Cached result or fresh query result
 * 
 * @example
 * ```typescript
 * const result = await withCache(
 *   CacheKeys.user(userId),
 *   300, // 5 minutes
 *   () => getUserById(userId)
 * );
 * ```
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  queryFn: () => Promise<DbResult<T>>
): Promise<DbResult<T>> {
  // Try to get from cache
  const cached = queryCache.get<DbResult<T>>(key);
  if (cached) {
    return cached;
  }

  // Execute query
  const result = await queryFn();

  // Only cache successful results
  if (result.success) {
    queryCache.set(key, result, ttlSeconds);
  }

  return result;
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): CacheStats {
  return queryCache.getStats();
}

/**
 * Clear all cache entries
 * Useful for testing or manual cache invalidation
 */
export function clearCache(): void {
  queryCache.clear();
}

/**
 * Recommended TTL values for different data types
 */
export const CacheTTL = {
  /** Static data that rarely changes (5 minutes) */
  STATIC: 300,
  
  /** Frequently accessed data (2 minutes) */
  FREQUENT: 120,
  
  /** Real-time data (30 seconds) */
  REALTIME: 30,
  
  /** Dashboard data (1 minute) */
  DASHBOARD: 60,
  
  /** List data (3 minutes) */
  LIST: 180,
};
