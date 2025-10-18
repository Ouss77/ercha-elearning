"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChapterForm } from "./chapter-form"
import { ContentTypeSelector } from "./content-type-selector"
import { TextEditor } from "./text-editor"
import { VideoEditor } from "./video-editor"
import { QuizEditor } from "./quiz-editor"
import { TestEditor } from "./test-editor"
import { ExamEditor } from "./exam-editor"
import { Separator } from "@/components/ui/separator"
import type { Chapter, ContentType, ContentData } from "@/types/chapter"
import { debounce } from "@/lib/utils/utils"
import { showSuccessToast, showErrorToast, showWarningToast } from "@/lib/utils/chapter-error-handler"

interface ChapterEditorProps {
  chapter?: Chapter
  courseId: number
  mode: "create" | "edit"
  onSave: (data: ChapterEditorData) => Promise<void>
  onCancel: () => void
  autoSave?: boolean
  autoSaveDelay?: number
}

export interface ChapterEditorData {
  title: string
  description: string | null
  contentType?: ContentType
  contentData?: ContentData
}

export function ChapterEditor({
  chapter,
  courseId,
  mode,
  onSave,
  onCancel,
  autoSave = false,
  autoSaveDelay = 2000,
}: ChapterEditorProps) {
  const [chapterData, setChapterData] = useState<{
    title: string
    description: string | null
  }>({
    title: chapter?.title || "",
    description: chapter?.description || null,
  })

  const [contentType, setContentType] = useState<ContentType>("text")
  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Track if data has changed for auto-save
  useEffect(() => {
    if (mode === "edit" && chapter) {
      const hasChanged =
        chapterData.title !== chapter.title ||
        chapterData.description !== chapter.description ||
        contentType !== contentType ||
        JSON.stringify(contentData) !== JSON.stringify(contentData)

      setHasUnsavedChanges(hasChanged)
    } else if (mode === "create") {
      setHasUnsavedChanges(chapterData.title.length > 0)
    }
  }, [chapterData, contentType, contentData, chapter, mode])

  // Auto-save functionality with debouncing
  const performAutoSave = useCallback(async () => {
    if (!autoSave || !hasUnsavedChanges || mode === "create") {
      return
    }

    try {
      await onSave({
        title: chapterData.title,
        description: chapterData.description,
        contentType,
        contentData: contentData || undefined,
      })
      setHasUnsavedChanges(false)
      showSuccessToast("Modifications enregistrées automatiquement")
    } catch (error: any) {
      console.error("Auto-save failed:", error)
      // Don't show error toast for auto-save failures to avoid annoying the user
    }
  }, [autoSave, hasUnsavedChanges, mode, chapterData, contentType, contentData, onSave])

  // Debounced auto-save
  const debouncedAutoSave = useMemo(
    () => debounce(performAutoSave, autoSaveDelay),
    [performAutoSave, autoSaveDelay]
  )

  // Trigger auto-save when data changes
  useEffect(() => {
    if (autoSave && hasUnsavedChanges && mode === "edit") {
      debouncedAutoSave()
    }
  }, [autoSave, hasUnsavedChanges, mode, debouncedAutoSave])

  const handleChapterSubmit = async (data: { title: string; description: string | null }) => {
    setIsLoading(true)
    try {
      await onSave({
        ...data,
        contentType,
        contentData: contentData || undefined,
      })
      setHasUnsavedChanges(false)
      // Success toast is handled by the parent component
    } catch (error: any) {
      // Error toast is handled by the parent component
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentTypeChange = (newType: ContentType) => {
    if (contentData && contentType !== newType) {
      // Warn user about data loss when changing content type
      const confirmed = window.confirm(
        "Changer le type de contenu effacera les données actuelles. Voulez-vous continuer ?"
      )
      if (!confirmed) {
        return
      }
      showWarningToast("Type de contenu modifié", "Les données précédentes ont été effacées")
    }

    setContentType(newType)
    setContentData(null)
    setHasUnsavedChanges(true)
  }

  const handleContentDataChange = (data: ContentData) => {
    setContentData(data)
    setHasUnsavedChanges(true)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Créer un nouveau chapitre" : "Modifier le chapitre"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Ajoutez un nouveau chapitre à votre cours"
            : "Modifiez les informations du chapitre"}
          {autoSave && mode === "edit" && (
            <span className="ml-2 text-xs">
              {hasUnsavedChanges ? "• Modifications non enregistrées" : "• Tout est enregistré"}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChapterForm
          initialData={chapter}
          onSubmit={handleChapterSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
        />

        {mode === "edit" && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Contenu du chapitre</h3>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez le type de contenu et configurez-le ci-dessous
                </p>
              </div>

              <ContentTypeSelector
                value={contentType}
                onChange={handleContentTypeChange}
                disabled={isLoading}
              />

              {/* Content editors based on selected type */}
              {contentType === "text" && (
                <TextEditor
                  value={contentData?.type === "text" ? contentData : null}
                  onChange={handleContentDataChange}
                  disabled={isLoading}
                />
              )}

              {contentType === "video" && (
                <VideoEditor
                  value={contentData?.type === "video" ? contentData : null}
                  onChange={handleContentDataChange}
                  disabled={isLoading}
                />
              )}

              {contentType === "quiz" && (
                <QuizEditor
                  value={contentData?.type === "quiz" ? contentData : null}
                  onChange={handleContentDataChange}
                  disabled={isLoading}
                />
              )}

              {contentType === "test" && (
                <TestEditor
                  value={contentData?.type === "test" ? contentData : null}
                  onChange={handleContentDataChange}
                  disabled={isLoading}
                />
              )}

              {contentType === "exam" && (
                <ExamEditor
                  value={contentData?.type === "exam" ? contentData : null}
                  onChange={handleContentDataChange}
                  disabled={isLoading}
                />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
