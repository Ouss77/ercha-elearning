"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createChapterSchema } from "@/lib/schemas/chapter"
import type { Chapter } from "@/types/chapter"
import { toast } from "sonner"

interface ChapterFormProps {
  initialData?: Partial<Chapter>
  onSubmit: (data: { title: string; description: string | null }) => Promise<void> | void
  onCancel: () => void
  isLoading?: boolean
}

export function ChapterForm({ initialData, onSubmit, onCancel, isLoading = false }: ChapterFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    try {
      createChapterSchema.parse({
        title: formData.title,
        description: formData.description || null,
      })
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {}
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
      }
      setErrors(fieldErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
      })
    } catch (error: any) {
      toast.error(error.message || "Une erreur s'est produite")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value })
    if (errors.title) {
      setErrors({ ...errors, title: "" })
    }
  }

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value })
    if (errors.description) {
      setErrors({ ...errors, description: "" })
    }
  }

  const titleLength = formData.title.length
  const descriptionLength = formData.description.length
  const isDisabled = isLoading || isSubmitting

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="chapter-title">
          Titre du chapitre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="chapter-title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Ex: Introduction aux concepts de base"
          disabled={isDisabled}
          aria-invalid={!!errors.title}
          maxLength={200}
        />
        <div className="flex justify-between items-center">
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          <p className={`text-xs ml-auto ${titleLength > 200 ? "text-destructive" : "text-muted-foreground"}`}>
            {titleLength}/200
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chapter-description">Description (optionnel)</Label>
        <Textarea
          id="chapter-description"
          value={formData.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Décrivez brièvement le contenu de ce chapitre..."
          rows={4}
          disabled={isDisabled}
          aria-invalid={!!errors.description}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          <p
            className={`text-xs ml-auto ${descriptionLength > 1000 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {descriptionLength}/1000
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isDisabled}>
          Annuler
        </Button>
        <Button type="submit" disabled={isDisabled}>
          {isSubmitting ? "Enregistrement..." : initialData?.id ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  )
}
