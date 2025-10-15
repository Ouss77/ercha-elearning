"use client"

import { GraduationCap, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/logout-button"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT"
  }
  onMenuClick?: () => void
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrateur",
  SUB_ADMIN: "Sous-Admin",
  TRAINER: "Professeur",
  STUDENT: "Étudiant",
}

const roleVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ADMIN: "destructive",
  SUB_ADMIN: "secondary",
  TRAINER: "default",
  STUDENT: "outline",
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo - visible on mobile */}
        <div className="flex items-center space-x-2 lg:hidden">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">EduPlatform</span>
        </div>

        {/* Spacer for desktop */}
        <div className="hidden lg:block flex-1" />

        {/* User profile section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex md:flex-col md:items-start">
              <span className="text-sm font-medium text-foreground">
                {user.name || user.email}
              </span>
              {user.role && (
                <Badge variant={roleVariants[user.role]} className="text-xs">
                  {roleLabels[user.role]}
                </Badge>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
