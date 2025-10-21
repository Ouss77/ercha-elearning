"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Course {
  id: number
  title: string
  description: string | null
  domainId: number | null
  teacherId: number | null
  isActive: boolean
}

interface Enrollment {
  id: number
  studentId: number
  courseId: number
  createdAt: Date
}

interface CourseEnrollmentDialogProps {
  userId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnrollmentComplete?: () => void
}

export function CourseEnrollmentDialog({
  userId,
  open,
  onOpenChange,
  onEnrollmentComplete,
}: CourseEnrollmentDialogProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, userId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all courses
      const coursesResponse = await fetch("/api/courses")
      const coursesData = await coursesResponse.json()

      if (coursesResponse.ok) {
        // Filter to show only active courses
        const activeCourses = (coursesData.courses || []).filter((course: Course) => course.isActive)
        setCourses(activeCourses)
      } else {
        toast.error("Erreur lors du chargement des cours")
      }

      // Fetch user's current enrollments
      const enrollmentsResponse = await fetch(`/api/enrollments?studentId=${userId}`)
      const enrollmentsData = await enrollmentsResponse.json()

      if (enrollmentsResponse.ok) {
        setEnrollments(enrollmentsData.enrollments || [])
        setSelectedCourses(
          (enrollmentsData.enrollments || []).map((e: Enrollment) => e.courseId)
        )
      } else {
        toast.error("Erreur lors du chargement des inscriptions")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCourse = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const currentEnrollmentIds = enrollments.map((e) => e.courseId)
      const toAdd = selectedCourses.filter((id) => !currentEnrollmentIds.includes(id))
      const toRemove = enrollments.filter((e) => !selectedCourses.includes(e.courseId))

      // Add new enrollments
      if (toAdd.length > 0) {
        const response = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: userId,
            courseIds: toAdd,
          }),
        })

        if (!response.ok) {
          toast.error("Erreur lors de l'ajout des inscriptions")
          setSaving(false)
          return
        }
      }

      // Remove old enrollments
      for (const enrollment of toRemove) {
        const response = await fetch(`/api/enrollments/${enrollment.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          toast.error("Erreur lors de la suppression des inscriptions")
          setSaving(false)
          return
        }
      }

      toast.success("Inscriptions mises à jour avec succès")
      onEnrollmentComplete?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving enrollments:", error)
      toast.error("Erreur lors de la mise à jour des inscriptions")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gérer les inscriptions aux cours</DialogTitle>
          <DialogDescription>
            Sélectionnez les cours auxquels inscrire cet utilisateur
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <div className="space-y-4">
              {courses.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucun cours disponible
                </p>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={() => handleToggleCourse(course.id)}
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={`course-${course.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {course.title}
                      </label>
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
