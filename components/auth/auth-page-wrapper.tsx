"use client"

import { ThemeToggle } from "@/components/theme-toggle"

export function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-primary/5 p-4 relative overflow-hidden">
      {/* Theme toggle button - top right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl"></div>
      
      {children}
    </div>
  )
}
