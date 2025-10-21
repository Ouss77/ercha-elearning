"use client";

import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { getDashboardUrl } from "@/lib/utils/utils";
import { ChevronDown, Code, Palette, TrendingUp, Menu, X } from "lucide-react";

interface HomeHeaderProps {
  user: {
    name?: string | null;
    role: string;
  } | null;
}

export function HomeHeader({ user }: HomeHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-border/50 bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Logo iconSize="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden lg:inline px-3 py-1.5 rounded-md bg-accent/50">
                  Bonjour,{" "}
                  <span className="font-medium text-foreground">
                    {user.name}
                  </span>
                </span>
                <Button
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300"
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
                    <Button
                      variant="ghost"
                      className="hidden md:inline-flex hover:bg-accent/80 transition-colors"
                    >
                      Cours
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <DropdownMenuItem asChild className="rounded-md">
                      <Link
                        href="/cours"
                        className="flex items-center gap-3 cursor-pointer p-3 hover:bg-accent transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-950 dark:to-teal-900 shadow-sm">
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
                        <span className="font-medium">Tous les cours</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-md">
                      <Link
                        href="/cours?domain=Développement Web"
                        className="flex items-center gap-3 cursor-pointer p-3 hover:bg-accent transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 shadow-sm">
                          <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">Développement Web</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-md">
                      <Link
                        href="/cours?domain=Design Graphique"
                        className="flex items-center gap-3 cursor-pointer p-3 hover:bg-accent transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-950 dark:to-violet-900 shadow-sm">
                          <Palette className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="font-medium">Design Graphique</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-md">
                      <Link
                        href="/cours?domain=Marketing Digital"
                        className="flex items-center gap-3 cursor-pointer p-3 hover:bg-accent transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900 shadow-sm">
                          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-medium">Marketing Digital</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  className="hidden md:inline-flex hover:bg-accent/80 transition-colors"
                  asChild
                >
                  <Link href="/a-propos">À Propos</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="hidden md:inline-flex hover:bg-accent/80 transition-colors"
                  asChild
                >
                  <Link href="/contact">Contact</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300"
                  asChild
                >
                  <Link href="/connexion">Connexion</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent/80 transition-colors"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader className="pb-4 border-b border-border">
                  <SheetTitle className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    Navigation
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-6 mt-6 pb-6">
                  {user ? (
                    <>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/50 dark:to-emerald-950/50 border border-teal-200 dark:border-teal-800">
                        <p className="text-xs text-muted-foreground mb-1">
                          Connecté en tant que
                        </p>
                        <p className="font-semibold text-foreground text-lg">
                          {user.name}
                        </p>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all duration-300"
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={getDashboardUrl(user.role)}>
                          Tableau de bord
                        </Link>
                      </Button>
                      <LogoutButton />
                    </>
                  ) : (
                    <>
                      {/* Cours Section */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-foreground mb-3 px-2 text-sm uppercase tracking-wide text-muted-foreground">
                          Cours
                        </h3>
                        <Link
                          href="/cours"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 hover:translate-x-1"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="p-2.5 rounded-lg bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-950 dark:to-teal-900 shadow-sm">
                            <svg
                              className="h-5 w-5 text-teal-600 dark:text-teal-400"
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
                          <span className="font-semibold">Tous les cours</span>
                        </Link>
                        <Link
                          href="/cours?domain=Développement Web"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 hover:translate-x-1"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 shadow-sm">
                            <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-semibold">
                            Développement Web
                          </span>
                        </Link>
                        <Link
                          href="/cours?domain=Design Graphique"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 hover:translate-x-1"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="p-2.5 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-950 dark:to-violet-900 shadow-sm">
                            <Palette className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <span className="font-semibold">
                            Design Graphique
                          </span>
                        </Link>
                        <Link
                          href="/cours?domain=Marketing Digital"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 hover:translate-x-1"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900 shadow-sm">
                            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="font-semibold">
                            Marketing Digital
                          </span>
                        </Link>
                      </div>

                      {/* Other Pages */}
                      <div className="space-y-2 pt-2">
                        <h3 className="font-bold text-foreground mb-3 px-2 text-sm uppercase tracking-wide text-muted-foreground">
                          Pages
                        </h3>
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-accent/80 transition-all duration-200 hover:translate-x-1 font-semibold"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href="/a-propos">À Propos</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-accent/80 transition-all duration-200 hover:translate-x-1 font-semibold"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href="/contact">Contact</Link>
                        </Button>
                      </div>

                      {/* Login Button */}
                      <div className="pt-4 mt-auto max-md:p-4">
                        <Button
                          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href="/connexion">Connexion</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
