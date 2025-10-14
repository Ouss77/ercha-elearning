"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ChapterManager } from "./chapter-manager"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/auth"

interface CourseCreatorProps {
  user: User
}

interface CourseData {
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

export function CourseCreator({ user }: CourseCreatorProps) {
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    domainId: "",
    teacherId: "",
    thumbnailUrl: "",
    isActive: true,
  })

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSaveCourse = async () => {
    setIsLoading(true)
    try {
      // Here you would save the course to the database
      console.log("Saving course:", { courseData, chapters })
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Cours créé avec succès !")
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Erreur lors de la création du cours")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    // Open preview in new tab
    console.log("Preview course:", { courseData, chapters })
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
                <h1 className="text-2xl font-bold text-foreground">Créer un Nouveau Cours</h1>
                <p className="text-sm text-muted-foreground">Configurez votre cours et ajoutez du contenu</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>
              <Button onClick={handleSaveCourse} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Enregistrement..." : "Enregistrer"}
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
                  <Label htmlFor="title">Titre du cours</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    placeholder="Ex: Introduction à React"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    placeholder="Décrivez le contenu et les objectifs du cours..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine</Label>
                  <Select
                    value={courseData.domainId}
                    onValueChange={(value) => setCourseData({ ...courseData, domainId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.color }} />
                            <span>{domain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">Professeur assigné</Label>
                  <Select
                    value={courseData.teacherId}
                    onValueChange={(value) => setCourseData({ ...courseData, teacherId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un professeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">URL de l'image de couverture</Label>
                  <Input
                    id="thumbnail"
                    value={courseData.thumbnailUrl}
                    onChange={(e) => setCourseData({ ...courseData, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Cours actif</Label>
                    <p className="text-sm text-muted-foreground">Le cours sera visible par les étudiants</p>
                  </div>
                  <Switch
                    id="active"
                    checked={courseData.isActive}
                    onCheckedChange={(checked) => setCourseData({ ...courseData, isActive: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapter Management */}
          <div className="lg:col-span-2">
            <ChapterManager chapters={chapters} setChapters={setChapters} />
          </div>
        </div>
      </div>
    </div>
  )
}
