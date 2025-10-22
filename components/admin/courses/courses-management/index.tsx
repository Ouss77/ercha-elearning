"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookPlus, Search, Loader2, X, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useCourses } from "./use-courses";
import { CourseForm } from "./course-form";
import { CoursesTable } from "./courses-table";
import { DeleteCourseDialog } from "./delete-course-dialog";
import type { Course } from "./types";
import type { CreateCourseInput } from "@/lib/schemas/course";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CoursesManagement() {
  const searchParams = useSearchParams();
  const domainIdParam = searchParams.get("domaine");
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(
    domainIdParam ? parseInt(domainIdParam, 10) : null
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { courses, domains, teachers, isLoading, error, createCourse, updateCourse, deleteCourse, toggleCourseStatus } =
    useCourses();

  // Update selected domain when URL params change
  useEffect(() => {
    if (domainIdParam) {
      setSelectedDomainId(parseInt(domainIdParam, 10));
    }
  }, [domainIdParam]);

  const selectedDomain = domains.find(d => d.id === selectedDomainId);
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  
  const clearDomainFilter = () => {
    setSelectedDomainId(null);
    // Update URL without the domain param
    window.history.pushState({}, '', '/admin/cours');
  };

  const clearAllFilters = () => {
    setSelectedDomainId(null);
    setSelectedTeacherId(null);
    setStatusFilter("all");
    setSearchTerm("");
    window.history.pushState({}, '', '/admin/cours');
  };

  const hasActiveFilters = selectedDomainId !== null || selectedTeacherId !== null || statusFilter !== "all" || searchTerm !== "";

  const handleCreateCourse = async (data: CreateCourseInput) => {
    setIsSubmitting(true);
    try {
      await createCourse(data);
      setIsCreateDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création du cours";
      toast.error(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (data: CreateCourseInput) => {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    try {
      await updateCourse(selectedCourse.id, data);
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du cours";
      toast.error(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    try {
      await deleteCourse(selectedCourse.id);
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression du cours";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Cours</CardTitle>
              <CardDescription>Créez et gérez les cours de la plateforme</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/cours/nouveau">
                <BookPlus className="mr-2 h-4 w-4" />
                Créer un cours
              </Link>
            </Button>

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
                  <DialogDescription>Modifiez les informations du cours</DialogDescription>
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

            <DeleteCourseDialog
              course={selectedCourse}
              isOpen={isDeleteDialogOpen}
              isDeleting={isSubmitting}
              onClose={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCourse(null);
              }}
              onConfirm={handleDeleteCourse}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Active Filters Display */}
          {(selectedDomain || selectedTeacher || statusFilter !== "all") && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedDomain && (
                <Badge variant="secondary" className="text-sm">
                  Domaine: {selectedDomain.name}
                  <button
                    onClick={() => setSelectedDomainId(null)}
                    className="ml-2 hover:text-destructive"
                    aria-label="Supprimer le filtre domaine"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedTeacher && (
                <Badge variant="secondary" className="text-sm">
                  Professeur: {selectedTeacher.name}
                  <button
                    onClick={() => setSelectedTeacherId(null)}
                    className="ml-2 hover:text-destructive"
                    aria-label="Supprimer le filtre professeur"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="text-sm">
                  Statut: {statusFilter === "active" ? "Actif" : "Inactif"}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-2 hover:text-destructive"
                    aria-label="Supprimer le filtre statut"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filtres:</span>
              </div>
              
              <div className="flex flex-wrap gap-3 flex-1">
                <Select
                  value={selectedDomainId?.toString() || "all"}
                  onValueChange={(value) => setSelectedDomainId(value === "all" ? null : parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les domaines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les domaines</SelectItem>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.color }} />
                          {domain.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedTeacherId?.toString() || "all"}
                  onValueChange={(value) => setSelectedTeacherId(value === "all" ? null : parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les professeurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les professeurs</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Effacer tout
                  </Button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement des cours...</span>
            </div>
          ) : (
            <CoursesTable
              courses={courses}
              searchTerm={searchTerm}
              domainFilter={selectedDomainId}
              teacherFilter={selectedTeacherId}
              statusFilter={statusFilter}
              onToggleStatus={toggleCourseStatus}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
