"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ChapterContent } from "./chapter-content"
import { QuizComponent } from "./quiz-component"
import { ArrowLeft, CheckCircle, Lock, FileText, Video, ImageIcon, LinkIcon } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth"

interface CourseViewerProps {
  courseId: number
  user: User
}

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

interface Course {
  id: number
  title: string
  description: string
  domain: string
  teacher: string
  progress: number
  totalChapters: number
  completedChapters: number
}

export function CourseViewer({ courseId, user }: CourseViewerProps) {
  // Mock data - replace with real data from database
  const [course] = useState<Course>({
    id: courseId,
    title: "Introduction à React",
    description: "Apprenez les bases de React et créez vos premières applications",
    domain: "Informatique",
    teacher: "Jean Martin",
    progress: 65,
    totalChapters: 8,
    completedChapters: 5,
  })

  const [chapters] = useState<Chapter[]>([
    {
      id: 1,
      title: "Introduction à React",
      description: "Découvrez React et ses concepts fondamentaux",
      orderIndex: 1,
      contentType: "text",
      contentData: { content: "Contenu du chapitre..." },
      isCompleted: true,
      isLocked: false,
      hasQuiz: true,
    },
    {
      id: 2,
      title: "JSX et Composants",
      description: "Apprenez à créer des composants avec JSX",
      orderIndex: 2,
      contentType: "video",
      contentData: { videoUrl: "https://example.com/video.mp4" },
      isCompleted: true,
      isLocked: false,
      hasQuiz: true,
    },
    {
      id: 3,
      title: "Props et State",
      description: "Gérez les données dans vos composants",
      orderIndex: 3,
      contentType: "text",
      contentData: { content: "Contenu du chapitre..." },
      isCompleted: true,
      isLocked: false,
      hasQuiz: true,
    },
    {
      id: 4,
      title: "Hooks React",
      description: "Utilisez les hooks pour gérer l'état",
      orderIndex: 4,
      contentType: "video",
      contentData: { videoUrl: "https://example.com/video.mp4" },
      isCompleted: false,
      isLocked: false,
      hasQuiz: true,
    },
    {
      id: 5,
      title: "Gestion des événements",
      description: "Réagissez aux interactions utilisateur",
      orderIndex: 5,
      contentType: "text",
      contentData: { content: "Contenu du chapitre..." },
      isCompleted: false,
      isLocked: true,
      hasQuiz: true,
    },
  ])

  const [selectedChapter, setSelectedChapter] = useState<Chapter>(chapters[0])
  const [showQuiz, setShowQuiz] = useState(false)

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "link":
        return <LinkIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleChapterComplete = (chapterId: number) => {
    // Update chapter completion status
    console.log("Chapter completed:", chapterId)
  }

  const handleQuizComplete = (chapterId: number, score: number) => {
    console.log("Quiz completed:", chapterId, score)
    setShowQuiz(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
              <p className="text-sm text-muted-foreground">Par {course.teacher}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{course.domain}</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar - Chapters List */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Chapitres</CardTitle>
                <CardDescription>
                  {course.completedChapters}/{course.totalChapters} complétés
                </CardDescription>
                <Progress value={course.progress} className="mt-2" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => !chapter.isLocked && setSelectedChapter(chapter)}
                      disabled={chapter.isLocked}
                      className={`w-full p-3 text-left hover:bg-accent/50 transition-colors border-l-2 ${
                        selectedChapter.id === chapter.id ? "border-primary bg-accent/30" : "border-transparent"
                      } ${chapter.isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {chapter.isLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : chapter.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {getContentIcon(chapter.contentType)}
                            <span className="text-sm font-medium truncate">
                              {index + 1}. {chapter.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{chapter.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {getContentIcon(selectedChapter.contentType)}
                      <span>{selectedChapter.title}</span>
                      {selectedChapter.isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>{selectedChapter.description}</CardDescription>
                  </div>
                  {selectedChapter.hasQuiz && (
                    <Button
                      variant="outline"
                      onClick={() => setShowQuiz(!showQuiz)}
                      disabled={!selectedChapter.isCompleted}
                    >
                      {showQuiz ? "Voir le contenu" : "Quiz"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-6">
                {showQuiz ? (
                  <QuizComponent chapterId={selectedChapter.id} onComplete={handleQuizComplete} />
                ) : (
                  <ChapterContent chapter={selectedChapter} onComplete={handleChapterComplete} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
