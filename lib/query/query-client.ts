"use client"

import { QueryClient } from "@tanstack/react-query"

// Create a function that returns a new QueryClient instance
// This ensures each user gets a fresh instance on server side
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache progress data for 30 seconds to reduce database load
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors, only on network/5xx errors
          if (error && typeof error === "object" && "status" in error) {
            const status = error.status as number
            if (status >= 400 && status < 500) {
              return false
            }
          }
          return failureCount < 2
        },
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}
