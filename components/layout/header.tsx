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

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "SUB_ADMIN":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20"
    case "TRAINER":
      return "bg-primary/10 text-primary border-primary/20"
    case "STUDENT":
      return "bg-chart-2/10 text-chart-2 border-chart-2/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-primary/10"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo - visible on mobile */}
        <div className="flex items-center space-x-2 lg:hidden">
          <div className="h-8 w-8 bg-gradient-to-br from-primary to-chart-2 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            EduPlatform
          </span>
        </div>

        {/* Spacer for desktop */}
        <div className="hidden lg:block flex-1" />

        {/* User profile section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex md:flex-col md:items-start">
              <span className="text-sm font-semibold text-foreground">
                {user.name || user.email}
              </span>
              {user.role && (
                <Badge className={`text-xs border ${getRoleBadgeClass(user.role)}`}>
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
