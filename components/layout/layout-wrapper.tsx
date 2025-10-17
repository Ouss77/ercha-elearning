"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"

interface LayoutWrapperProps {
  role: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT"
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: "ADMIN" | "SUB_ADMIN" | "TRAINER" | "STUDENT"
  }
  children: React.ReactNode
}

export function LayoutWrapper({ role, user, children }: LayoutWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar role={role} />
      <MobileNav role={role} open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <div className="lg:pl-64 w-full">
        <Header user={user} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="py-6 px-4 lg:px-8 max-w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
