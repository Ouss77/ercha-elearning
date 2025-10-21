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
  onContentAdd: (chapterId: number) => void
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
  onContentAdd,
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
          ${isDragging ? "shadow-xl ring-2 ring-primary scale-[1.02]" : "hover:shadow-md"}
          transition-all duration-200 border-l-4 ${
            isExpanded ? "border-l-primary" : "border-l-transparent"
          }
        `}
      >
        <CardHeader className="pb-3 bg-gradient-to-r from-muted/30 to-transparent">
          <div className="flex items-start gap-3 w-full">
            {/* Drag Handle */}
            <button
              className="mt-1 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 hover:bg-muted/50 rounded p-1 -m-1 transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>

            {/* Chapter Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <CardTitle className="text-lg font-semibold truncate">
                  {chapter.title}
                </CardTitle>
                <Badge 
                  variant={chapter.contentItems.length > 0 ? "default" : "secondary"} 
                  className="shrink-0 text-xs"
                >
                  {chapter.contentItems.length} contenu{chapter.contentItems.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              {chapter.description && (
                <CardDescription className="line-clamp-2 text-sm">
                  {chapter.description}
                </CardDescription>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-primary/10"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Masquer le contenu" : "Afficher le contenu"}
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
                className="h-9 w-9 hover:bg-blue-500/10 hover:text-blue-600"
                onClick={() => onPreview(chapter)}
                title="Aperçu"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-green-500/10 hover:text-green-600"
                onClick={() => onEdit(chapter)}
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(chapter.id)}
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Expanded Content Items */}
        {isExpanded && (
          <CardContent className="pt-0 pb-4">
            <div className="border-t pt-4 bg-muted/20 -mx-6 px-6 pb-2">
              <ContentItemList
                chapterId={chapter.id}
                contentItems={chapter.contentItems}
                onReorder={(contentItemIds) => onContentReorder(chapter.id, contentItemIds)}
                onEdit={onContentEdit}
                onDelete={onContentDelete}
                onAddContent={onContentAdd}
                isReordering={isReorderingContent}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
