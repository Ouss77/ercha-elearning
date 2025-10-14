"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Play } from "lucide-react"

interface Chapter {
  id: number
  title: string
  description: string
  orderIndex: number
  contentType: "text" | "video" | "image" | "link"
  contentData: any
  isCompleted: boolean
  isLocked: boolean
  hasQuiz: boolean
}

interface ChapterContentProps {
  chapter: Chapter
  onComplete: (chapterId: number) => void
}

export function ChapterContent({ chapter, onComplete }: ChapterContentProps) {
  const [isCompleted, setIsCompleted] = useState(chapter.isCompleted)

  const handleMarkComplete = () => {
    setIsCompleted(true)
    onComplete(chapter.id)
  }

  const renderContent = () => {
    switch (chapter.contentType) {
      case "text":
        return (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3>Contenu du chapitre</h3>
            <p>
              React est une bibliothèque JavaScript développée par Facebook pour créer des interfaces utilisateur. Elle
              permet de construire des applications web interactives en utilisant des composants réutilisables.
            </p>
            <h4>Concepts clés :</h4>
            <ul>
              <li>
                <strong>Composants</strong> : Blocs de construction réutilisables
              </li>
              <li>
                <strong>JSX</strong> : Syntaxe qui ressemble à HTML dans JavaScript
              </li>
              <li>
                <strong>Props</strong> : Données passées aux composants
              </li>
              <li>
                <strong>State</strong> : Données internes du composant
              </li>
            </ul>
            <p>
              Dans ce chapitre, nous allons explorer ces concepts fondamentaux et voir comment ils s'articulent pour
              créer des applications React robustes et maintenables.
            </p>
          </div>
        )

      case "video":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Vidéo : {chapter.title}</p>
                <p className="text-sm text-muted-foreground">Durée : 15 minutes</p>
              </div>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Cette vidéo couvre les concepts essentiels de {chapter.title.toLowerCase()}. Vous apprendrez à travers
                des exemples pratiques et des démonstrations en direct.
              </p>
            </div>
          </div>
        )

      case "image":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Image : {chapter.title}</p>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>Cette image illustre les concepts abordés dans ce chapitre.</p>
            </div>
          </div>
        )

      case "link":
        return (
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium mb-2">Ressource externe</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Consultez cette ressource pour approfondir vos connaissances.
              </p>
              <Button variant="outline" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Ouvrir la ressource
                </a>
              </Button>
            </div>
          </div>
        )

      default:
        return <p>Type de contenu non supporté</p>
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}

      {!isCompleted && (
        <div className="flex justify-end pt-6 border-t border-border">
          <Button onClick={handleMarkComplete}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marquer comme terminé
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center justify-center py-4 text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Chapitre terminé !</span>
        </div>
      )}
    </div>
  )
}
