/**
 * Query performance profiling utilities
 * 
 * This module provides tools for profiling database query performance,
 * identifying slow queries, and collecting performance metrics.
 * 
 * @module profiler
 */

import { DbResult } from "./types";

/**
 * Query execution metrics
 */
export interface QueryMetrics {
  /** Query identifier or name */
  queryName: string;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Timestamp when query started */
  timestamp: Date;
  /** Whether query was successful */
  success: boolean;
  /** Error message if query failed */
  error?: string;
  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Aggregated query statistics
 */
export interface QueryStats {
  /** Query name */
  queryName: string;
  /** Number of executions */
  count: number;
  /** Total execution time */
  totalTime: number;
  /** Average execution time */
  avgTime: number;
  /** Minimum execution time */
  minTime: number;
  /** Maximum execution time */
  maxTime: number;
  /** Success rate (0-1) */
  successRate: number;
}

/**
 * Performance profiler configuration
 */
interface ProfilerConfig {
  /** Whether profiling is enabled */
  enabled: boolean;
  /** Threshold in ms for slow query warnings */
  slowQueryThreshold: number;
  /** Maximum number of metrics to store */
  maxMetrics: number;
  /** Whether to log slow queries to console */
  logSlowQueries: boolean;
}

/**
 * Query performance profiler
 */
class QueryProfiler {
  private metrics: QueryMetrics[] = [];
  private config: ProfilerConfig;

  constructor(config: Partial<ProfilerConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      slowQueryThreshold: 1000, // 1 second
      maxMetrics: 1000,
      logSlowQueries: true,
      ...config,
    };
  }

