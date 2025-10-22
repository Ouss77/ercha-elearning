"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import { Logo } from "@/components/ui/logo";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  Settings,
  UserCog,
  ClipboardList,
  FileText,
  Award,
  User,
  Activity,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  role: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT";
}

const menuItemsByRole: Record<string, MenuItem[]> = {
  ADMIN: [
    { title: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { title: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
    { title: "Classes", href: "/admin/classes", icon: UserCog },
    { title: "Cours", href: "/admin/cours", icon: BookOpen },
    { title: "Domaines", href: "/admin/domaines", icon: Activity },
    { title: "Analytique", href: "/admin/analytics", icon: BarChart3 },
    { title: "Conformité", href: "/admin/compliance", icon: Shield },
    { title: "Paramètres", href: "/admin/settings", icon: Settings },
  ],
  SUB_ADMIN: [
    { title: "Tableau de bord", href: "/sous-admin", icon: LayoutDashboard },
    { title: "Classes", href: "/admin/classes", icon: UserCog },
    { title: "Inscriptions", href: "/sous-admin/enrollments", icon: ClipboardList },
    { title: "Étudiants", href: "/sous-admin/students", icon: Users },
    { title: "Analytique", href: "/sous-admin/analytics", icon: BarChart3 },
    { title: "Notes", href: "/sous-admin/notes", icon: FileText },
  ],
  TRAINER: [
    { title: "Tableau de bord", href: "/formateur", icon: LayoutDashboard },
    { title: "Mes Cours", href: "/formateur/cours", icon: BookOpen },
    { title: "Étudiants", href: "/formateur/etudiants", icon: Users },
    { title: "Projets", href: "/formateur/projets", icon: FileText },
    { title: "Mon Profil", href: "/formateur/profil", icon: User },
  ],
  STUDENT: [
    { title: "Tableau de bord", href: "/etudiant", icon: LayoutDashboard },
    { title: "Mes Cours", href: "/etudiant/cours", icon: BookOpen },
    { title: "Ma Progression", href: "/etudiant/progres", icon: BarChart3 },
    { title: "Mes Certificats", href: "/etudiant/certifications", icon: Award },
    { title: "Mon Profil", href: "/etudiant/profil", icon: User },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = menuItemsByRole[role] || [];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border/50">
      <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <Logo iconSize="md" />
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-chart-2/10 text-primary border-l-4 border-primary shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary" : "text-sidebar-foreground/60"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
