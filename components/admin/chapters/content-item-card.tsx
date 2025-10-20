"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GripVertical,
  Edit,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  FileCheck,
} from "lucide-react"
import type { ContentItem, ContentType } from "@/types/chapter"

interface ContentItemCardProps {
  contentItem: ContentItem
  onEdit: (contentItemId: number) => void
  onDelete: (contentItemId: number) => void
}

const contentTypeConfig: Record<
  ContentType,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  video: { icon: Video, label: "Video", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  text: { icon: FileText, label: "Text", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  quiz: { icon: HelpCircle, label: "Quiz", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  test: { icon: ClipboardList, label: "Test", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  exam: { icon: FileCheck, label: "Exam", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
}

export function ContentItemCard({ contentItem, onEdit, onDelete }: ContentItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contentItem.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const config = contentTypeConfig[contentItem.contentType]
  const Icon = config.icon

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`
          ${isDragging ? "shadow-lg ring-2 ring-primary scale-[1.01]" : "hover:shadow-sm hover:border-primary/30"}
          transition-all duration-200 bg-card/50 backdrop-blur-sm
        `}
      >
        <CardContent className="p-3.5">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <button
              className="cursor-grab active:cursor-grabbing touch-none hover:bg-muted/50 rounded p-1 -m-1 transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>

            {/* Content Type Icon */}
            <div className={`p-2.5 rounded-lg ${config.color} shadow-sm`}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Content Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs shrink-0 font-semibold">
                  {config.label}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  #{contentItem.orderIndex + 1}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 hover:bg-green-500/10 hover:text-green-600"
                onClick={() => onEdit(contentItem.id)}
                title="Modifier"
              >
                <Edit className="h-3.5 w-3.5" />
                <span className="ml-1.5 text-xs font-medium">Modifier</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(contentItem.id)}
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
