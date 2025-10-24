"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Show logout toast
      toast.success("Déconnexion réussie", {
        description: "À bientôt !",
      });

      // Wait a moment for toast to show before redirecting
      await new Promise((resolve) => setTimeout(resolve, 500));

      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur de déconnexion", {
        description: "Une erreur s'est produite lors de la déconnexion.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  );
}
