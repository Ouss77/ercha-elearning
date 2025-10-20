"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, ArrowLeft, Save, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createCourseSchema, type CreateCourseInput } from "@/lib/schemas/course";

interface Domain {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  domainId: number | null;
  teacherId: number | null;
  thumbnailUrl: string | null;
  isActive: boolean | null;
}

interface CourseFormPageProps {
  domains: Domain[];
  teachers: Teacher[];
  initialData?: Course;
  userRole: string;
  userId: number;
}

export function CourseFormPage({
  domains,
  teachers,
  initialData,
  userRole,
  userId,
}: CourseFormPageProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<Partial<CreateCourseInput>>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    domainId: initialData?.domainId || undefined,
    teacherId: initialData?.teacherId || (userRole === "TRAINER" ? userId : undefined),
    thumbnailUrl: initialData?.thumbnailUrl || "",
    isActive: initialData?.isActive ?? false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validatedData = createCourseSchema.parse({
        ...formData,
        description: formData.description || null,
        thumbnailUrl: formData.thumbnailUrl || null,
        teacherId: formData.teacherId || null,
      });

      const url = isEditing ? `/api/courses/${initialData.id}` : "/api/courses";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      const result = await response.json();
      toast.success(isEditing ? "Cours modifié avec succès" : "Cours créé avec succès");
      
      router.push(`/admin/cours/${result.course.id}`);
      router.refresh();
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
        toast.error(error.message || "Une erreur est survenue");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      router.push(`/admin/cours/${initialData.id}`);
    } else {
      router.push("/admin/cours");
    }
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
              <BreadcrumbLink href="/admin/cours" className="text-xs sm:text-sm">
                Cours
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs sm:text-sm">
                {isEditing ? "Modifier" : "Nouveau cours"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Retour</span>
          <span className="sm:hidden">Retour</span>
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 sm:p-6 rounded-lg border">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {isEditing ? "Modifier le cours" : "Créer un nouveau cours"}
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              {isEditing
                ? "Modifiez les informations de votre cours"
                : "Remplissez les informations pour créer un nouveau cours"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Les informations de base de votre cours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Titre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Introduction au Design Graphique"
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Décrivez votre cours..."
                    rows={5}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">URL de l'image</Label>
                  <Input
                    id="thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnailUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className={errors.thumbnailUrl ? "border-destructive" : ""}
                  />
                  {errors.thumbnailUrl && (
                    <p className="text-sm text-destructive">{errors.thumbnailUrl}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditing ? "Modification..." : "Création..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? "Enregistrer les modifications" : "Créer le cours"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paramètres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domainId">
                    Domaine <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.domainId?.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, domainId: parseInt(value) })
                    }
                  >
                    <SelectTrigger
                      id="domainId"
                      className={errors.domainId ? "border-destructive" : ""}
                    >
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
                  {errors.domainId && (
                    <p className="text-sm text-destructive">{errors.domainId}</p>
                  )}
                </div>

                {userRole === "ADMIN" && (
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Formateur</Label>
                    <Select
                      value={formData.teacherId?.toString() || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          teacherId: value === "none" ? null : parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger id="teacherId">
                        <SelectValue placeholder="Sélectionner un formateur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun formateur</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between space-x-2 pt-2">
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Cours actif
                  </Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </form>
    </div>
  );
}
