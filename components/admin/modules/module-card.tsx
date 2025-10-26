"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronDown, Edit, Trash2, GripVertical, FolderOpen } from "lucide-react"
import type { ModuleWithChapters } from "@/types/module"

interface ModuleCardProps {
  module: ModuleWithChapters
  onEdit: (module: ModuleWithChapters) => void
  onDelete: (moduleId: number) => void
  onAddChapter?: (moduleId: number) => void
  isExpanded?: boolean
}

export function ModuleCard({
  module,
  onEdit,
  onDelete,
  onAddChapter,
  isExpanded = false,
}: ModuleCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const chapterCount = module.chapters?.length || 0

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDeleteClick = () => {
    if (chapterCount > 0) {
      setShowDeleteDialog(true)
    } else {
      onDelete(module.id)
    }
  }

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false)
    onDelete(module.id)
  }

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card
          className={`
            ${isDragging ? "shadow-xl ring-2 ring-primary scale-[1.02]" : "hover:shadow-md"}
            transition-all duration-200 border-l-4 border-l-blue-500
          `}
        >
          <Accordion type="single" collapsible defaultValue={isExpanded ? module.id.toString() : undefined}>
            <AccordionItem value={module.id.toString()} className="border-none">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                <div className="flex items-start gap-3 w-full">
                  {/* Drag Handle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="mt-1 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 hover:bg-muted/50 rounded p-1 -m-1 transition-colors"
                        {...attributes}
                        {...listeners}
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Glisser-déposer pour réorganiser les modules</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Module Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <CardTitle className="text-lg font-semibold truncate">
                        {module.title}
                      </CardTitle>
                      <Badge 
                        variant={chapterCount > 0 ? "default" : "secondary"} 
                        className="shrink-0 text-xs"
                      >
                        {chapterCount} chapitre{chapterCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {module.description && (
                      <CardDescription className="line-clamp-2 text-sm">
                        {module.description}
                      </CardDescription>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <AccordionTrigger className="hover:no-underline [&[data-state=open]>svg]:rotate-180">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-primary/10"
                      >
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      </Button>
                    </AccordionTrigger>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                          onClick={() => onEdit(module)}
                        >
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Modifier le titre et la description du module</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-destructive/10"
                          onClick={handleDeleteClick}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-destructive text-destructive-foreground">
                        <p>Supprimer le module et tous ses chapitres</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>

              <AccordionContent>
                <CardContent className="pt-4">
                  {chapterCount > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Chapitres dans ce module:
                      </h4>
                      <ul className="space-y-1.5">
                        {module.chapters.map((chapter, index) => (
                          <li
                            key={chapter.id}
                            className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-xs text-muted-foreground font-medium min-w-[2rem]">
                              {index + 1}.
                            </span>
                            <span className="flex-1">{chapter.title}</span>
                          </li>
                        ))}
                      </ul>
                      {onAddChapter && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4"
                          onClick={() => onAddChapter(module.id)}
                        >
                          Ajouter un chapitre à ce module
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">
                        Ce module ne contient pas encore de chapitres
                      </p>
                      {onAddChapter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddChapter(module.id)}
                        >
                          Ajouter le premier chapitre
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le module ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce module contient <strong>{chapterCount} chapitre{chapterCount !== 1 ? "s" : ""}</strong>.
              En supprimant ce module, tous les chapitres et leur contenu seront également supprimés.
              <br /><br />
              <span className="text-destructive font-medium">
                Cette action est irréversible.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer le module et ses chapitres
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