  /**
   * Record a query execution
   */
  recordQuery(metrics: QueryMetrics): void {
    if (!this.config.enabled) return;

    // Add to metrics array
    this.metrics.push(metrics);

    // Trim if exceeds max size (keep most recent)
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    // Log slow queries
    if (
      this.config.logSlowQueries &&
      metrics.executionTime > this.config.slowQueryThreshold
    ) {
      console.warn(
        `[SLOW QUERY] ${metrics.queryName} took ${metrics.executionTime}ms`,
        metrics.context
      );
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): QueryMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific query
   */
  getQueryMetrics(queryName: string): QueryMetrics[] {
    return this.metrics.filter((m) => m.queryName === queryName);
  }

  /**
   * Get aggregated statistics for all queries
   */
  getStats(): QueryStats[] {
    const statsByQuery = new Map<string, QueryStats>();

    for (const metric of this.metrics) {
      const existing = statsByQuery.get(metric.queryName);

      if (!existing) {
        statsByQuery.set(metric.queryName, {
          queryName: metric.queryName,
          count: 1,
          totalTime: metric.executionTime,
          avgTime: metric.executionTime,
          minTime: metric.executionTime,
          maxTime: metric.executionTime,
          successRate: metric.success ? 1 : 0,
        });
      } else {
        existing.count++;
        existing.totalTime += metric.executionTime;
        existing.avgTime = existing.totalTime / existing.count;
        existing.minTime = Math.min(existing.minTime, metric.executionTime);
        existing.maxTime = Math.max(existing.maxTime, metric.executionTime);
        existing.successRate =
          (existing.successRate * (existing.count - 1) + (metric.success ? 1 : 0)) /
          existing.count;
      }
    }

    return Array.from(statsByQuery.values()).sort((a, b) => b.avgTime - a.avgTime);
  }

  /**
   * Get slowest queries
   */
  getSlowestQueries(limit: number = 10): QueryMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * Get queries that exceed the slow query threshold
   */
  getSlowQueries(): QueryMetrics[] {
    return this.metrics.filter(
      (m) => m.executionTime > this.config.slowQueryThreshold
    );
  }

  /**
   * Get failed queries
   */
  getFailedQueries(): QueryMetrics[] {
    return this.metrics.filter((m) => !m.success);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Update profiler configuration
   */
  configure(config: Partial<ProfilerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ProfilerConfig {
    return { ...this.config };
  }

  /**
   * Generate a performance report
   */
  generateReport(): string {
    const stats = this.getStats();
    const slowQueries = this.getSlowQueries();
    const failedQueries = this.getFailedQueries();

    let report = '=== Query Performance Report ===\n\n';

    report += `Total Queries: ${this.metrics.length}\n`;
    report += `Slow Queries: ${slowQueries.length}\n`;
    report += `Failed Queries: ${failedQueries.length}\n\n`;

    report += '--- Top 10 Slowest Queries (by average) ---\n';
    stats.slice(0, 10).forEach((stat, i) => {
      report += `${i + 1}. ${stat.queryName}\n`;
      report += `   Count: ${stat.count}, Avg: ${stat.avgTime.toFixed(2)}ms, `;
      report += `Min: ${stat.minTime}ms, Max: ${stat.maxTime}ms\n`;
      report += `   Success Rate: ${(stat.successRate * 100).toFixed(1)}%\n`;
    });

    if (slowQueries.length > 0) {
      report += '\n--- Recent Slow Queries ---\n';
      this.getSlowestQueries(5).forEach((metric, i) => {
        report += `${i + 1}. ${metric.queryName} - ${metric.executionTime}ms\n`;
        if (metric.context) {
          report += `   Context: ${JSON.stringify(metric.context)}\n`;
        }
      });
    }

    if (failedQueries.length > 0) {
      report += '\n--- Recent Failed Queries ---\n';
      failedQueries.slice(-5).forEach((metric, i) => {
        report += `${i + 1}. ${metric.queryName}\n`;
        report += `   Error: ${metric.error}\n`;
      });
    }

    return report;
  }
}

// Global profiler instance
const profiler = new QueryProfiler();

/**
 * Wrapper function to profile a query execution
 * 
 * @param queryName - Name or identifier for the query
 * @param queryFn - Function that executes the query
 * @param context - Additional context for debugging
 * @returns Query result with profiling
 * 
 * @example
 * ```typescript
 * const result = await profileQuery(
 *   'getUserById',
 *   () => getUserById(userId),
 *   { userId }
 * );
 * ```
 */
export async function profileQuery<T>(
  queryName: string,
  queryFn: () => Promise<DbResult<T>>,
  context?: Record<string, any>
): Promise<DbResult<T>> {
  const startTime = performance.now();
  const timestamp = new Date();

  try {
    const result = await queryFn();
    const executionTime = performance.now() - startTime;

    profiler.recordQuery({
      queryName,
      executionTime,
      timestamp,
      success: result.success,
      error: result.success ? undefined : result.error,
      context,
    });

    return result;
  } catch (error) {
    const executionTime = performance.now() - startTime;

    profiler.recordQuery({
      queryName,
      executionTime,
      timestamp,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      context,
    });

    throw error;
  }
}

/**
 * Get all recorded query metrics
 */
export function getQueryMetrics(): QueryMetrics[] {
  return profiler.getMetrics();
}

/**
 * Get aggregated query statistics
 */
export function getQueryStats(): QueryStats[] {
  return profiler.getStats();
}

/**
 * Get slowest queries
 */
export function getSlowestQueries(limit?: number): QueryMetrics[] {
  return profiler.getSlowestQueries(limit);
}

/**
 * Get queries exceeding slow query threshold
 */
export function getSlowQueries(): QueryMetrics[] {
  return profiler.getSlowQueries();
}

/**
 * Get failed queries
 */
export function getFailedQueries(): QueryMetrics[] {
  return profiler.getFailedQueries();
}

/**
 * Clear all profiling data
 */
export function clearProfiler(): void {
  profiler.clear();
}

/**
 * Configure the profiler
 */
export function configureProfiler(config: Partial<ProfilerConfig>): void {
  profiler.configure(config);
}

/**
 * Get profiler configuration
 */
export function getProfilerConfig(): ProfilerConfig {
  return profiler.getConfig();
}

/**
 * Generate and return a performance report
 */
export function generatePerformanceReport(): string {
  return profiler.generateReport();
}

/**
 * Log performance report to console
 */
export function logPerformanceReport(): void {
  console.log(generatePerformanceReport());
}

/**
 * Decorator for profiling class methods
 * 
 * @example
 * ```typescript
 * class UserService {
 *   @profileMethod('UserService.getUser')
 *   async getUser(id: number) {
 *     return getUserById(id);
 *   }
 * }
 * ```
 */
export function profileMethod(queryName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return profileQuery(
        queryName,
        () => originalMethod.apply(this, args),
        { args }
      );
    };

    return descriptor;
  };
}
