"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Home,
  ArrowLeft,
  Edit,
  BookOpen,
  Users,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  FolderOpen,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { ModuleList } from "@/components/admin/modules/module-list";
import { ModuleForm } from "@/components/admin/modules/module-form";
import type { ModuleWithChapters } from "@/types/module";
import type { ModuleWithChaptersAndContent } from "@/lib/db/module-queries";

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  domainId: number | null;
  teacherId: number | null;
  thumbnailUrl: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CourseStats {
  totalModules: number;
  totalChapters: number;
  totalContent: number;
  totalStudents: number;
  completionRate: number;
}

interface CourseDetailPageProps {
  course: Course;
  modules: ModuleWithChaptersAndContent[];
  userRole: string;
  stats?: CourseStats;
}

export function CourseDetailPage({
  course,
  modules: initialModules,
  userRole,
  stats,
}: CourseDetailPageProps) {
  const router = useRouter();
  
  // State management
  const [modules, setModules] = useState<ModuleWithChapters[]>(initialModules);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleWithChapters | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Module CRUD handlers
  const handleCreateModule = async (data: { title: string; description?: string | null }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create module");
      }
      
      toast.success("Module créé avec succès");
      router.refresh();
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création du module");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditModule = async (data: { title: string; description?: string | null }) => {
    if (!selectedModule) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/modules/${selectedModule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update module");
      }
      
      toast.success("Module mis à jour avec succès");
      router.refresh();
      setIsEditDialogOpen(false);
      setSelectedModule(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour du module");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete module");
      }
      
      toast.success("Module supprimé avec succès");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression du module");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorderModules = async (reorderedModules: ModuleWithChapters[]) => {
    const moduleIds = reorderedModules.map((m) => m.id);
    
    // Optimistic update
    setModules(reorderedModules);
    
    try {
      const response = await fetch(`/api/courses/${course.id}/modules/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleIds }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder modules");
      }
      
      toast.success("Modules réorganisés avec succès");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la réorganisation des modules");
      // Revert to server state on error
      router.refresh();
    }
  };

  const handleManageChapters = (moduleId: number) => {
    router.push(`/admin/cours/${course.id}/modules/${moduleId}/chapters`);
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList className="flex-wrap">
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/cours"
                className="text-xs sm:text-sm"
              >
                Cours
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs sm:text-sm max-w-[150px] sm:max-w-[200px] truncate">
                {course.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-2 w-full sm:w-auto"
        >
          <Link href="/admin/cours">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Retour aux cours</span>
            <span className="sm:hidden">Retour</span>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 sm:p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">
                {course.title}
              </h1>
              <Badge variant={course.isActive ? "default" : "secondary"}>
                {course.isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>
            {course.description && (
              <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
                {course.description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/admin/cours/${course.id}/chapters`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Gérer les chapitres
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/admin/cours/${course.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations du cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </h3>
                <p className="text-sm">
                  {course.description || "Aucune description"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Slug
                  </h3>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {course.slug}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Statut
                  </h3>
                  <Badge variant={course.isActive ? "default" : "secondary"}>
                    {course.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Modules du cours
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {stats?.totalModules ?? 0} module
                    {(stats?.totalModules ?? 0) !== 1 ? "s" : ""} •{" "}
                    {stats?.totalChapters ?? 0} chapitre
                    {(stats?.totalChapters ?? 0) !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  className="w-full sm:w-auto"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-8 px-4 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                  <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium mb-1">
                    Aucun module pour l'instant
                  </p>
                  <p className="text-xs mb-4">
                    Créez votre premier module pour commencer à structurer votre cours
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Créer le premier module
                  </Button>
                </div>
              ) : (
                <ModuleList
                  modules={modules}
                  onReorder={handleReorderModules}
                  onEdit={(module) => {
                    setSelectedModule(module);
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={handleDeleteModule}
                  onManageChapters={handleManageChapters}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.totalStudents ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Étudiants inscrits
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.totalModules ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Module{(stats?.totalModules ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.totalChapters ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chapitre{(stats?.totalChapters ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.totalContent ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Contenus</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.completionRate ?? 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Taux de complétion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Créé le</p>
                  <p className="text-sm font-medium">
                    {formatDate(course.createdAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Dernière modification
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(course.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Module Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau module</DialogTitle>
            <DialogDescription>
              Ajoutez un module pour organiser les chapitres de votre cours
            </DialogDescription>
          </DialogHeader>
          <ModuleForm
            onSubmit={handleCreateModule}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setSelectedModule(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le module</DialogTitle>
            <DialogDescription>
              Mettez à jour le titre et la description du module
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <ModuleForm
              initialData={selectedModule}
              onSubmit={handleEditModule}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedModule(null);
              }}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
