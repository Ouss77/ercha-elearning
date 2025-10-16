"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth/auth"

interface CourseEditorProps {
  courseId: number
  user: User
}

interface CourseData {
  id: number
  title: string
  description: string
  domainId: string
  teacherId: string
  thumbnailUrl: string
  isActive: boolean
}

interface Chapter {
  id: string
  title: string
  description: string
  orderIndex: number
  contentType: "text" | "video" | "image" | "link"
  contentData: any
  hasQuiz: boolean
  quizData?: any
}

export function CourseEditor({ courseId, user }: CourseEditorProps) {
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Mock data - replace with real data from database
  const domains = [
    { id: "1", name: "Informatique", color: "#3b82f6" },
    { id: "2", name: "Marketing", color: "#10b981" },
    { id: "3", name: "Design", color: "#8b5cf6" },
    { id: "4", name: "Gestion", color: "#f59e0b" },
  ]

  const teachers = [
    { id: "1", name: "Jean Martin" },
    { id: "2", name: "Sophie Dubois" },
    { id: "3", name: "Pierre Leroy" },
  ]

  useEffect(() => {
    // Load course data
    const loadCourse = async () => {
      try {
        // Mock API call - replace with real API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockCourse: CourseData = {
          id: courseId,
          title: "Introduction à React",
          description: "Apprenez les bases de React et créez vos premières applications",
          domainId: "1",
          teacherId: "1",
          thumbnailUrl: "/react-course.png",
          isActive: true,
        }

        const mockChapters: Chapter[] = [
          {
            id: "1",
            title: "Introduction à React",
            description: "Découvrez React et ses concepts fondamentaux",
            orderIndex: 0,
            contentType: "text",
            contentData: { content: "Contenu du chapitre..." },
            hasQuiz: true,
            quizData: {
              title: "Quiz - Introduction",
              passingScore: 70,
              questions: [],
            },
          },
          {
            id: "2",
            title: "JSX et Composants",
            description: "Apprenez à créer des composants avec JSX",
            orderIndex: 1,
            contentType: "video",
            contentData: { videoUrl: "https://example.com/video.mp4", duration: 15 },
            hasQuiz: true,
            quizData: {
              title: "Quiz - JSX",
              passingScore: 70,
              questions: [],
            },
          },
        ]

        setCourseData(mockCourse)
        setChapters(mockChapters)
      } catch (error) {
        console.error("Error loading course:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourse()
  }, [courseId])

  const handleSaveCourse = async () => {
    if (!courseData) return

    setIsSaving(true)
    try {
      // Here you would save the course to the database
      console.log("Saving course:", { courseData, chapters })
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Cours mis à jour avec succès !")
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Erreur lors de la mise à jour du cours")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseData) return

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.")) {
      return
    }

    try {
      // Here you would delete the course from the database
      console.log("Deleting course:", courseId)
      alert("Cours supprimé avec succès !")
      // Redirect to admin dashboard
      window.location.href = "/admin"
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Erreur lors de la suppression du cours")
    }
  }

  const handlePreview = () => {
    // Open preview in new tab
    console.log("Preview course:", { courseData, chapters })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du cours...</p>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cours non trouvé</p>
          <Button asChild className="mt-4">
            <Link href="/admin">Retour</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Modifier le Cours</h1>
                <p className="text-sm text-muted-foreground">{courseData.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>
              <Button variant="destructive" onClick={handleDeleteCourse}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              <Button onClick={handleSaveCourse} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Course Settings */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card sticky top-6">
              <CardHeader>
                <CardTitle>Configuration du Cours</CardTitle>
                <CardDescription>Informations générales et paramètres</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Titre du cours</label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Domaine</label>
                  <select
                    value={courseData.domainId}
                    onChange={(e) => setCourseData({ ...courseData, domainId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Professeur assigné</label>
                  <select
                    value={courseData.teacherId}
                    onChange={(e) => setCourseData({ ...courseData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Image de couverture</label>
                  <input
                    type="url"
                    value={courseData.thumbnailUrl}
                    onChange={(e) => setCourseData({ ...courseData, thumbnailUrl: e.target.value })}
                    placeholder="URL de l'image"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {courseData.thumbnailUrl && (
                    <div className="mt-2">
                      <img
                        src={courseData.thumbnailUrl || "/placeholder.svg"}
                        alt="Aperçu"
                        className="w-full h-32 object-cover rounded-md border border-border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={courseData.isActive}
                    onChange={(e) => setCourseData({ ...courseData, isActive: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                    Cours actif
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapters Management */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Gestion des Chapitres</CardTitle>
                <CardDescription>Organisez le contenu de votre cours en chapitres</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chapters.map((chapter, index) => (
                    <div key={chapter.id} className="p-4 border border-border rounded-lg bg-background">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-foreground">{chapter.title}</h4>
                            <p className="text-sm text-muted-foreground">{chapter.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                            {chapter.contentType}
                          </span>
                          {chapter.hasQuiz && (
                            <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">Quiz</span>
                          )}
                          <Button variant="ghost" size="sm">
                            Modifier
                          </Button>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {chapter.contentType === "text" && "Contenu textuel"}
                        {chapter.contentType === "video" && `Vidéo - ${chapter.contentData?.duration || 0} min`}
                        {chapter.contentType === "image" && "Contenu image"}
                        {chapter.contentType === "link" && "Lien externe"}
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full bg-transparent">
                    + Ajouter un chapitre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
