"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, BookOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Course {
  id: number
  title: string
  description: string | null
  isActive: boolean
}

interface Enrollment {
  id: number
  studentId: number
  courseId: number
}

export default function UserFormPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const isEditMode = userId !== "creer"
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    password: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Morocco",
    bio: "",
    avatarUrl: "",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [fetchingUser, setFetchingUser] = useState(isEditMode)
  const [error, setError] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    if (isEditMode) {
      fetchUser()
    }
    fetchCourses()
  }, [isEditMode])

  // Fetch enrollments after user data is loaded
  useEffect(() => {
    if (isEditMode && formData.role === "STUDENT" && !fetchingUser) {
      fetchEnrollments()
    }
  }, [isEditMode, formData.role, fetchingUser])

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await fetch("/api/courses")
      const data = await response.json()

      if (response.ok) {
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchEnrollments = async () => {
    if (!isEditMode || formData.role !== "STUDENT") return
    
    try {
      const enrollmentsResponse = await fetch(`/api/enrollments?studentId=${userId}`)
      const enrollmentsData = await enrollmentsResponse.json()
      
      if (enrollmentsResponse.ok) {
        setSelectedCourses((enrollmentsData.enrollments || []).map((e: Enrollment) => e.courseId))
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    }
  }

  const fetchUser = async () => {
    try {
      setFetchingUser(true)
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()

      if (response.ok) {
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          role: data.user.role || "STUDENT",
          password: "", // Don't populate password for security
          phone: data.user.phone || "",
          dateOfBirth: data.user.dateOfBirth ? new Date(data.user.dateOfBirth).toISOString().split('T')[0] : "",
          address: data.user.address || "",
          city: data.user.city || "",
          postalCode: data.user.postalCode || "",
          country: data.user.country || "Morocco",
          bio: data.user.bio || "",
          avatarUrl: data.user.avatarUrl || "",
          isActive: data.user.isActive ?? true,
        })
      } else {
        setError(data.error || "Erreur lors du chargement de l'utilisateur")
      }
    } catch (error) {
      console.error("[v0] Error fetching user:", error)
      setError("Erreur de connexion au serveur")
    } finally {
      setFetchingUser(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmDialog(true)
  }

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    setShowConfirmDialog(false)

    try {
      const url = isEditMode ? `/api/users/${userId}` : "/api/users"
      const method = isEditMode ? "PUT" : "POST"
      
      // Only include password if it's provided (for edit mode)
      const payload = isEditMode && !formData.password
        ? { 
            name: formData.name, 
            email: formData.email, 
            role: formData.role,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            bio: formData.bio,
            avatarUrl: formData.avatarUrl,
            isActive: formData.isActive
          }
        : formData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        const createdUserId = isEditMode ? userId : data.user?.id
        
        // Handle course enrollments for students
        if (formData.role === "STUDENT" && createdUserId) {
          // Get current enrollments if editing
          let currentEnrollments: Enrollment[] = []
          if (isEditMode) {
            const enrollmentsResponse = await fetch(`/api/enrollments?studentId=${createdUserId}`)
            const enrollmentsData = await enrollmentsResponse.json()
            if (enrollmentsResponse.ok) {
              currentEnrollments = enrollmentsData.enrollments || []
            }
          }
          
          const currentEnrollmentIds = currentEnrollments.map(e => e.courseId)
          const toAdd = selectedCourses.filter(id => !currentEnrollmentIds.includes(id))
          const toRemove = currentEnrollments.filter(e => !selectedCourses.includes(e.courseId))
          
          // Add new enrollments
          if (toAdd.length > 0) {
            await fetch("/api/enrollments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentId: createdUserId,
                courseIds: toAdd,
              }),
            })
          }
          
          // Remove old enrollments
          for (const enrollment of toRemove) {
            await fetch(`/api/enrollments/${enrollment.id}`, {
              method: "DELETE",
            })
          }
        }
        
        // Redirect with success message
        const successMessage = isEditMode 
          ? "Utilisateur modifié avec succès" 
          : "Utilisateur créé avec succès"
        router.push(`/admin/utilisateurs?success=${encodeURIComponent(successMessage)}`)
      } else {
        setError(data.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'}`)
        toast.error(data.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'}`)
      }
    } catch (error) {
      console.error(`[v0] Error ${isEditMode ? 'updating' : 'creating'} user:`, error)
      setError("Erreur de connexion au serveur")
      toast.error("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/utilisateurs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{isEditMode ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Modifiez les informations de l'utilisateur" 
              : "Ajoutez un nouvel utilisateur à la plateforme"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations de base</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean.dupont@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mot de passe {isEditMode ? <span className="text-muted-foreground text-xs">(laissez vide pour ne pas modifier)</span> : "*"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={isEditMode ? "Nouveau mot de passe (optionnel)" : "Mot de passe sécurisé"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!isEditMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Étudiant</SelectItem>
                      <SelectItem value="TRAINER">Professeur</SelectItem>
                      <SelectItem value="SUB_ADMIN">Sous-Admin</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+212 6XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-lg font-medium">Adresse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Input
                    id="address"
                    placeholder="123 Rue Example"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Casablanca"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    placeholder="20000"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    placeholder="Morocco"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-lg font-medium">Informations complémentaires</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">URL de l&apos;avatar</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous un peu de vous..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Compte actif
                  </Label>
                </div>
              </div>
            </div>

            {/* Course Enrollment (Students Only) */}
            {formData.role === "STUDENT" && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Inscription aux cours</h3>
                </div>
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun cours disponible</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border ${
                          selectedCourses.includes(course.id)
                            ? "bg-primary/5 border-primary"
                            : "bg-muted/30 border-border"
                        }`}
                      >
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCourses([...selectedCourses, course.id])
                            } else {
                              setSelectedCourses(selectedCourses.filter((id) => id !== course.id))
                            }
                          }}
                        />
                        <label
                          htmlFor={`course-${course.id}`}
                          className="flex-1 cursor-pointer space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{course.title}</p>
                            {course.isActive && (
                              <Badge variant="outline" className="text-xs">Actif</Badge>
                            )}
                          </div>
                          {course.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {selectedCourses.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedCourses.length} cours sélectionné{selectedCourses.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Link href="/admin/utilisateurs">
                <Button type="button" variant="outline" disabled={loading}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Modification..." : "Création..."}
                  </>
                ) : (
                  isEditMode ? "Modifier l'utilisateur" : "Créer l'utilisateur"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEditMode ? "Confirmer la modification" : "Confirmer la création"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEditMode 
                ? "Êtes-vous sûr de vouloir modifier cet utilisateur ? Les modifications seront appliquées immédiatement."
                : "Êtes-vous sûr de vouloir créer cet utilisateur ? Un compte sera créé avec les informations fournies."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Modification..." : "Création..."}
                </>
              ) : (
                isEditMode ? "Confirmer la modification" : "Confirmer la création"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
