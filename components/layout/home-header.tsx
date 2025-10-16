"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/auth/logout-button"
import Link from "next/link"
import { getDashboardUrl } from "@/lib/utils/utils"

interface HomeHeaderProps {
  user: {
    name?: string | null
    role: string
    } | null
}

export function HomeHeader({ user }: HomeHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-chart-2 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              EduPlatform
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  Bonjour, {user.name}
                </span>
                <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" asChild>
                  <Link href={getDashboardUrl(user.role)}>Tableau de bord</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button variant="ghost" className="hidden md:inline-flex" asChild>
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" asChild>
                  <Link href="/inscription">Commencer</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
