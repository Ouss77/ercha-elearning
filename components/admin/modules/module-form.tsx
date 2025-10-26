"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldTooltip } from "@/components/ui/help-tooltip"
import { createModuleSchema } from "@/lib/schemas/module"
import type { Module } from "@/types/module"
import { toast } from "sonner"

type FormData = z.infer<typeof createModuleSchema>

interface ModuleFormProps {
  initialData?: Partial<Module>
  onSubmit: (data: FormData) => Promise<void> | void
  onCancel: () => void
  isLoading?: boolean
}

export function ModuleForm({ initialData, onSubmit, onCancel, isLoading = false }: ModuleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  })

  const onSubmitForm = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: data.title.trim(),
        description: data.description?.trim() || null,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur s'est produite")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="title">
            Titre du module <span className="text-destructive">*</span>
          </Label>
          <FieldTooltip 
            content="Le titre apparaîtra dans la navigation du cours et doit être descriptif pour aider les étudiants à comprendre le contenu du module."
          />
        </div>
        <Input
          id="title"
          placeholder="Ex: Introduction aux concepts fondamentaux"
          {...register("title")}
          disabled={isSubmitting || isLoading}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="description">Description (optionnelle)</Label>
          <FieldTooltip 
            content="La description aide les étudiants à comprendre ce qu'ils vont apprendre dans ce module. Elle apparaît sous le titre dans la liste des modules."
          />
        </div>
        <Textarea
          id="description"
          placeholder="Décrivez le contenu et les objectifs de ce module..."
          rows={4}
          {...register("description")}
          disabled={isSubmitting || isLoading}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Maximum 1000 caractères
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? "Enregistrement..." : initialData ? "Mettre à jour" : "Créer le module"}
        </Button>
      </div>
    </form>
  )
}
