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
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No chapters yet</p>
        <p className="text-sm">Create your first chapter to get started</p>
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
                isReorderingContent={reorderingContentChapterId === chapter.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {isReordering && (
        <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
          <span className="animate-pulse">Mise à jour de l'ordre...</span>
        </div>
      )}
    </div>
  )
}
