"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

interface LayoutWrapperProps {
  role: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT";
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT";
  };
  children: React.ReactNode;
}

export function LayoutWrapper({ role, user, children }: LayoutWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <Sidebar role={role} />

      {/* Mobile Navigation */}
      <MobileNav
        role={role}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-[var(--sidebar-width,16rem)] transition-[padding-left] duration-300 ease-in-out">
        <Header user={user} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="py-4 px-3 sm:py-6 sm:px-4 lg:px-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
