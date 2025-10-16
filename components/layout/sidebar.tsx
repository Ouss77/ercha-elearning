"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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

interface SidebarProps {
  role: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT"
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
    { title: "Dashboard", href: "/sub-admin", icon: LayoutDashboard },
    { title: "Enrollments", href: "/sub-admin/enrollments", icon: UserCog },
    { title: "Students", href: "/sub-admin/students", icon: Users },
    { title: "Analytics", href: "/sub-admin/analytics", icon: BarChart3 },
    { title: "Notes", href: "/sub-admin/notes", icon: FileText },
  ],
  TRAINER: [
    { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { title: "My Courses", href: "/teacher/courses", icon: BookOpen },
    { title: "Students", href: "/teacher/students", icon: Users },
    { title: "Quizzes", href: "/teacher/quizzes", icon: ClipboardList },
    { title: "Feedback", href: "/teacher/feedback", icon: FileText },
  ],
  STUDENT: [
    { title: "Dashboard", href: "/student", icon: LayoutDashboard },
    { title: "My Courses", href: "/student/courses", icon: BookOpen },
    { title: "Progress", href: "/student/progress", icon: BarChart3 },
    { title: "Certificates", href: "/student/certificates", icon: Award },
    { title: "Profile", href: "/student/profile", icon: User },
  ],
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const menuItems = menuItemsByRole[role] || []

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <GraduationCap className="h-8 w-8 text-sidebar-primary" />
          <span className="ml-2 text-xl font-bold text-sidebar-foreground">EduPlatform</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                  )}
                />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
