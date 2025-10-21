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
import { FileText } from "lucide-react"

interface ContentItemListProps {
  chapterId: number
  contentItems: ContentItem[]
  onReorder: (contentItemIds: number[]) => void
  onEdit: (contentItemId: number) => void
  onDelete: (contentItemId: number) => void
  isReordering?: boolean
}

export function ContentItemList({
  chapterId,
  contentItems,
  onReorder,
  onEdit,
  onDelete,
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
      <div className="text-center py-6 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No content items yet</p>
        <p className="text-xs">Add content to this chapter</p>
      </div>
    )
  }

  return (
    <div className={isDragging || isReordering ? "opacity-70 pointer-events-none" : ""}>
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
          <div className="space-y-2">
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
        <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
          <span className="animate-pulse">Mise à jour de l'ordre...</span>
        </div>
      )}
    </div>
  )
}
