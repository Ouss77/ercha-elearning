"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, Clock, Award, BookOpen, Target } from "lucide-react"

export function CourseAnalytics() {
  const [selectedCourse, setSelectedCourse] = useState("react")

  // Mock analytics data
  const courseData = {
    react: {
      title: "Introduction à React",
      totalStudents: 45,
      activeStudents: 38,
      averageProgress: 68,
      averageQuizScore: 82,
      completionRate: 73,
      averageTimeSpent: 24,
    },
    marketing: {
      title: "Marketing Digital Avancé",
      totalStudents: 32,
      activeStudents: 29,
      averageProgress: 85,
      averageQuizScore: 89,
      completionRate: 91,
      averageTimeSpent: 31,
    },
    design: {
      title: "Design UX/UI Moderne",
      totalStudents: 28,
      activeStudents: 22,
      averageProgress: 42,
      averageQuizScore: 76,
      completionRate: 45,
      averageTimeSpent: 18,
    },
  }

  const progressData = [
    { chapter: "Ch. 1", completed: 42, total: 45 },
    { chapter: "Ch. 2", completed: 39, total: 45 },
    { chapter: "Ch. 3", completed: 35, total: 45 },
    { chapter: "Ch. 4", completed: 31, total: 45 },
    { chapter: "Ch. 5", completed: 28, total: 45 },
    { chapter: "Ch. 6", completed: 22, total: 45 },
    { chapter: "Ch. 7", completed: 18, total: 45 },
    { chapter: "Ch. 8", completed: 12, total: 45 },
  ]

  const quizScoreData = [
    { quiz: "Quiz 1", average: 85, passing: 38 },
    { quiz: "Quiz 2", average: 78, passing: 35 },
    { quiz: "Quiz 3", average: 82, passing: 31 },
    { quiz: "Quiz 4", average: 79, passing: 28 },
    { quiz: "Quiz 5", average: 88, passing: 25 },
    { quiz: "Quiz 6", average: 84, passing: 20 },
    { quiz: "Quiz 7", average: 81, passing: 16 },
  ]

  const engagementData = [
    { name: "Très engagés", value: 15, color: "#22c55e" },
    { name: "Moyennement engagés", value: 23, color: "#3b82f6" },
    { name: "Peu engagés", value: 7, color: "#f59e0b" },
  ]

  const currentCourse = courseData[selectedCourse as keyof typeof courseData]

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analyses Détaillées</CardTitle>
              <CardDescription>Statistiques approfondies de vos cours</CardDescription>
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Sélectionner un cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">Introduction à React</SelectItem>
                <SelectItem value="marketing">Marketing Digital Avancé</SelectItem>
                <SelectItem value="design">Design UX/UI Moderne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentCourse.totalStudents}</div>
            <p className="text-xs text-muted-foreground">{currentCourse.activeStudents} actifs</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentCourse.averageProgress}%</div>
            <Progress value={currentCourse.averageProgress} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Quiz</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentCourse.averageQuizScore}%</div>
            <p className="text-xs text-muted-foreground">moyenne</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentCourse.completionRate}%</div>
            <p className="text-xs text-muted-foreground">terminé</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentCourse.averageTimeSpent}h</div>
            <p className="text-xs text-muted-foreground">par étudiant</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">score global</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chapter Progress Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Progression par Chapitre</CardTitle>
            <CardDescription>Nombre d'étudiants ayant terminé chaque chapitre</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chapter" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz Performance Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Performance des Quiz</CardTitle>
            <CardDescription>Score moyen et nombre de réussites par quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={quizScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quiz" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Engagement */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Engagement des Étudiants</CardTitle>
            <CardDescription>Répartition du niveau d'engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Insights */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Insights et Recommandations</CardTitle>
            <CardDescription>Analyses automatiques de votre cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Bon taux de rétention</p>
                  <p className="text-xs text-muted-foreground">
                    84% des étudiants sont toujours actifs après 3 semaines
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Difficulté au chapitre 6</p>
                  <p className="text-xs text-muted-foreground">
                    Baisse significative de progression - considérez du contenu supplémentaire
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Quiz bien calibrés</p>
                  <p className="text-xs text-muted-foreground">
                    Score moyen de 82% indique un bon niveau de difficulté
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">7 étudiants en difficulté</p>
                  <p className="text-xs text-muted-foreground">
                    Progression inférieure à 30% - intervention recommandée
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
