"use client";

import { useState } from "react";
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
import { BookPlus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useCourses } from "./use-courses";
import { CourseForm } from "./course-form";
import { CoursesTable } from "./courses-table";
import { DeleteCourseDialog } from "./delete-course-dialog";
import type { Course } from "./types";
import type { CreateCourseInput } from "@/lib/schemas/course";

export function CoursesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { courses, domains, teachers, isLoading, error, createCourse, updateCourse, deleteCourse, toggleCourseStatus } =
    useCourses();

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
