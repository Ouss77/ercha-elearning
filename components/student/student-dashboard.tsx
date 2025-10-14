"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LogoutButton } from "@/components/auth/logout-button"
import { CourseCard } from "./course-card"
import { BookOpen, GraduationCap, Trophy, Clock, TrendingUp, Play } from "lucide-react"
import type { User } from "@/lib/auth"

interface StudentDashboardProps {
  user: User
}

interface Course {
  id: number
  title: string
  description: string
  domain: string
  teacher: string
  thumbnail: string
  progress: number
  totalChapters: number
  completedChapters: number
  lastAccessed?: string
  isCompleted: boolean
}

interface QuizResult {
  id: number
  courseName: string
  chapterName: string
  score: number
  maxScore: number
  passed: boolean
  completedAt: string
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  // Mock data - replace with real data from database
  const [enrolledCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Introduction à React",
      description: "Apprenez les bases de React et créez vos premières applications",
      domain: "Informatique",
      teacher: "Jean Martin",
      thumbnail: "/react-course.png",
      progress: 65,
      totalChapters: 8,
      completedChapters: 5,
      lastAccessed: "2025-01-15",
      isCompleted: false,
    },
    {
      id: 2,
      title: "Marketing Digital Avancé",
      description: "Stratégies avancées de marketing digital et analytics",
      domain: "Marketing",
      teacher: "Jean Martin",
      thumbnail: "/marketing-course-concept.png",
      progress: 100,
      totalChapters: 12,
      completedChapters: 12,
      lastAccessed: "2025-01-10",
      isCompleted: true,
    },
    {
      id: 3,
      title: "Design UX/UI Moderne",
      description: "Principes de design et création d'interfaces utilisateur",
      domain: "Design",
      teacher: "Jean Martin",
      thumbnail: "/ux-ui-design-course.png",
      progress: 25,
      totalChapters: 10,
      completedChapters: 2,
      lastAccessed: "2025-01-12",
      isCompleted: false,
    },
  ])

  const [recentQuizResults] = useState<QuizResult[]>([
    {
      id: 1,
      courseName: "Introduction à React",
      chapterName: "Composants et Props",
      score: 85,
      maxScore: 100,
      passed: true,
      completedAt: "2025-01-15",
    },
    {
      id: 2,
      courseName: "Marketing Digital Avancé",
      chapterName: "Analytics et KPIs",
      score: 92,
      maxScore: 100,
      passed: true,
      completedAt: "2025-01-10",
    },
  ])

  const stats = {
    totalCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter((c) => c.isCompleted).length,
    averageProgress: Math.round(
      enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length,
    ),
    totalChapters: enrolledCourses.reduce((acc, course) => acc + course.totalChapters, 0),
    completedChapters: enrolledCourses.reduce((acc, course) => acc + course.completedChapters, 0),
  }

  const inProgressCourses = enrolledCourses.filter((course) => !course.isCompleted && course.progress > 0)
  const completedCourses = enrolledCourses.filter((course) => course.isCompleted)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Mon Espace Étudiant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Étudiant
              </Badge>
              <span className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Bonjour {user.firstName} !</h2>
          <p className="text-muted-foreground">Continuez votre parcours d'apprentissage et atteignez vos objectifs.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cours Inscrits</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">{stats.completedCourses} terminés</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progression Moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProgress}%</div>
              <Progress value={stats.averageProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chapitres Complétés</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedChapters}</div>
              <p className="text-xs text-muted-foreground">sur {stats.totalChapters} chapitres</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps d'étude</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24h</div>
              <p className="text-xs text-muted-foreground">cette semaine</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            {inProgressCourses.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5 text-primary" />
                    <span>Continuer l'apprentissage</span>
                  </CardTitle>
                  <CardDescription>Reprenez là où vous vous êtes arrêté</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {inProgressCourses.slice(0, 2).map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Courses */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Mes Cours</CardTitle>
                <CardDescription>Tous vos cours inscrits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {enrolledCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Quiz Results */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Résultats Récents</CardTitle>
                <CardDescription>Vos derniers quiz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuizResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{result.chapterName}</p>
                        <p className="text-xs text-muted-foreground">{result.courseName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.score}/{result.maxScore}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(result.completedAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Réalisations</CardTitle>
                <CardDescription>Vos accomplissements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Premier cours terminé</p>
                      <p className="text-xs text-muted-foreground">Marketing Digital Avancé</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-chart-2/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">5 chapitres complétés</p>
                      <p className="text-xs text-muted-foreground">Introduction à React</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
