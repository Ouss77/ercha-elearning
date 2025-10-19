"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import type { DomainFormData } from "./types"

interface DomainFormProps {
  initialData?: DomainFormData
  onSubmit: (data: DomainFormData) => Promise<void>
  onClose: () => void
  isSubmitting: boolean
}

const COLOR_OPTIONS = [
  "#6366f1", // indigo (default)
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
]

export function DomainForm({ initialData, onSubmit, onClose, isSubmitting }: DomainFormProps) {
  const [formData, setFormData] = useState<DomainFormData>(
    initialData || {
      name: "",
      description: "",
      color: "#6366f1",
    }
  )
  
  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    color?: string
  }>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    } else if (formData.name.length > 100) {
      newErrors.name = "Le nom doit contenir 100 caractères maximum"
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "La description doit contenir 1000 caractères maximum"
    }
    
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    if (!hexColorRegex.test(formData.color)) {
      newErrors.color = "Format de couleur hexadécimal invalide"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit(formData)
    } catch (err) {
      // Error is handled in parent component
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nom du domaine <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value })
            if (errors.name) setErrors({ ...errors, name: undefined })
          }}
          placeholder="ex: Informatique"
          disabled={isSubmitting}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.name.length}/100 caractères
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value })
            if (errors.description) setErrors({ ...errors, description: undefined })
          }}
          placeholder="Description du domaine..."
          disabled={isSubmitting}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/1000 caractères
        </p>
      </div>

      <div className="space-y-2">
        <Label>Couleur</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.color === color ? "border-foreground scale-110" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                setFormData({ ...formData, color })
                if (errors.color) setErrors({ ...errors, color: undefined })
              }}
              disabled={isSubmitting}
              aria-label={`Sélectionner la couleur ${color}`}
            />
          ))}
        </div>
        {errors.color && (
          <p className="text-sm text-destructive">{errors.color}</p>
        )}
      </div>

      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Mise à jour..." : "Création..."}
            </>
          ) : (
            initialData ? "Mettre à jour" : "Créer le domaine"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

