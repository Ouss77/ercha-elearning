"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut({ 
        callbackUrl: "/connexion",
        redirect: true 
      })
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {!isLoading && <span className="ml-2">Déconnexion</span>}
    </Button>
  )
}
