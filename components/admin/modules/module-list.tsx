"use client"

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { ModuleCard } from "./module-card"
import type { ModuleWithChapters } from "@/types/module"

interface ModuleListProps {
  modules: ModuleWithChapters[]
  onReorder: (modules: ModuleWithChapters[]) => void
  onEdit: (module: ModuleWithChapters) => void
  onDelete: (moduleId: number) => void
  onManageChapters: (moduleId: number) => void
}

export function ModuleList({
  modules,
  onReorder,
  onEdit,
  onDelete,
  onManageChapters,
}: ModuleListProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    
    const oldIndex = modules.findIndex(m => m.id === active.id)
    const newIndex = modules.findIndex(m => m.id === over.id)
    
    const reordered = arrayMove(modules, oldIndex, newIndex)
    onReorder(reordered)
  }
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChapter={() => onManageChapters(module.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
