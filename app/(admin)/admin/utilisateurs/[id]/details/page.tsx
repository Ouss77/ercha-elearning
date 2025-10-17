import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, BookOpen, Edit } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Role } from "@/lib/schemas/user"
import { requireAuth } from "@/lib/auth/auth"
import { getUserById } from "@/lib/db/db"
import { notFound } from "next/navigation"

interface Course {
  id: number
  title: string
  description: string | null
  isActive: boolean
}

interface Enrollment {
  id: number
  courseId: number
  course: Course
  enrolledAt: string
  completedAt?: string | null
  progress?: number
}

async function fetchEnrollments(userId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const enrollmentsResponse = await fetch(`${baseUrl}/api/enrollments?studentId=${userId}`, {
      cache: 'no-store'
    })
    
    if (enrollmentsResponse.ok) {
      const enrollmentsData = await enrollmentsResponse.json()
      return enrollmentsData.enrollments || []
    }
    return []
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return []
  }
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  await requireAuth(["ADMIN"])
  
  const userId = parseInt(params.id)
  if (isNaN(userId)) {
    notFound()
  }

  const result = await getUserById(userId)
  if (!result.success || !result.data) {
    notFound()
  }

  const user = result.data
  let enrollments: Enrollment[] = []

  if (user.role === "STUDENT") {
    enrollments = await fetchEnrollments(params.id)
  }

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "default"
      case "SUB_ADMIN":
        return "default"
      case "TRAINER":
        return "secondary"
      case "STUDENT":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur"
      case "SUB_ADMIN":
        return "Sous-administrateur"
      case "TRAINER":
        return "Professeur"
      case "STUDENT":
        return "Étudiant"
      default:
        return role
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/utilisateurs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
        <Link href={`/admin/utilisateurs/${params.id}`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </Link>
      </div>

      {/* User Profile Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoUrl || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-base">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations de contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-sm">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.dateOfBirth && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                    <p className="text-sm">
                      {new Date(user.dateOfBirth).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {(user.address || user.city || user.country) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adresse
                </h3>
                <div className="space-y-2">
                  {user.address && (
                    <p className="text-sm">{user.address}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {user.city && <span>{user.city}</span>}
                    {user.postalCode && <span>{user.postalCode}</span>}
                    {user.country && <span>{user.country}</span>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Biography */}
          {user.bio && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Biographie</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
              </div>
            </>
          )}

          {/* Account Information */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations du compte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                <p className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernière modification</p>
                <p className="text-sm">
                  {new Date(user.updatedAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Fix the empty enrollment issue */}
      {/* Enrolled Courses (for Students) */}
      {user.role === "STUDENT" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cours inscrits
            </CardTitle>
            <CardDescription>
              {enrollments.length > 0
                ? `${enrollments.length} cours inscrit${enrollments.length > 1 ? "s" : ""}`
                : "Aucun cours inscrit"}
            </CardDescription>
          </CardHeader>
          {enrollments.length > 0 && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="p-4 rounded-lg border border-border bg-muted/30 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium">{enrollment.course.title}</h4>
                      {enrollment.course.isActive && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Actif
                        </Badge>
                      )}
                    </div>
                    {enrollment.course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {enrollment.course.description}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Inscrit le {new Date(enrollment.enrolledAt).toLocaleDateString("fr-FR")}
                    </div>
                    {enrollment.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
