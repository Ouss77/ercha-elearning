"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { z } from "zod";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
  >({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      // Validate with Zod
      const validatedData = loginSchema.parse({ email, password });

      // Use NextAuth signIn
      const result = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else if (result?.ok) {
        // Get session to determine role-based redirect
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (session?.user?.role) {
          // Role-based redirect
          switch (session.user.role) {
            case "ADMIN":
              router.push("/admin");
              break;
            case "SUB_ADMIN":
              router.push("/sub-admin");
              break;
            case "TRAINER":
              router.push("/teacher");
              break;
            case "STUDENT":
              router.push("/student");
              break;
            default:
              router.push("/");
          }
          router.refresh();
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle validation errors
        const errors: Partial<Record<keyof LoginInput, string>> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as keyof LoginInput] = error.message;
          }
        });
        setFieldErrors(errors);
      } else {
        setError("Erreur de connexion. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          disabled={isLoading}
          className={fieldErrors.email ? "border-destructive" : ""}
        />
        {fieldErrors.email && (
          <p className="text-sm text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          className={fieldErrors.password ? "border-destructive" : ""}
        />
        {fieldErrors.password && (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>

      <div className="text-sm text-muted-foreground text-center">
        <p>
          Pas encore de compte ?{" "}
          <a href="/register" className="text-primary hover:underline">
            S'inscrire
          </a>
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 border border-yellow-300 rounded text-sm text-yellow-800">
            <p className="font-semibold">Mode développement</p>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Connexion simplifiée :</strong>
              </p>
              <p>• Utilisez n'importe quel email et mot de passe</p>
              <p>• admin@example.com → Rôle Admin</p>
              <p>• subadmin@example.com → Rôle Sub Admin</p>
              <p>• trainer@example.com → Rôle Formateur</p>
              <p>• student@example.com → Rôle Étudiant</p>
              <p>
                • Mot de passe pour tous les comptes de test : "password123"
              </p>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
