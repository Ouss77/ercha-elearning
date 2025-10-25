"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Trophy, Star, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/utils"

interface ModuleCompletionData {
  moduleId: number
  moduleTitle: string
  totalChapters: number
  completedChapters: number
  completionPercentage: number
  isCompleted: boolean
  completedAt?: string
  nextModuleId?: number
  nextModuleTitle?: string
}

interface ModuleCompletionTrackerProps {
  courseId: number
  studentId: number
  onModuleComplete?: (moduleId: number, moduleTitle: string) => void
  onNavigateToNext?: (moduleId: number) => void
}

export function ModuleCompletionTracker({
  courseId,
  studentId,
  onModuleComplete,
  onNavigateToNext,
}: ModuleCompletionTrackerProps) {
  const [modules, setModules] = useState<ModuleCompletionData[]>([])
  const [recentCompletions, setRecentCompletions] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function fetchModuleProgress() {
      try {
        const response = await fetch(`/api/courses/${courseId}/module-progress?studentId=${studentId}`)
        if (!response.ok) return

        const data = await response.json()
        const newModules: ModuleCompletionData[] = data.modules || []
        
        // Check for newly completed modules
        const previouslyCompleted = new Set(modules.filter(m => m.isCompleted).map(m => m.moduleId))
        const currentlyCompleted = new Set(newModules.filter(m => m.isCompleted).map(m => m.moduleId))
        
        // Find modules that were just completed
        const newCompletions = [...currentlyCompleted].filter(id => !previouslyCompleted.has(id))
        
        if (newCompletions.length > 0) {
          newCompletions.forEach(moduleId => {
            const completedModule = newModules.find(m => m.moduleId === moduleId)
            if (completedModule) {
              showCompletionNotification(completedModule)
              setRecentCompletions(prev => new Set(prev).add(moduleId))
              onModuleComplete?.(moduleId, completedModule.moduleTitle)
              
              // Remove from recent completions after animation
              setTimeout(() => {
                setRecentCompletions(prev => {
                  const updated = new Set(prev)
                  updated.delete(moduleId)
                  return updated
                })
              }, 5000)
            }
          })
        }

        setModules(newModules)
      } catch (error) {
        console.error("Error fetching module progress:", error)
      }
    }

    fetchModuleProgress()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchModuleProgress, 30000)
    return () => clearInterval(interval)
  }, [courseId, studentId, modules, onModuleComplete])

  const showCompletionNotification = (module: ModuleCompletionData) => {
    toast.success(
      `🎉 Module terminé !`,
      {
        description: `Félicitations ! Vous avez terminé "${module.moduleTitle}"`,
        duration: 5000,
        action: module.nextModuleId ? {
          label: "Module suivant",
          onClick: () => onNavigateToNext?.(module.nextModuleId!),
        } : undefined,
      }
    )
  }

  const getCompletionBadgeVariant = (percentage: number) => {
    if (percentage === 100) return "default"
    if (percentage >= 75) return "secondary"
    return "outline"
  }

  const getCompletionStatus = (percentage: number) => {
    if (percentage === 100) return "Terminé"
    if (percentage >= 75) return "Presque fini"
    if (percentage >= 50) return "En cours"
    if (percentage > 0) return "Commencé"
    return "Non commencé"
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {modules.map((module) => {
          const isRecentlyCompleted = recentCompletions.has(module.moduleId)
          
          return (
            <Card
              key={module.moduleId}
              className={cn(
                "transition-all duration-500",
                module.isCompleted && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
                isRecentlyCompleted && "animate-pulse border-green-500 shadow-lg scale-105"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                      module.isCompleted 
                        ? "bg-green-500 text-white" 
                        : module.completionPercentage > 0
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {module.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        module.moduleId
                      )}
                    </div>
                    <span className="truncate">{module.moduleTitle}</span>
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getCompletionBadgeVariant(module.completionPercentage)}>
                      {getCompletionStatus(module.completionPercentage)}
                    </Badge>
                    
                    {module.isCompleted && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Trophy className="h-4 w-4" />
                        {isRecentlyCompleted && (
                          <Star className="h-4 w-4 animate-bounce" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <CardDescription>
                  {module.completedChapters} sur {module.totalChapters} chapitres terminés
                  {module.completedAt && (
                    <span className="block text-xs mt-1">
                      Terminé le {new Date(module.completedAt).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progression</span>
                    <span className="font-medium">{module.completionPercentage}%</span>
                  </div>
                  
                  <Progress 
                    value={module.completionPercentage} 
                    className={cn(
                      "h-2 transition-all duration-500",
                      module.isCompleted && "bg-green-100 dark:bg-green-950"
                    )}
                  />
                  
                  {module.isCompleted && module.nextModuleId && (
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigateToNext?.(module.nextModuleId!)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        Module suivant: {module.nextModuleTitle}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Helper component for success celebration animation
export function ModuleCompletionCelebration({ 
  moduleTitle, 
  onClose 
}: { 
  moduleTitle: string
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="animate-bounce max-w-md">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-500 animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <Star className="h-8 w-8 text-yellow-400 animate-spin" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-green-600">
                🎉 Félicitations !
              </h3>
              <p className="text-muted-foreground">
                Vous avez terminé le module
              </p>
              <p className="font-semibold text-foreground">
                &ldquo;{moduleTitle}&rdquo;
              </p>
            </div>
            
            <Button onClick={onClose} className="mt-4">
              Continuer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
