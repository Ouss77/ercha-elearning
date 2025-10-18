"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { BookPlus, Search, Edit, Trash2, Eye, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createCourseSchema, type CreateCourseInput } from "@/lib/schemas/course";

interface Domain {
  id: number;
  name: string;
  color: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  domainId: number | null;
  teacherId: number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  domain?: Domain;
  teacher?: Teacher;
  _count?: {
    enrollments: number;
    chapters: number;
  };
}

interface CourseFormProps {
  domains: Domain[];
  teachers: Teacher[];
  initialData?: Partial<Course>;
  onSubmit: (data: CreateCourseInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function CourseForm({ domains, teachers, initialData, onSubmit, onCancel, isSubmitting }: CourseFormProps) {
  const [formData, setFormData] = useState<Partial<CreateCourseInput>>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    domainId: initialData?.domainId || undefined,
    teacherId: initialData?.teacherId || undefined,
    thumbnailUrl: initialData?.thumbnailUrl || "",
    isActive: initialData?.isActive ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      const validatedData = createCourseSchema.parse({
        ...formData,
        description: formData.description || null,
        thumbnailUrl: formData.thumbnailUrl || null,
        teacherId: formData.teacherId || null,
      });

      await onSubmit(validatedData);
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Erreur de validation");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Titre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Titre du cours"
          disabled={isSubmitting}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description du cours"
          rows={3}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="domainId">
            Domaine <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.domainId?.toString()}
            onValueChange={(value) => setFormData({ ...formData, domainId: parseInt(value) })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un domaine" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.id.toString()}>
                  {domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.domainId && <p className="text-sm text-destructive">{errors.domainId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacherId">Formateur</Label>
          <Select
            value={formData.teacherId?.toString() || "none"}
            onValueChange={(value) =>
              setFormData({ ...formData, teacherId: value === "none" ? null : parseInt(value) })
            }
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un formateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Non assigné</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teacherId && <p className="text-sm text-destructive">{errors.teacherId}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">URL de l'image</Label>
        <Input
          id="thumbnailUrl"
          value={formData.thumbnailUrl || ""}
          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
          disabled={isSubmitting}
        />
        {errors.thumbnailUrl && <p className="text-sm text-destructive">{errors.thumbnailUrl}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          disabled={isSubmitting}
        />
        <Label htmlFor="isActive">Cours actif</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            initialData ? "Mettre à jour" : "Créer"
          )}
        </Button>
      </div>
    </form>
  );
}

export function CoursesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        throw new Error("Échec du chargement des cours");
      }
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des cours";
      setError(message);
      toast.error(message);
    }
  };

  // Fetch domains from API
  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/domains");
      if (!response.ok) {
        throw new Error("Échec du chargement des domaines");
      }
      const data = await response.json();
      setDomains(data.domains || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des domaines";
      toast.error(message);
    }
  };

  // Fetch teachers (users with TRAINER role) from API
  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/users?role=TRAINER");
      if (!response.ok) {
        throw new Error("Échec du chargement des formateurs");
      }
      const data = await response.json();
      setTeachers(data.users || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des formateurs";
      toast.error(message);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchCourses(), fetchDomains(), fetchTeachers()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Handle course creation
  const handleCreateCourse = async (data: CreateCourseInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la création du cours");
      }

      toast.success("Cours créé avec succès");
      setIsCreateDialogOpen(false);
      await fetchCourses(); // Refresh course list
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création du cours";
      toast.error(message);
      throw err; // Re-throw to let form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle course update
  const handleUpdateCourse = async (data: CreateCourseInput) => {
    if (!selectedCourse) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la mise à jour du cours");
      }

      toast.success("Cours mis à jour avec succès");
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      await fetchCourses(); // Refresh course list
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du cours";
      toast.error(message);
      throw err; // Re-throw to let form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setDeleteWarning(null);
    
    // Check if course has enrollments
    if (course._count && course._count.enrollments > 0) {
      setDeleteWarning(
        `Ce cours a ${course._count.enrollments} inscription(s) active(s). Êtes-vous sûr de vouloir le supprimer ?`
      );
    }
    
    setIsDeleteDialogOpen(true);
  };

  // Handle course deletion
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la suppression du cours");
      }

      toast.success("Cours supprimé avec succès");
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
      setDeleteWarning(null);
      await fetchCourses(); // Refresh course list
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression du cours";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (course.domain?.name.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (course.teacher?.name.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const toggleCourseStatus = async (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const newStatus = !course.isActive;

    // Optimistic UI update
    setCourses(
      courses.map((c) =>
        c.id === courseId ? { ...c, isActive: newStatus } : c
      )
    );

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        // Revert on error
        setCourses(
          courses.map((c) =>
            c.id === courseId ? { ...c, isActive: !newStatus } : c
          )
        );
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la mise à jour du statut");
      }

      toast.success(
        newStatus
          ? "Cours activé avec succès"
          : "Cours désactivé avec succès"
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du statut";
      toast.error(message);
      // Revert UI change on error
      setCourses(
        courses.map((c) =>
          c.id === courseId ? { ...c, isActive: !newStatus } : c
        )
      );
    }
  };

  const getDomainColorClass = (color: string) => {
    // Convert hex color to Tailwind classes
    const colorMap: Record<string, string> = {
      "#3B82F6": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "#10B981": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "#8B5CF6": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "#F59E0B": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      "#EF4444": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Cours</CardTitle>
              <CardDescription>
                Créez et gérez les cours de la plateforme
              </CardDescription>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <BookPlus className="mr-2 h-4 w-4" />
                  Créer un cours
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau cours</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouveau cours à la plateforme
                  </DialogDescription>
                </DialogHeader>
                <CourseForm
                  domains={domains}
                  teachers={teachers}
                  onSubmit={handleCreateCourse}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
              open={isEditDialogOpen}
              onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) setSelectedCourse(null);
              }}
            >
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Modifier le cours</DialogTitle>
                  <DialogDescription>
                    Modifiez les informations du cours
                  </DialogDescription>
                </DialogHeader>
                {selectedCourse && (
                  <CourseForm
                    domains={domains}
                    teachers={teachers}
                    initialData={selectedCourse}
                    onSubmit={handleUpdateCourse}
                    onCancel={() => {
                      setIsEditDialogOpen(false);
                      setSelectedCourse(null);
                    }}
                    isSubmitting={isSubmitting}
                  />
                )}
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) {
                  setSelectedCourse(null);
                  setDeleteWarning(null);
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    {deleteWarning ? (
                      <div className="space-y-2">
                        <p className="text-destructive font-medium">{deleteWarning}</p>
                        <p>Cette action est irréversible.</p>
                      </div>
                    ) : (
                      <p>
                        Êtes-vous sûr de vouloir supprimer le cours &quot;{selectedCourse?.title}&quot; ?
                        Cette action est irréversible.
                      </p>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteCourse();
                    }}
                    disabled={isSubmitting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      "Supprimer"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement des cours...</span>
            </div>
          ) : (
            /* Courses Table */
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
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "Aucun cours trouvé" : "Aucun cours disponible"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {course.description || "Pas de description"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {course.domain ? (
                            <Badge className={getDomainColorClass(course.domain.color)}>
                              {course.domain.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Non assigné</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {course.teacher?.name || "Non assigné"}
                        </TableCell>
                        <TableCell>{course._count?.enrollments || 0}</TableCell>
                        <TableCell>{course._count?.chapters || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={course.isActive}
                              onCheckedChange={() => toggleCourseStatus(course.id)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {course.isActive ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" asChild title="Gérer les chapitres">
                              <Link href={`/admin/cours/${course.id}/chapters`}>
                                <BookOpen className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" title="Voir le cours">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(course)}
                              title="Modifier le cours"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(course)}
                              title="Supprimer le cours"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
