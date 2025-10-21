"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { ContentItemCard } from "./content-item-card"
import type { ContentItem } from "@/types/chapter"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentItemListProps {
  chapterId: number
  contentItems: ContentItem[]
  onReorder: (contentItemIds: number[]) => void
  onEdit: (contentItemId: number) => void
  onDelete: (contentItemId: number) => void
  onAddContent: (chapterId: number) => void
  isReordering?: boolean
}

export function ContentItemList({
  chapterId,
  contentItems,
  onReorder,
  onEdit,
  onDelete,
  onAddContent,
  isReordering = false,
}: ContentItemListProps) {
  const [items, setItems] = useState(contentItems)
  const [isDragging, setIsDragging] = useState(false)

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

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const reorderedItems = arrayMove(items, oldIndex, newIndex)
      setItems(reorderedItems)

      // Optimistic update - call parent with new order
      onReorder(reorderedItems.map((item) => item.id))
    }
  }
  
  const handleDragCancel = () => {
    setIsDragging(false)
  }

  // Sync with parent when contentItems prop changes
  if (contentItems.length !== items.length || 
      contentItems.some((item, idx) => item.id !== items[idx]?.id)) {
    setItems(contentItems)
  }

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-center py-8 px-4 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold mb-1">Aucun contenu pour l'instant</p>
          <p className="text-xs">Ajoutez du contenu à ce chapitre pour commencer</p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="w-full shadow-sm"
          onClick={() => onAddContent(chapterId)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter du contenu
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className={isDragging || isReordering ? "opacity-60 pointer-events-none" : ""}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {items.map((contentItem) => (
                <ContentItemCard
                  key={contentItem.id}
                  contentItem={contentItem}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {isReordering && (
          <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground bg-muted/50 py-2 rounded">
            <span className="animate-pulse font-medium">Mise à jour de l'ordre...</span>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
        onClick={() => onAddContent(chapterId)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter du contenu
      </Button>
    </div>
  )
}
