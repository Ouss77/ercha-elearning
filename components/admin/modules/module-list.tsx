"use client"

import { useState, useEffect, useRef } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { ModuleCard } from "./module-card"
import type { ModuleWithChapters } from "@/types/module"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ModuleListProps {
  modules: ModuleWithChapters[]
  onEdit: (module: ModuleWithChapters) => void
  onDelete: (moduleId: number) => void
  onReorder: (moduleIds: number[]) => Promise<void>
  onAddChapter?: (moduleId: number) => void
  isReordering?: boolean
}

type ReorderStatus = "idle" | "pending" | "success" | "error"

export function ModuleList({
  modules,
  onEdit,
  onDelete,
  onReorder,
  onAddChapter,
  isReordering = false,
}: ModuleListProps) {
  const [localModules, setLocalModules] = useState(modules)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [reorderStatus, setReorderStatus] = useState<ReorderStatus>("idle")
  const [activeId, setActiveId] = useState<string | number | null>(null)
  const [pendingChanges, setPendingChanges] = useState(false)
  const originalOrderRef = useRef<ModuleWithChapters[]>(modules)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update local state when props change
  useEffect(() => {
    setLocalModules(modules)
    originalOrderRef.current = modules
  }, [modules])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = localModules.findIndex((item) => item.id === active.id)
      const newIndex = localModules.findIndex((item) => item.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Optimistically update the UI immediately
        const newOrder = arrayMove(localModules, oldIndex, newIndex)
        setLocalModules(newOrder)
        setPendingChanges(true)

        // Auto-save after a short delay (debounced)
        if (!isReorderMode) {
          setTimeout(() => {
            handleOptimisticSave(newOrder)
          }, 500)
        }
      }
    }
  }

  const handleOptimisticSave = async (newOrder: ModuleWithChapters[]) => {
    try {
      setReorderStatus("pending")
      const moduleIds = newOrder.map((m) => m.id)
      await onReorder(moduleIds)
      setReorderStatus("success")
      setPendingChanges(false)
      
      // Show success indicator briefly
      setTimeout(() => {
        setReorderStatus("idle")
      }, 2000)
    } catch {
      setReorderStatus("error")
      toast.error("Erreur lors de la mise à jour de l'ordre")
      
      // Revert to original order on error
      setLocalModules(originalOrderRef.current)
      setPendingChanges(false)
      
      // Reset error state after delay
      setTimeout(() => {
        setReorderStatus("idle")
      }, 3000)
    }
  }

  const handleSaveOrder = async () => {
    if (!pendingChanges) {
      setIsReorderMode(false)
      return
    }

    try {
      setReorderStatus("pending")
      const moduleIds = localModules.map((m) => m.id)
      await onReorder(moduleIds)
      setReorderStatus("success")
      setPendingChanges(false)
      setIsReorderMode(false)
      toast.success("Ordre des modules mis à jour")
      
      setTimeout(() => {
        setReorderStatus("idle")
      }, 1000)
    } catch {
      setReorderStatus("error")
      toast.error("Erreur lors de la mise à jour de l'ordre")
      setLocalModules(originalOrderRef.current) // Reset to original order
      setPendingChanges(false)
      
      setTimeout(() => {
        setReorderStatus("idle")
      }, 3000)
    }
  }

  const handleCancelReorder = () => {
    setLocalModules(originalOrderRef.current)
    setPendingChanges(false)
    setReorderStatus("idle")
    setIsReorderMode(false)
  }

  const getReorderButtonText = () => {
    switch (reorderStatus) {
      case "pending":
        return "Enregistrement..."
      case "success":
        return "Enregistré !"
      case "error":
        return "Erreur - Réessayer"
      default:
        return pendingChanges ? "Enregistrer les modifications" : "Aucun changement"
    }
  }

  const getReorderButtonIcon = () => {
    switch (reorderStatus) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <Check className="h-4 w-4" />
      case "error":
        return <X className="h-4 w-4" />
      default:
        return null
    }
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">
          Aucun module dans ce cours pour le moment
        </p>
        <p className="text-sm text-muted-foreground">
          Créez votre premier module pour organiser votre contenu
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {modules.length > 1 && (
        <div className="flex justify-end gap-2">
          {!isReorderMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReorderMode(true)}
              disabled={isReordering}
            >
              <GripVertical className="h-4 w-4 mr-2" />
              Réorganiser les modules
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelReorder}
                disabled={reorderStatus === "pending"}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSaveOrder}
                disabled={reorderStatus === "pending" || !pendingChanges}
                className={reorderStatus === "success" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {getReorderButtonIcon()}
                <span className="ml-2">{getReorderButtonText()}</span>
              </Button>
            </>
          )}
          
          {/* Status indicators for non-manual reorder mode */}
          {!isReorderMode && reorderStatus !== "idle" && (
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  reorderStatus === "success" ? "default" :
                  reorderStatus === "error" ? "destructive" : "secondary"
                }
                className="animate-in fade-in-50 duration-200"
              >
                {getReorderButtonIcon()}
                <span className="ml-1">
                  {reorderStatus === "success" && "Ordre sauvegardé"}
                  {reorderStatus === "pending" && "Sauvegarde..."}
                  {reorderStatus === "error" && "Erreur de sauvegarde"}
                </span>
              </Badge>
            </div>
          )}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localModules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
          disabled={!isReorderMode && reorderStatus === "pending"}
        >
          <div className="space-y-3">
            {localModules.map((module, index) => (
              <div key={module.id} className="relative">
                {isReorderMode && (
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                )}
                <div className={`transition-opacity duration-200 ${
                  reorderStatus === "pending" ? "opacity-70" : "opacity-100"
                }`}>
                  <ModuleCard
                    module={module}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddChapter={onAddChapter}
                  />
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeId ? (
            <div className="transform rotate-3 shadow-lg">
              <ModuleCard
                module={localModules.find(m => m.id === activeId)!}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChapter={onAddChapter}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isReorderMode && (
        <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            <GripVertical className="h-4 w-4 inline mr-2" />
            Glissez-déposez les modules pour changer leur ordre
            {pendingChanges && (
              <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Modifications non sauvegardées
              </span>
            )}
          </p>
        </div>
      )}
      
      {/* Auto-save indicator for non-manual mode */}
      {!isReorderMode && pendingChanges && reorderStatus === "idle" && (
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            💡 Conseil: Les modifications sont sauvegardées automatiquement
          </p>
        </div>
      )}
    </div>
  )
}
