"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Plus, FileText, Video, ImageIcon, LinkIcon, Edit, Trash2, GripVertical, HelpCircle } from "lucide-react"

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

interface ChapterManagerProps {
  chapters: Chapter[]
  setChapters: (chapters: Chapter[]) => void
}

export function ChapterManager({ chapters, setChapters }: ChapterManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const addChapter = (chapterData: Omit<Chapter, "id" | "orderIndex">) => {
    const newChapter: Chapter = {
      ...chapterData,
      id: Date.now().toString(),
      orderIndex: chapters.length,
    }
    setChapters([...chapters, newChapter])
    setIsCreateDialogOpen(false)
  }

  const updateChapter = (updatedChapter: Chapter) => {
    setChapters(chapters.map((chapter) => (chapter.id === updatedChapter.id ? updatedChapter : chapter)))
    setIsEditDialogOpen(false)
    setEditingChapter(null)
  }

  const deleteChapter = (chapterId: string) => {
    setChapters(chapters.filter((chapter) => chapter.id !== chapterId))
  }

  const moveChapter = (chapterId: string, direction: "up" | "down") => {
    const chapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId)
    if (chapterIndex === -1) return

    const newChapters = [...chapters]
    const targetIndex = direction === "up" ? chapterIndex - 1 : chapterIndex + 1

    if (targetIndex < 0 || targetIndex >= chapters.length) return // Swap chapters
    ;[newChapters[chapterIndex], newChapters[targetIndex]] = [newChapters[targetIndex], newChapters[chapterIndex]]

    // Update order indices
    newChapters.forEach((chapter, index) => {
      chapter.orderIndex = index
    })

    setChapters(newChapters)
  }

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

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case "text":
        return "Texte"
      case "video":
        return "Vidéo"
      case "image":
        return "Image"
      case "link":
        return "Lien"
      default:
        return contentType
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chapitres du Cours</CardTitle>
            <CardDescription>Organisez le contenu de votre cours en chapitres</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un chapitre
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau chapitre</DialogTitle>
                <DialogDescription>Ajoutez du contenu à votre cours</DialogDescription>
              </DialogHeader>
              <ChapterForm onSubmit={addChapter} onCancel={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {chapters.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun chapitre créé</p>
            <p className="text-sm text-muted-foreground">Commencez par ajouter votre premier chapitre</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chapters
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((chapter, index) => (
                <Card key={chapter.id} className="border-border bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveChapter(chapter.id, "up")}
                          disabled={index === 0}
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getContentIcon(chapter.contentType)}
                          <h4 className="font-medium">
                            {index + 1}. {chapter.title}
                          </h4>
                          <Badge variant="outline">{getContentTypeLabel(chapter.contentType)}</Badge>
                          {chapter.hasQuiz && (
                            <Badge className="bg-primary/10 text-primary">
                              <HelpCircle className="h-3 w-3 mr-1" />
                              Quiz
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{chapter.description}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingChapter(chapter)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteChapter(chapter.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </CardContent>

      {/* Edit Chapter Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le chapitre</DialogTitle>
            <DialogDescription>Modifiez le contenu de votre chapitre</DialogDescription>
          </DialogHeader>
          {editingChapter && (
            <ChapterForm
              initialData={editingChapter}
              onSubmit={updateChapter}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingChapter(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

interface ChapterFormProps {
  initialData?: Chapter
  onSubmit: (chapter: Chapter) => void
  onCancel: () => void
}

function ChapterForm({ initialData, onSubmit, onCancel }: ChapterFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    contentType: initialData?.contentType || ("text" as const),
    contentData: initialData?.contentData || {},
    hasQuiz: initialData?.hasQuiz || false,
    quizData: initialData?.quizData || null,
  })

  const [showQuizBuilder, setShowQuizBuilder] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const chapterData: Chapter = {
      id: initialData?.id || "",
      orderIndex: initialData?.orderIndex || 0,
      ...formData,
    }
    onSubmit(chapterData)
  }

  const handleContentDataChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      contentData: {
        ...formData.contentData,
        [field]: value,
      },
    })
  }

  const renderContentFields = () => {
    switch (formData.contentType) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="content">Contenu texte</Label>
            <Textarea
              id="content"
              value={formData.contentData.content || ""}
              onChange={(e) => handleContentDataChange("content", e.target.value)}
              placeholder="Rédigez le contenu de votre chapitre..."
              rows={6}
            />
          </div>
        )

      case "video":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL de la vidéo</Label>
              <Input
                id="videoUrl"
                value={formData.contentData.videoUrl || ""}
                onChange={(e) => handleContentDataChange("videoUrl", e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.contentData.duration || ""}
                onChange={(e) => handleContentDataChange("duration", Number.parseInt(e.target.value))}
                placeholder="15"
              />
            </div>
          </div>
        )

      case "image":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image</Label>
              <Input
                id="imageUrl"
                value={formData.contentData.imageUrl || ""}
                onChange={(e) => handleContentDataChange("imageUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Légende</Label>
              <Input
                id="caption"
                value={formData.contentData.caption || ""}
                onChange={(e) => handleContentDataChange("caption", e.target.value)}
                placeholder="Description de l'image"
              />
            </div>
          </div>
        )

      case "link":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL du lien</Label>
              <Input
                id="linkUrl"
                value={formData.contentData.linkUrl || ""}
                onChange={(e) => handleContentDataChange("linkUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkTitle">Titre du lien</Label>
              <Input
                id="linkTitle"
                value={formData.contentData.linkTitle || ""}
                onChange={(e) => handleContentDataChange("linkTitle", e.target.value)}
                placeholder="Ressource externe"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre du chapitre</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Introduction aux composants"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentType">Type de contenu</Label>
          <Select
            value={formData.contentType}
            onValueChange={(value: any) => setFormData({ ...formData, contentType: value, contentData: {} })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texte</SelectItem>
              <SelectItem value="video">Vidéo</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="link">Lien externe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Décrivez brièvement ce chapitre..."
          rows={2}
        />
      </div>

      {renderContentFields()}

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="hasQuiz">Ajouter un quiz</Label>
            <p className="text-sm text-muted-foreground">Quiz à la fin de ce chapitre</p>
          </div>
          <Switch
            id="hasQuiz"
            checked={formData.hasQuiz}
            onCheckedChange={(checked) => setFormData({ ...formData, hasQuiz: checked })}
          />
        </div>

        {formData.hasQuiz && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQuizBuilder(!showQuizBuilder)}
              className="w-full"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              {showQuizBuilder ? "Masquer" : "Configurer"} le quiz
            </Button>

            {showQuizBuilder && (
              <div className="p-4 border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">Quiz builder coming soon...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{initialData ? "Modifier" : "Créer"} le chapitre</Button>
      </div>
    </form>
  )
}
