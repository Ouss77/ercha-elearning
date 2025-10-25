"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

// Query keys for consistent cache management
export const progressQueryKeys = {
  all: ["progress"] as const,
  moduleProgress: (moduleId: string, studentId?: string) =>
    [...progressQueryKeys.all, "module", moduleId, studentId] as const,
  courseModuleProgress: (courseId: string, studentId?: string) =>
    [...progressQueryKeys.all, "course-modules", courseId, studentId] as const,
  moduleStats: (courseId: string) =>
    [...progressQueryKeys.all, "module-stats", courseId] as const,
}

// Hook for single module progress
export function useModuleProgress(moduleId: string, studentId?: string) {
  return useQuery({
    queryKey: progressQueryKeys.moduleProgress(moduleId, studentId),
    queryFn: async () => {
      const url = `/api/modules/${moduleId}/progress${studentId ? `?studentId=${studentId}` : ""}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: Boolean(moduleId), // Only run if moduleId exists
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for all module progress in a course
export function useCourseModuleProgress(courseId: string, studentId?: string) {
  return useQuery({
    queryKey: progressQueryKeys.courseModuleProgress(courseId, studentId),
    queryFn: async () => {
      const url = `/api/courses/${courseId}/module-progress${studentId ? `?studentId=${studentId}` : ""}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: Boolean(courseId), // Only run if courseId exists
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for module statistics (teacher view)
export function useModuleStats(courseId: string) {
  return useQuery({
    queryKey: progressQueryKeys.moduleStats(courseId),
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/module-stats`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: Boolean(courseId), // Only run if courseId exists
    staleTime: 60 * 1000, // 1 minute (stats change less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Utility hook for invalidating progress cache
export function useProgressMutations() {
  const queryClient = useQueryClient()

  const invalidateModuleProgress = (moduleId: string, studentId?: string) => {
    queryClient.invalidateQueries({
      queryKey: progressQueryKeys.moduleProgress(moduleId, studentId),
    })
  }

  const invalidateCourseModuleProgress = (courseId: string, studentId?: string) => {
    queryClient.invalidateQueries({
      queryKey: progressQueryKeys.courseModuleProgress(courseId, studentId),
    })
  }

  const invalidateModuleStats = (courseId: string) => {
    queryClient.invalidateQueries({
      queryKey: progressQueryKeys.moduleStats(courseId),
    })
  }

  const invalidateAllProgress = () => {
    queryClient.invalidateQueries({
      queryKey: progressQueryKeys.all,
    })
  }

  // Prefetch progress data for better UX
  const prefetchModuleProgress = (moduleId: string, studentId?: string) => {
    queryClient.prefetchQuery({
      queryKey: progressQueryKeys.moduleProgress(moduleId, studentId),
      queryFn: async () => {
        const url = `/api/modules/${moduleId}/progress${studentId ? `?studentId=${studentId}` : ""}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      },
      staleTime: 30 * 1000,
    })
  }

  return {
    invalidateModuleProgress,
    invalidateCourseModuleProgress,
    invalidateModuleStats,
    invalidateAllProgress,
    prefetchModuleProgress,
  }
}
