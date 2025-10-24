"use client";

import { GraduationCap, Link, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAvatarUrl, getUserInitials } from "@/lib/utils/utils";
import { Logo } from "@/components/ui/logo";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT";
  };
  onMenuClick?: () => void;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrateur",
  SUB_ADMIN: "Sous-Admin",
  TRAINER: "Professeur",
  STUDENT: "Étudiant",
};

const roleVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ADMIN: "destructive",
  SUB_ADMIN: "secondary",
  TRAINER: "default",
  STUDENT: "outline",
};

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "SUB_ADMIN":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    case "TRAINER":
      return "bg-primary/10 text-primary border-primary/20";
    case "STUDENT":
      return "bg-chart-2/10 text-chart-2 border-chart-2/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function Header({ user, onMenuClick }: HeaderProps) {
  const avatarSrc = getAvatarUrl(user.image);
  const initials = getUserInitials(user.name);

  // Get dashboard href based on role
  const dashboardHref = user.role
    ? {
        ADMIN: "/admin",
        SUB_ADMIN: "/sous-admin",
        TRAINER: "/formateur",
        STUDENT: "/etudiant",
      }[user.role] || "/"
    : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between gap-2 px-2 sm:px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-primary/10 flex-shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo - visible on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden flex-1 min-w-0">
          <Logo iconSize="sm" href={dashboardHref} />
        </div>

        {/* Spacer for desktop */}
        <div className="hidden lg:block flex-1" />

        {/* User profile section */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-primary/20 flex-shrink-0">
              <AvatarImage src={avatarSrc} alt={user.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary font-semibold text-xs sm:text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex md:flex-col md:items-start min-w-0">
              <span className="text-sm font-semibold text-foreground truncate max-w-[120px] lg:max-w-[200px]">
                {user.name || user.email}
              </span>
              {user.role && (
                <Badge
                  className={`text-xs border whitespace-nowrap ${getRoleBadgeClass(
                    user.role
                  )}`}
                >
                  {roleLabels[user.role]}
                </Badge>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
