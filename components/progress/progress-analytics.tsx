"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Users, BookOpen, Award, AlertCircle } from "lucide-react"

interface AnalyticsData {
  courseStats: {
    totalStudents: number
    activeStudents: number
    averageProgress: number
    completionRate: number
  }
  chapterAnalytics: Array<{
    chapterId: string
    title: string
    completionRate: number
    averageScore: number
    averageTime: number
    difficulty: "easy" | "medium" | "hard"
  }>
  studentPerformance: Array<{
    studentId: string
    name: string
    progress: number
    averageScore: number
    timeSpent: number
    lastActivity: string
    status: "excellent" | "good" | "needs_attention"
  }>
  progressTrend: Array<{
    date: string
    completions: number
    averageScore: number
  }>
}

interface ProgressAnalyticsProps {
  courseId: string
}

export function ProgressAnalytics({ courseId }: ProgressAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Mock data - replace with real API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockData: AnalyticsData = {
          courseStats: {
            totalStudents: 45,
            activeStudents: 38,
            averageProgress: 67,
            completionRate: 24,
          },
          chapterAnalytics: [
            {
              chapterId: "1",
              title: "Introduction",
              completionRate: 95,
              averageScore: 87,
              averageTime: 25,
              difficulty: "easy",
            },
            {
              chapterId: "2",
              title: "Concepts de base",
              completionRate: 89,
              averageScore: 82,
              averageTime: 35,
              difficulty: "easy",
            },
            {
              chapterId: "3",
              title: "Pratique",
              completionRate: 76,
              averageScore: 75,
              averageTime: 45,
              difficulty: "medium",
            },
            {
              chapterId: "4",
              title: "Avancé",
              completionRate: 62,
              averageScore: 68,
              averageTime: 55,
              difficulty: "hard",
            },
            {
              chapterId: "5",
              title: "Projet",
              completionRate: 34,
              averageScore: 72,
              averageTime: 85,
              difficulty: "hard",
            },
            {
              chapterId: "6",
              title: "Tests",
              completionRate: 28,
              averageScore: 79,
              averageTime: 40,
              difficulty: "medium",
            },
          ],
          studentPerformance: [
            {
              studentId: "1",
              name: "Marie Dupont",
              progress: 95,
              averageScore: 92,
              timeSpent: 180,
              lastActivity: "2024-01-15",
              status: "excellent",
            },
            {
              studentId: "2",
              name: "Jean Martin",
              progress: 87,
              averageScore: 85,
              timeSpent: 165,
              lastActivity: "2024-01-14",
              status: "excellent",
            },
            {
              studentId: "3",
              name: "Sophie Bernard",
              progress: 72,
              averageScore: 78,
              timeSpent: 145,
              lastActivity: "2024-01-13",
              status: "good",
            },
            {
              studentId: "4",
              name: "Pierre Leroy",
              progress: 45,
              averageScore: 65,
              timeSpent: 95,
              lastActivity: "2024-01-10",
              status: "needs_attention",
            },
            {
              studentId: "5",
              name: "Emma Moreau",
              progress: 38,
              averageScore: 58,
              timeSpent: 75,
              lastActivity: "2024-01-08",
              status: "needs_attention",
            },
          ],
          progressTrend: [
            { date: "2024-01-01", completions: 5, averageScore: 78 },
            { date: "2024-01-02", completions: 8, averageScore: 82 },
            { date: "2024-01-03", completions: 12, averageScore: 79 },
            { date: "2024-01-04", completions: 15, averageScore: 85 },
            { date: "2024-01-05", completions: 18, averageScore: 83 },
            { date: "2024-01-06", completions: 22, averageScore: 87 },
            { date: "2024-01-07", completions: 25, averageScore: 84 },
          ],
        }

        setAnalyticsData(mockData)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [courseId])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "hard":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-500"
      case "good":
        return "text-blue-500"
      case "needs_attention":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <Award className="h-4 w-4" />
      case "good":
        return <TrendingUp className="h-4 w-4" />
      case "needs_attention":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Aucune donnée d'analyse disponible</p>
        </CardContent>
      </Card>
    )
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

  return (
    <div className="space-y-6">
      {/* Course Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{analyticsData.courseStats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Étudiants inscrits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{analyticsData.courseStats.activeStudents}</p>
                <p className="text-xs text-muted-foreground">Étudiants actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{analyticsData.courseStats.averageProgress}%</p>
                <p className="text-xs text-muted-foreground">Progression moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{analyticsData.courseStats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Taux de réussite</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chapter Analytics */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Analyse par Chapitre</CardTitle>
          <CardDescription>Performance et difficulté de chaque chapitre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.chapterAnalytics.map((chapter) => (
              <div key={chapter.chapterId} className="p-4 border border-border rounded-lg bg-background">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getDifficultyColor(chapter.difficulty)}`}></div>
                    <h4 className="font-medium text-foreground">{chapter.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {chapter.difficulty === "easy"
                        ? "Facile"
                        : chapter.difficulty === "medium"
                          ? "Moyen"
                          : "Difficile"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{Math.round(chapter.averageTime)} min moyenne</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Taux de completion</span>
                      <span className="text-xs font-medium">{chapter.completionRate}%</span>
                    </div>
                    <Progress value={chapter.completionRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Score moyen</span>
                      <span className="text-xs font-medium">{chapter.averageScore}%</span>
                    </div>
                    <Progress value={chapter.averageScore} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Performance */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Performance des Étudiants</CardTitle>
          <CardDescription>Suivi individuel des étudiants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.studentPerformance.map((student) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-background"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-1 ${getStatusColor(student.status)}`}>
                    {getStatusIcon(student.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{student.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Dernière activité: {new Date(student.lastActivity).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-foreground">{student.progress}%</p>
                    <p className="text-xs text-muted-foreground">Progression</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{student.averageScore}%</p>
                    <p className="text-xs text-muted-foreground">Score moyen</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{Math.round(student.timeSpent / 60)}h</p>
                    <p className="text-xs text-muted-foreground">Temps passé</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Trend Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Tendance de Progression</CardTitle>
          <CardDescription>Évolution des completions et scores dans le temps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.progressTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
                  }
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line type="monotone" dataKey="completions" stroke="#3b82f6" strokeWidth={2} name="Completions" />
                <Line type="monotone" dataKey="averageScore" stroke="#10b981" strokeWidth={2} name="Score moyen" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
