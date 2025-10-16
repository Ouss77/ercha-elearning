"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  Settings,
  UserCog,
  GraduationCap,
  ClipboardList,
  FileText,
  Award,
  User,
} from "lucide-react"

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface MobileNavProps {
  role: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT"
  open: boolean
  onOpenChange: (open: boolean) => void
}

const menuItemsByRole: Record<string, MenuItem[]> = {
  ADMIN: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Courses", href: "/admin/courses", icon: BookOpen },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { title: "Compliance", href: "/admin/compliance", icon: Shield },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ],
  SUB_ADMIN: [
    { title: "Dashboard", href: "/sous-admin", icon: LayoutDashboard },
    { title: "Enrollments", href: "/sous-admin/enrollments", icon: UserCog },
    { title: "Students", href: "/sous-admin/students", icon: Users },
    { title: "Analytics", href: "/sous-admin/analytics", icon: BarChart3 },
    { title: "Notes", href: "/sous-admin/notes", icon: FileText },
  ],
  TRAINER: [
    { title: "Dashboard", href: "/formateur", icon: LayoutDashboard },
    { title: "My Courses", href: "/formateur/courses", icon: BookOpen },
    { title: "Students", href: "/formateur/students", icon: Users },
    { title: "Quizzes", href: "/formateur/quizzes", icon: ClipboardList },
    { title: "Feedback", href: "/formateur/feedback", icon: FileText },
  ],
  STUDENT: [
    { title: "Dashboard", href: "/etudiant", icon: LayoutDashboard },
    { title: "My Courses", href: "/etudiant/courses", icon: BookOpen },
    { title: "Progress", href: "/etudiant/progress", icon: BarChart3 },
    { title: "Certificates", href: "/etudiant/certificates", icon: Award },
    { title: "Profile", href: "/etudiant/profile", icon: User },
  ],
}

export function MobileNav({ role, open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()
  const menuItems = menuItemsByRole[role] || []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-border p-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <SheetTitle className="text-lg font-bold">EduPlatform</SheetTitle>
          </div>
        </SheetHeader>
        <nav className="flex flex-col space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
