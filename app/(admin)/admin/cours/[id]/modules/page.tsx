"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModuleForm } from "@/components/admin/modules/module-form"
import { ModuleList } from "@/components/admin/modules/module-list"
import type { ModuleWithChapters } from "@/types/module"
import { toast } from "sonner"
import { ArrowLeft, Plus, FolderOpen } from "lucide-react"
import Link from "next/link"

export default function ModuleManagementPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const courseId = parseInt(params.id)

  const [modules, setModules] = useState<ModuleWithChapters[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleWithChapters | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/courses/${courseId}/modules?includeChapters=true`)
      const data = await response.json()

      if (data.success) {
        setModules(data.data)
      } else {
        toast.error("Erreur lors du chargement des modules")
      }
    } catch {
      toast.error("Erreur lors du chargement des modules")
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  // Fetch modules
  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const handleCreateModule = async (data: { title: string; description?: string | null }) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Module créé avec succès")
        setIsCreating(false)
        fetchModules()
      } else {
        toast.error(result.error || "Erreur lors de la création du module")
      }
    } catch {
      toast.error("Erreur lors de la création du module")
    }
  }

  const handleUpdateModule = async (data: { title: string; description?: string | null }) => {
    if (!editingModule) return

    try {
      const response = await fetch(`/api/modules/${editingModule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Module mis à jour avec succès")
        setEditingModule(null)
        fetchModules()
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour du module")
      }
    } catch {
      toast.error("Erreur lors de la mise à jour du module")
    }
  }

  const handleDeleteModule = async (moduleId: number) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Module supprimé avec succès")
        fetchModules()
      } else {
        toast.error(result.error || "Erreur lors de la suppression du module")
      }
    } catch {
      toast.error("Erreur lors de la suppression du module")
    }
  }

  const handleReorderModules = async (moduleIds: number[]) => {
    try {
      setIsReordering(true)
      const response = await fetch("/api/modules/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, moduleIds }),
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.error || "Erreur lors de la réorganisation")
        fetchModules() // Reset to server state
      }
    } catch {
      toast.error("Erreur lors de la réorganisation")
      fetchModules()
    } finally {
      setIsReordering(false)
    }
  }

  const handleAddChapter = (moduleId: number) => {
    router.push(`/admin/cours/${courseId}/chapters?moduleId=${moduleId}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Chargement des modules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href={`/admin/cours/${courseId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FolderOpen className="h-7 w-7 text-blue-600" />
                Gestion des modules
              </h1>
              <p className="text-muted-foreground mt-1">
                Organisez votre cours en modules thématiques
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nouveau module
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">À propos des modules</CardTitle>
          <CardDescription>
            Les modules vous permettent de structurer votre cours en sections thématiques.
            Chaque module peut contenir plusieurs chapitres.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ Organisez votre contenu de manière logique</p>
          <p>✓ Les étudiants naviguent par modules</p>
          <p>✓ Suivez la progression par module</p>
        </CardContent>
      </Card>

      {/* Module List */}
      <Card>
        <CardHeader>
          <CardTitle>Modules du cours ({modules.length})</CardTitle>
          <CardDescription>
            {modules.length === 0
              ? "Créez votre premier module pour commencer"
              : "Gérez l'ordre et le contenu de vos modules"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModuleList
            modules={modules}
            onEdit={setEditingModule}
            onDelete={handleDeleteModule}
            onReorder={handleReorderModules}
            onAddChapter={handleAddChapter}
            isReordering={isReordering}
          />
        </CardContent>
      </Card>

      {/* Create Module Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau module</DialogTitle>
            <DialogDescription>
              Ajoutez un module pour organiser vos chapitres
            </DialogDescription>
          </DialogHeader>
          <ModuleForm
            onSubmit={handleCreateModule}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le module</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du module
            </DialogDescription>
          </DialogHeader>
          {editingModule && (
            <ModuleForm
              initialData={editingModule}
              onSubmit={handleUpdateModule}
              onCancel={() => setEditingModule(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
