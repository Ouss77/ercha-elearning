"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth"
import { z } from "zod"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    consent: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({})
  const router = useRouter()

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleConsentChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      consent: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    try {
      // Validate with Zod
      const validatedData = registerSchema.parse(formData)

      // Call registration API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: validatedData.email,
          password: validatedData.password,
          name: validatedData.name,
          consent: validatedData.consent
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'inscription")
      } else {
        // Redirect to login on success
        router.push("/connexion?registered=true")
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle validation errors
        const errors: Partial<Record<keyof RegisterInput, string>> = {}
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as keyof RegisterInput] = error.message
          }
        })
        setFieldErrors(errors)
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange("name")}
          placeholder="Jean Dupont"
          disabled={isLoading}
          className={fieldErrors.name ? "border-destructive" : ""}
        />
        {fieldErrors.name && (
          <p className="text-sm text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
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
          value={formData.password}
          onChange={handleChange("password")}
          placeholder="••••••••"
          disabled={isLoading}
          className={fieldErrors.password ? "border-destructive" : ""}
        />
        {fieldErrors.password && (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          placeholder="••••••••"
          disabled={isLoading}
          className={fieldErrors.confirmPassword ? "border-destructive" : ""}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="consent"
          checked={formData.consent}
          onCheckedChange={handleConsentChange}
          disabled={isLoading}
          className={fieldErrors.consent ? "border-destructive" : ""}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="consent"
            className="text-sm font-normal leading-snug cursor-pointer"
          >
            J'accepte le traitement de mes données personnelles conformément à la loi 09-08
          </Label>
          {fieldErrors.consent && (
            <p className="text-sm text-destructive">{fieldErrors.consent}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inscription...
          </>
        ) : (
          "S'inscrire"
        )}
      </Button>

      <div className="text-sm text-muted-foreground text-center">
        <p>Vous avez déjà un compte ?{" "}
          <a href="/connexion" className="text-primary font-medium hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </form>
  )
}
