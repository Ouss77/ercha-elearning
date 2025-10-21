"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileText, Video as VideoIcon, AlertCircle } from "lucide-react"
import DOMPurify from "isomorphic-dompurify"
import type {
  VideoContent,
  TextContent,
  QuizContent,
  TestContent,
  ExamContent,
} from "@/types/chapter"

// ============================================================================
// Text Content Renderer
// ============================================================================

interface TextContentRendererProps {
  content: TextContent
}

export function TextContentRenderer({ content }: TextContentRendererProps) {
  return (
    <div className="space-y-4">
      <div
        className="prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content.content),
        }}
      />

      {content.attachments && content.attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pièces jointes
          </h4>
          <div className="space-y-2">
            {content.attachments.map((attachment, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.type} • {(attachment.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Télécharger
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Video Content Renderer
// ============================================================================

interface VideoContentRendererProps {
  content: VideoContent
}

export function VideoContentRenderer({ content }: VideoContentRendererProps) {
  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()

      // YouTube
      if (hostname.includes("youtube.com")) {
        const videoId = urlObj.searchParams.get("v")
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }

      // YouTube short URL
      if (hostname.includes("youtu.be")) {
        const videoId = urlObj.pathname.slice(1)
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }

      // Vimeo
      if (hostname.includes("vimeo.com")) {
        const videoId = urlObj.pathname.split("/").pop()
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null
      }

      // Direct video URL
      if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return url
      }

      return null
    } catch {
      return null
    }
  }

  const embedUrl = getEmbedUrl(content.url)
  const isDirectVideo = content.url.match(/\.(mp4|webm|ogg)$/i)

  return (
    <div className="space-y-4">
      {embedUrl ? (
        <div className="space-y-2">
          {isDirectVideo ? (
            <video
              src={embedUrl}
              controls
              className="w-full aspect-video rounded-lg"
              poster={content.thumbnail}
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          ) : (
            <iframe
              src={embedUrl}
              className="w-full aspect-video rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Vidéo du cours"
            />
          )}

          {content.duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Durée: {content.duration} minutes</span>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <VideoIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Vidéo non disponible
          </p>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// Quiz Content Renderer
// ============================================================================

interface QuizContentRendererProps {
  content: QuizContent
}

export function QuizContentRenderer({ content }: QuizContentRendererProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quiz</h3>
          <p className="text-sm text-muted-foreground">
            {content.questions.length} question{content.questions.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {content.passingScore && (
            <Badge variant="secondary">
              Score requis: {content.passingScore}%
            </Badge>
          )}
          {content.timeLimit && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {content.timeLimit} min
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {content.questions.map((question, qIndex) => (
          <Card key={question.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="font-medium text-sm">Q{qIndex + 1}.</span>
                <p className="flex-1">{question.question}</p>
              </div>

              <div className="space-y-2 pl-6">
                {question.options.map((option, oIndex) => (
                  <div
                    key={oIndex}
                    className={`p-2 rounded border ${
                      oIndex === question.correctAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + oIndex)}.
                      </span>
                      <span className="flex-1">{option}</span>
                      {oIndex === question.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="pl-6 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Explication:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Test Content Renderer
// ============================================================================

interface TestContentRendererProps {
  content: TestContent
}

export function TestContentRenderer({ content }: TestContentRendererProps) {
  const totalPoints = content.questions.reduce((sum, q) => sum + q.points, 0)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Facile"
      case "medium":
        return "Moyen"
      case "hard":
        return "Difficile"
      default:
        return difficulty
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Test</h3>
            <p className="text-sm text-muted-foreground">
              {content.questions.length} question{content.questions.length > 1 ? "s" : ""} • {totalPoints} points au total
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            Score requis: {content.passingScore}%
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {content.timeLimit} min
          </Badge>
          <Badge variant="secondary">
            {content.attemptsAllowed} tentative{content.attemptsAllowed > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {content.questions.map((question, qIndex) => (
          <Card key={question.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="font-medium text-sm">Q{qIndex + 1}.</span>
                  <p className="flex-1">{question.question}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {getDifficultyLabel(question.difficulty)}
                  </Badge>
                  <Badge variant="outline">{question.points} pts</Badge>
                </div>
              </div>

              <div className="space-y-2 pl-6">
                {question.options.map((option, oIndex) => (
                  <div
                    key={oIndex}
                    className={`p-2 rounded border ${
                      oIndex === question.correctAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + oIndex)}.
                      </span>
                      <span className="flex-1">{option}</span>
                      {oIndex === question.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="pl-6 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Explication:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Exam Content Renderer
// ============================================================================

interface ExamContentRendererProps {
  content: ExamContent
}

export function ExamContentRenderer({ content }: ExamContentRendererProps) {
  const totalPoints = content.questions.reduce((sum, q) => sum + q.points, 0)
  const categories = Array.from(new Set(content.questions.map((q) => q.category)))

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Facile"
      case "medium":
        return "Moyen"
      case "hard":
        return "Difficile"
      default:
        return difficulty
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Examen</h3>
            <p className="text-sm text-muted-foreground">
              {content.questions.length} question{content.questions.length > 1 ? "s" : ""} • {totalPoints} points au total
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            Score requis: {content.passingScore}%
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {content.timeLimit} min
          </Badge>
          <Badge variant="secondary">
            {content.attemptsAllowed} tentative{content.attemptsAllowed > 1 ? "s" : ""}
          </Badge>
          {content.proctored && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Surveillé
            </Badge>
          )}
        </div>

        {categories.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Catégories:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {content.questions.map((question, qIndex) => (
          <Card key={question.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="font-medium text-sm">Q{qIndex + 1}.</span>
                  <div className="flex-1">
                    <p>{question.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Catégorie: {question.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {getDifficultyLabel(question.difficulty)}
                  </Badge>
                  <Badge variant="outline">{question.points} pts</Badge>
                </div>
              </div>

              <div className="space-y-2 pl-6">
                {question.options.map((option, oIndex) => (
                  <div
                    key={oIndex}
                    className={`p-2 rounded border ${
                      oIndex === question.correctAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + oIndex)}.
                      </span>
                      <span className="flex-1">{option}</span>
                      {oIndex === question.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="pl-6 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Explication:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
