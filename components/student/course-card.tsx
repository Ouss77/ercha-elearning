"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, CheckCircle, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
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
    <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
      <div className="relative">
        <Image
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          width={300}
          height={200}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        {course.isCompleted && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Terminé
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge className={getDomainColor(course.domain)}>{course.domain}</Badge>
          <span className="text-xs text-muted-foreground">
            {course.completedChapters}/{course.totalChapters} chapitres
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        <p className="text-sm text-muted-foreground">Par {course.teacher}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>

          {course.lastAccessed && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Dernière visite: {new Date(course.lastAccessed).toLocaleDateString("fr-FR")}
            </div>
          )}

          <Button asChild className="w-full">
            <Link href={`/etudiant/course/${course.id}`}>
              <Play className="w-4 h-4 mr-2" />
              {course.progress > 0 ? "Continuer" : "Commencer"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
