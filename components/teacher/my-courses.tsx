"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, BookOpen, BarChart3, Settings, Eye } from "lucide-react"
import Image from "next/image"

interface Course {
  id: number
  title: string
  description: string
  domain: string
  thumbnail: string
  studentsCount: number
  chaptersCount: number
  averageProgress: number
  averageQuizScore: number
  isActive: boolean
  createdAt: string
}

export function MyCourses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Mock courses data
  const [courses] = useState<Course[]>([
    {
      id: 1,
      title: "Introduction à React",
      description: "Apprenez les bases de React et créez vos premières applications",
      domain: "Informatique",
      thumbnail: "/react-course.png",
      studentsCount: 45,
      chaptersCount: 8,
      averageProgress: 68,
      averageQuizScore: 82,
      isActive: true,
      createdAt: "2025-01-01",
    },
    {
      id: 2,
      title: "Marketing Digital Avancé",
      description: "Stratégies avancées de marketing digital et analytics",
      domain: "Marketing",
      thumbnail: "/marketing-course-concept.png",
      studentsCount: 32,
      chaptersCount: 12,
      averageProgress: 85,
      averageQuizScore: 89,
      isActive: true,
      createdAt: "2025-01-05",
    },
    {
      id: 3,
      title: "Design UX/UI Moderne",
      description: "Principes de design et création d'interfaces utilisateur",
      domain: "Design",
      thumbnail: "/ux-ui-design-course.png",
      studentsCount: 28,
      chaptersCount: 10,
      averageProgress: 42,
      averageQuizScore: 76,
      isActive: false,
      createdAt: "2025-01-10",
    },
  ])

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && course.isActive) ||
      (activeTab === "inactive" && !course.isActive)
    return matchesSearch && matchesTab
  })

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
          <CardTitle>Mes Cours</CardTitle>
          <CardDescription>Gérez et suivez vos cours assignés</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="active">Actifs</TabsTrigger>
                <TabsTrigger value="inactive">Inactifs</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Courses Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="border-border bg-card hover:bg-accent/50 transition-colors">
                <div className="relative">
                  <Image
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={course.isActive ? "default" : "secondary"}>
                      {course.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getDomainColor(course.domain)}>{course.domain}</Badge>
                    <span className="text-xs text-muted-foreground">{course.chaptersCount} chapitres</span>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{course.studentsCount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">étudiants</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{course.averageQuizScore}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">score moyen</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression moyenne</span>
                        <span>{course.averageProgress}%</span>
                      </div>
                      <Progress value={course.averageProgress} className="h-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun cours trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
