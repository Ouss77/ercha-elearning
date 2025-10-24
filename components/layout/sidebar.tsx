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
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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
    {
      title: "Inscriptions",
      href: "/sous-admin/enrollments",
      icon: ClipboardList,
    },
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
    { title: "Mes Jalons", href: "/etudiant/jalons", icon: Target },
    { title: "Mon Profil", href: "/etudiant/profil", icon: User },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = menuItemsByRole[role] || [];
  const [isMinimized, setIsMinimized] = useState(false);

  // Get dashboard href based on role
  const dashboardHref =
    {
      ADMIN: "/admin",
      SUB_ADMIN: "/sous-admin",
      TRAINER: "/formateur",
      STUDENT: "/etudiant",
    }[role] || "/";

  // Auto-minimize on course detail pages
  useEffect(() => {
    const isCourseDetailPage = /\/cours\/\d+/.test(pathname);
    setIsMinimized(isCourseDetailPage);
  }, [pathname]);

  // Update CSS variable and layout padding
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        isMinimized ? "5rem" : "16rem"
      );
    }
  }, [isMinimized]);

  const handleToggle = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col fixed inset-y-0 z-30",
        "bg-sidebar border-r border-sidebar-border/50",
        "transition-all duration-300 ease-in-out",
        "overflow-hidden",
        isMinimized ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col flex-1 overflow-hidden pt-5 pb-4">
        <div
          className={cn(
            "flex items-center flex-shrink-0 mb-6 transition-all duration-300 ease-in-out",
            isMinimized ? "justify-center px-2" : "px-4"
          )}
        >
          <Logo iconSize="md" showText={!isMinimized} href={dashboardHref} />
        </div>

        <TooltipProvider>
          <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-lg transition-all duration-300 ease-in-out overflow-hidden",
                        isMinimized ? "justify-center p-3" : "px-3 py-2.5",
                        isActive
                          ? isMinimized
                            ? "bg-gradient-to-r from-primary/10 to-chart-2/10 text-primary shadow-sm ring-2 ring-primary/20"
                            : "bg-gradient-to-r from-primary/10 to-chart-2/10 text-primary border-l-4 border-primary shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        !isMinimized && "hover:translate-x-1"
                      )}
                    >
                      <Icon
                        className={cn(
                          "flex-shrink-0 transition-all duration-300 ease-in-out group-hover:scale-110",
                          isMinimized ? "h-6 w-6" : "h-5 w-5 mr-3",
                          isActive
                            ? "text-primary"
                            : "text-sidebar-foreground/60"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out",
                          isMinimized
                            ? "w-0 opacity-0 invisible"
                            : "w-auto opacity-100 visible"
                        )}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  {isMinimized && (
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>

        {/* Toggle Button - Professional Design */}
        <TooltipProvider>
          <div
            className={cn(
              "flex items-center pt-4 pb-3 border-t border-sidebar-border/30 transition-all duration-300",
              isMinimized ? "justify-center px-2" : "justify-end px-4"
            )}
          >
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggle}
                  className={cn(
                    "relative group",
                    "h-9 w-9 rounded-lg",
                    "bg-gradient-to-br from-primary/5 to-chart-2/5",
                    "border border-primary/20",
                    "hover:from-primary/10 hover:to-chart-2/10",
                    "hover:border-primary/30",
                    "hover:shadow-lg hover:shadow-primary/10",
                    "active:scale-95",
                    "transition-all duration-300 ease-in-out"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-chart-2/0 group-hover:from-primary/5 group-hover:to-chart-2/5 rounded-lg transition-all duration-300" />
                  {isMinimized ? (
                    <ChevronRight className="h-4 w-4 text-primary relative z-10 transition-transform group-hover:translate-x-0.5" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 text-primary relative z-10 transition-transform group-hover:-translate-x-0.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side={isMinimized ? "right" : "top"}
                className="font-medium"
              >
                {isMinimized ? "Agrandir" : "Réduire"}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </aside>
  );
}
