"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { BookPlus, Search, Edit, Trash2, Eye } from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  domain: string
  teacher: string
  studentsCount: number
  chaptersCount: number
  isActive: boolean
  createdAt: string
}

export function CoursesManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Mock courses data
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Introduction à React",
      description: "Apprenez les bases de React et créez vos premières applications",
      domain: "Informatique",
      teacher: "Jean Martin",
      studentsCount: 45,
      chaptersCount: 8,
      isActive: true,
      createdAt: "2025-01-01",
    },
    {
      id: 2,
      title: "Marketing Digital Avancé",
      description: "Stratégies avancées de marketing digital et analytics",
      domain: "Marketing",
      teacher: "Jean Martin",
      studentsCount: 32,
      chaptersCount: 12,
      isActive: true,
      createdAt: "2025-01-05",
    },
    {
      id: 3,
      title: "Design UX/UI Moderne",
      description: "Principes de design et création d'interfaces utilisateur",
      domain: "Design",
      teacher: "Jean Martin",
      studentsCount: 28,
      chaptersCount: 10,
      isActive: false,
      createdAt: "2025-01-10",
    },
  ])

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.domain.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleCourseStatus = (courseId: number) => {
    setCourses(courses.map((course) => (course.id === courseId ? { ...course, isActive: !course.isActive } : course)))
  }

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case "Informatique":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Marketing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Design":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Gestion":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Cours</CardTitle>
              <CardDescription>Créez et gérez les cours de la plateforme</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <BookPlus className="mr-2 h-4 w-4" />
                  Créer un cours
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau cours</DialogTitle>
                  <DialogDescription>Ajoutez un nouveau cours à la plateforme</DialogDescription>
                </DialogHeader>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">Fonctionnalité de création de cours à implémenter</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Courses Table */}
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cours</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Professeur</TableHead>
                  <TableHead>Étudiants</TableHead>
                  <TableHead>Chapitres</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{course.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDomainColor(course.domain)}>{course.domain}</Badge>
                    </TableCell>
                    <TableCell>{course.teacher}</TableCell>
                    <TableCell>{course.studentsCount}</TableCell>
                    <TableCell>{course.chaptersCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch checked={course.isActive} onCheckedChange={() => toggleCourseStatus(course.id)} />
                        <span className="text-sm text-muted-foreground">{course.isActive ? "Actif" : "Inactif"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
