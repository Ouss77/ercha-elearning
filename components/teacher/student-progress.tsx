"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, TrendingUp, TrendingDown, Minus, Eye } from "lucide-react"

interface StudentProgress {
  id: number
  firstName: string
  lastName: string
  email: string
  avatar?: string
  course: string
  enrolledAt: string
  lastActivity: string
  progress: number
  chaptersCompleted: number
  totalChapters: number
  averageQuizScore: number
  quizzesCompleted: number
  totalQuizzes: number
  status: "active" | "inactive" | "struggling"
}

export function StudentProgress() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Mock student progress data
  const [students] = useState<StudentProgress[]>([
    {
      id: 1,
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie.dupont@student.com",
      course: "Introduction à React",
      enrolledAt: "2025-01-01",
      lastActivity: "2025-01-15",
      progress: 85,
      chaptersCompleted: 7,
      totalChapters: 8,
      averageQuizScore: 92,
      quizzesCompleted: 6,
      totalQuizzes: 7,
      status: "active",
    },
    {
      id: 2,
      firstName: "Pierre",
      lastName: "Bernard",
      email: "pierre.bernard@student.com",
      course: "Marketing Digital Avancé",
      enrolledAt: "2025-01-02",
      lastActivity: "2025-01-14",
      progress: 95,
      chaptersCompleted: 11,
      totalChapters: 12,
      averageQuizScore: 88,
      quizzesCompleted: 10,
      totalQuizzes: 11,
      status: "active",
    },
    {
      id: 3,
      firstName: "Sophie",
      lastName: "Martin",
      email: "sophie.martin@student.com",
      course: "Design UX/UI Moderne",
      enrolledAt: "2025-01-03",
      lastActivity: "2025-01-10",
      progress: 25,
      chaptersCompleted: 2,
      totalChapters: 10,
      averageQuizScore: 65,
      quizzesCompleted: 2,
      totalQuizzes: 8,
      status: "struggling",
    },
    {
      id: 4,
      firstName: "Lucas",
      lastName: "Dubois",
      email: "lucas.dubois@student.com",
      course: "Introduction à React",
      enrolledAt: "2025-01-04",
      lastActivity: "2025-01-08",
      progress: 45,
      chaptersCompleted: 3,
      totalChapters: 8,
      averageQuizScore: 78,
      quizzesCompleted: 3,
      totalQuizzes: 7,
      status: "inactive",
    },
  ])

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === "all" || student.course === selectedCourse
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus
    return matchesSearch && matchesCourse && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Actif</Badge>
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Inactif</Badge>
      case "struggling":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">En difficulté</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getProgressTrend = (progress: number) => {
    if (progress >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (progress >= 50) return <Minus className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Suivi des Étudiants</CardTitle>
          <CardDescription>Suivez la progression de vos étudiants dans tous vos cours</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                <SelectItem value="Introduction à React">Introduction à React</SelectItem>
                <SelectItem value="Marketing Digital Avancé">Marketing Digital Avancé</SelectItem>
                <SelectItem value="Design UX/UI Moderne">Design UX/UI Moderne</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="struggling">En difficulté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière activité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{student.course}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getProgressTrend(student.progress)}
                          <span className="text-sm font-medium">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-1 w-20" />
                        <p className="text-xs text-muted-foreground">
                          {student.chaptersCompleted}/{student.totalChapters} chapitres
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="text-sm font-medium">{student.averageQuizScore}%</p>
                        <p className="text-xs text-muted-foreground">
                          {student.quizzesCompleted}/{student.totalQuizzes} quiz
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(student.lastActivity).toLocaleDateString("fr-FR")}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun étudiant trouvé avec ces filtres</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
