"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { getDashboardUrl } from "@/lib/utils/utils";
import { ChevronDown, Code, Palette, TrendingUp } from "lucide-react";

interface HomeHeaderProps {
  user: {
    name?: string | null;
    role: string;
  } | null;
}

export function HomeHeader({ user }: HomeHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo iconSize="md" />
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  Bonjour, {user.name}
                </span>
                <Button
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link href={getDashboardUrl(user.role)}>Tableau de bord</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                {/* Cours Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden md:inline-flex">
                      Cours
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/cours"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="p-1.5 rounded bg-teal-100 dark:bg-teal-950">
                          <svg
                            className="h-4 w-4 text-teal-600 dark:text-teal-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <span>Toutes les formations</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/cours/developpement-web"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950">
                          <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span>Développement Web</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/cours/design-graphique"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-950">
                          <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span>Design Graphique</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/cours/marketing-digital"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="p-1.5 rounded bg-green-100 dark:bg-green-950">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span>Marketing Digital</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  className="hidden md:inline-flex"
                  asChild
                >
                  <Link href="/a-propos">À Propos</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="hidden md:inline-flex"
                  asChild
                >
                  <Link href="/contact">Contact</Link>
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link href="/connexion">Connexion</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
