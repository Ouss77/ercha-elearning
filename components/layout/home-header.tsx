"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { getDashboardUrl } from "@/lib/utils/utils";

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
