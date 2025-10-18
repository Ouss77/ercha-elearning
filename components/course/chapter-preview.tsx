"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Eye, FileText, Video, HelpCircle, ClipboardList, FileCheck } from "lucide-react"
import type { ChapterWithContent, ContentItem } from "@/types/chapter"
import {
  TextContentRenderer,
  VideoContentRenderer,
  QuizContentRenderer,
  TestContentRenderer,
  ExamContentRenderer,
} from "./content-renderers"

interface ChapterPreviewProps {
  chapter: ChapterWithContent
  onClose: () => void
}

export function ChapterPreview({ chapter, onClose }: ChapterPreviewProps) {
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "quiz":
        return <HelpCircle className="h-4 w-4" />
      case "test":
        return <ClipboardList className="h-4 w-4" />
      case "exam":
        return <FileCheck className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Texte"
      case "video":
        return "Vidéo"
      case "quiz":
        return "Quiz"
      case "test":
        return "Test"
      case "exam":
        return "Examen"
      default:
        return type
    }
  }

  const renderContentItem = (contentItem: ContentItem) => {
    const { contentType, contentData } = contentItem

    switch (contentType) {
      case "text":
        if (contentData.type === "text") {
          return <TextContentRenderer content={contentData} />
        }
        break
      case "video":
        if (contentData.type === "video") {
          return <VideoContentRenderer content={contentData} />
        }
        break
      case "quiz":
        if (contentData.type === "quiz") {
          return <QuizContentRenderer content={contentData} />
        }
        break
      case "test":
        if (contentData.type === "test") {
          return <TestContentRenderer content={contentData} />
        }
        break
      case "exam":
        if (contentData.type === "exam") {
          return <ExamContentRenderer content={contentData} />
        }
        break
    }

    return (
      <p className="text-muted-foreground">
        Type de contenu non supporté: {contentType}
      </p>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Preview Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Mode Aperçu
              </Badge>
              <div>
                <h1 className="text-xl font-semibold">{chapter.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Vue étudiante - Lecture seule
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Quitter l'aperçu
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Chapter Header */}
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{chapter.title}</h2>
              {chapter.description && (
                <p className="text-lg text-muted-foreground">
                  {chapter.description}
                </p>
              )}
            </div>

            {chapter.contentItems.length > 0 && (
              <Alert>
                <AlertDescription>
                  Ce chapitre contient {chapter.contentItems.length} élément
                  {chapter.contentItems.length > 1 ? "s" : ""} de contenu
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Content Items */}
          {chapter.contentItems.length > 0 ? (
            <div className="space-y-8">
              {chapter.contentItems.map((contentItem, index) => (
                <Card key={contentItem.id} className="p-6">
                  <div className="space-y-4">
                    {/* Content Item Header */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getContentTypeIcon(contentItem.contentType)}
                            {getContentTypeLabel(contentItem.contentType)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Élément {index + 1} sur {chapter.contentItems.length}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold">
                          {contentItem.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content Item Body */}
                    <div>{renderContentItem(contentItem)}</div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucun contenu</h3>
              <p className="text-muted-foreground">
                Ce chapitre ne contient pas encore d'éléments de contenu.
              </p>
            </Card>
          )}

          {/* Footer Navigation */}
          <div className="flex justify-between items-center pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Fin du chapitre
            </p>
            <Button onClick={onClose} variant="default">
              Retour à l'édition
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
