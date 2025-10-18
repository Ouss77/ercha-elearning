"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Edit, Trash2, Eye, GripVertical } from "lucide-react"
import type { ChapterWithContent } from "@/types/chapter"
import { ContentItemList } from "./content-item-list"

interface ChapterCardProps {
  chapter: ChapterWithContent
  onEdit: (chapter: ChapterWithContent) => void
  onDelete: (chapterId: number) => void
  onPreview: (chapter: ChapterWithContent) => void
  onContentReorder: (chapterId: number, contentItemIds: number[]) => void
  onContentEdit: (contentItemId: number) => void
  onContentDelete: (contentItemId: number) => void
  isReorderingContent?: boolean
}

export function ChapterCard({
  chapter,
  onEdit,
  onDelete,
  onPreview,
  onContentReorder,
  onContentEdit,
  onContentDelete,
  isReorderingContent = false,
}: ChapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`
          ${isDragging ? "shadow-lg ring-2 ring-primary" : ""}
          transition-all duration-200
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <button
              className="mt-1 cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>

            {/* Chapter Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg truncate">{chapter.title}</CardTitle>
                <Badge variant="outline" className="shrink-0">
                  {chapter.contentItems.length} item{chapter.contentItems.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              {chapter.description && (
                <CardDescription className="line-clamp-2">
                  {chapter.description}
                </CardDescription>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPreview(chapter)}
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(chapter)}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(chapter.id)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Expanded Content Items */}
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="border-t pt-4">
              <ContentItemList
                chapterId={chapter.id}
                contentItems={chapter.contentItems}
                onReorder={(contentItemIds) => onContentReorder(chapter.id, contentItemIds)}
                onEdit={onContentEdit}
                onDelete={onContentDelete}
                isReordering={isReorderingContent}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
