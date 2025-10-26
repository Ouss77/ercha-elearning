"use client"

import { BookOpen, FileText, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  type: "course" | "module" | "chapter"
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const defaultIcons = {
    course: <BookOpen className="h-12 w-12 text-muted-foreground" />,
    module: <FolderOpen className="h-12 w-12 text-muted-foreground" />,
    chapter: <FileText className="h-12 w-12 text-muted-foreground" />,
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">{icon || defaultIcons[type]}</div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  )
}

interface EmptyModuleStateProps {
  courseTitle: string
  onCreateModule: () => void
}

export function EmptyModuleState({ courseTitle, onCreateModule }: EmptyModuleStateProps) {
  return (
    <EmptyState
      type="module"
      title="Aucun module"
      description={`Le cours "${courseTitle}" n'a pas encore de modules. Commencez par créer votre premier module pour organiser le contenu.`}
      actionLabel="Créer le premier module"
      onAction={onCreateModule}
    />
  )
}

interface EmptyChapterStateProps {
  moduleTitle: string
  onCreateChapter: () => void
}

export function EmptyChapterState({ moduleTitle, onCreateChapter }: EmptyChapterStateProps) {
  return (
    <EmptyState
      type="chapter"
      title="Aucun chapitre"
      description={`Le module "${moduleTitle}" n'a pas encore de chapitres. Ajoutez votre premier chapitre pour commencer.`}
      actionLabel="Ajouter un chapitre"
      onAction={onCreateChapter}
    />
  )
}

interface EmptyCourseStateProps {
  onCreateCourse: () => void
}

export function EmptyCourseState({ onCreateCourse }: EmptyCourseStateProps) {
  return (
    <EmptyState
      type="course"
      title="Aucun cours disponible"
      description="Commencez par créer votre premier cours pour organiser votre contenu pédagogique."
      actionLabel="Créer un cours"
      onAction={onCreateCourse}
    />
  )
}
