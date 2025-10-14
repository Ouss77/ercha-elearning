"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Trophy, BookOpen, Target, TrendingUp } from "lucide-react"

interface ProgressData {
  courseId: string
  studentId: string
  overallProgress: number
  chaptersCompleted: number
  totalChapters: number
  quizzesPassed: number
  totalQuizzes: number
  averageQuizScore: number
  timeSpent: number
  lastActivity: string
  chapterProgress: ChapterProgress[]
}

interface ChapterProgress {
  chapterId: string
  title: string
  completed: boolean
  score: number | null
  timeSpent: number
}

interface ProgressTrackerProps {
  courseId: string
  studentId?: string
  showDetailed?: boolean
}

export function ProgressTracker({ courseId, studentId, showDetailed = true }: ProgressTrackerProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const params = new URLSearchParams({ courseId })
        if (studentId) params.append("studentId", studentId)

        const response = await fetch(`/api/progress?${params}`)
        if (response.ok) {
          const data = await response.json()
          setProgressData(data)
        }
      } catch (error) {
        console.error("Error fetching progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [courseId, studentId])

  const updateProgress = async (chapterId: string, action: string, score?: number, timeSpent?: number) => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, chapterId, action, score, timeSpent }),
      })

      if (response.ok) {
        // Refresh progress data
        const params = new URLSearchParams({ courseId })
        if (studentId) params.append("studentId", studentId)

        const refreshResponse = await fetch(`/api/progress?${params}`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setProgressData(data)
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!progressData) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Aucune donnée de progression disponible</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Progression Générale</span>
          </CardTitle>
          <CardDescription>Vue d'ensemble de votre avancement dans le cours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Progression du cours</span>
              <span className="text-sm text-muted-foreground">{progressData.overallProgress}%</span>
            </div>
            <Progress value={progressData.overallProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold text-foreground">{progressData.chaptersCompleted}</span>
                <span className="text-sm text-muted-foreground">/{progressData.totalChapters}</span>
              </div>
              <p className="text-xs text-muted-foreground">Chapitres terminés</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold text-foreground">{progressData.quizzesPassed}</span>
                <span className="text-sm text-muted-foreground">/{progressData.totalQuizzes}</span>
              </div>
              <p className="text-xs text-muted-foreground">Quiz réussis</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold text-foreground">{progressData.averageQuizScore}</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Score moyen</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold text-foreground">{formatTime(progressData.timeSpent)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Temps passé</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Chapter Progress */}
      {showDetailed && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Progression par Chapitre</CardTitle>
            <CardDescription>Détail de votre avancement dans chaque chapitre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.chapterProgress.map((chapter, index) => (
                <div
                  key={chapter.chapterId}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        chapter.completed ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{chapter.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={chapter.completed ? "default" : "secondary"}>
                          {chapter.completed ? "Terminé" : "En cours"}
                        </Badge>
                        {chapter.timeSpent > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(chapter.timeSpent)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {chapter.score !== null ? (
                      <div className={`text-lg font-bold ${getScoreColor(chapter.score)}`}>{chapter.score}%</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Pas encore évalué</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Activity */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Dernière activité :{" "}
              {new Date(progressData.lastActivity).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
