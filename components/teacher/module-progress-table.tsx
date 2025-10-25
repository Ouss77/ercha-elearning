"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, TrendingUp, CheckCircle2 } from "lucide-react"
import { useModuleStats } from "@/lib/query/use-progress-queries"

interface ModuleProgressData {
  moduleId: number
  moduleTitle: string
  totalChapters: number
  totalStudents: number
  studentsStarted: number
  studentsInProgress: number
  studentsCompleted: number
  averageProgress: number
}

interface ModuleProgressTableProps {
  courseId: number
  courseName: string
}

export function ModuleProgressTable({ courseId, courseName }: ModuleProgressTableProps) {
  // Use React Query hook for cached data fetching
  const { data, isLoading, error } = useModuleStats(courseId.toString())
  const modules = data?.modules || []

  if (isLoading) {
    return <ModuleProgressTableSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-destructive">
            {error instanceof Error ? error.message : "Une erreur s'est produite"}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Aucun module disponible pour ce cours.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression par module</CardTitle>
        <CardDescription>
          Statistiques de progression des étudiants pour {courseName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead className="text-center">Chapitres</TableHead>
              <TableHead className="text-center">Étudiants</TableHead>
              <TableHead className="text-center">Commencés</TableHead>
              <TableHead className="text-center">En cours</TableHead>
              <TableHead className="text-center">Terminés</TableHead>
              <TableHead>Progression moyenne</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module: ModuleProgressData) => {
              return (
                <TableRow key={module.moduleId}>
                  <TableCell className="font-medium">
                    {module.moduleTitle}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{module.totalChapters}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{module.totalStudents}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {module.studentsStarted}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{module.studentsInProgress}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{module.studentsCompleted}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={module.averageProgress} className="flex-1" />
                      <span className="text-sm text-muted-foreground min-w-[3ch]">
                        {Math.round(module.averageProgress)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total étudiants</p>
                  <p className="text-2xl font-bold">
                    {modules[0]?.totalStudents || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Modules actifs</p>
                  <p className="text-2xl font-bold">{modules.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Taux moyen</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      modules.reduce((acc: number, m: ModuleProgressData) => acc + m.averageProgress, 0) /
                        modules.length
                    )}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

function ModuleProgressTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
