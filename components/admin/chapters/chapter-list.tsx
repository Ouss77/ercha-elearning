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
import { ChapterCard } from "./chapter-card"
import type { ChapterWithContent } from "@/types/chapter"
import { BookOpen } from "lucide-react"

interface ChapterListProps {
  chapters: ChapterWithContent[]
  onReorder: (chapterIds: number[]) => void
  onChapterEdit: (chapter: ChapterWithContent) => void
  onChapterDelete: (chapterId: number) => void
  onChapterPreview: (chapter: ChapterWithContent) => void
  onContentReorder: (chapterId: number, contentItemIds: number[]) => void
  onContentEdit: (contentItemId: number) => void
  onContentDelete: (contentItemId: number) => void
  onContentAdd: (chapterId: number) => void
  isReordering?: boolean
  reorderingContentChapterId?: number | null
}

export function ChapterList({
  chapters,
  onReorder,
  onChapterEdit,
  onChapterDelete,
  onChapterPreview,
  onContentReorder,
  onContentEdit,
  onContentDelete,
  onContentAdd,
  isReordering = false,
  reorderingContentChapterId = null,
}: ChapterListProps) {
  const [items, setItems] = useState(chapters)
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

  // Sync with parent when chapters prop changes
  if (chapters.length !== items.length || 
      chapters.some((chapter, idx) => chapter.id !== items[idx]?.id)) {
    setItems(chapters)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <p className="text-xl font-semibold mb-2">Aucun chapitre pour l'instant</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Créez votre premier chapitre pour commencer à structurer votre cours
        </p>
      </div>
    )
  }

  return (
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
          <div className="space-y-4">
            {items.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                onEdit={onChapterEdit}
                onDelete={onChapterDelete}
                onPreview={onChapterPreview}
                onContentReorder={onContentReorder}
                onContentEdit={onContentEdit}
                onContentDelete={onContentDelete}
                onContentAdd={onContentAdd}
                isReorderingContent={reorderingContentChapterId === chapter.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {isReordering && (
        <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground bg-muted/50 py-3 rounded-lg">
          <span className="animate-pulse font-medium">Mise à jour de l'ordre des chapitres...</span>
        </div>
      )}
    </div>
  )
}
