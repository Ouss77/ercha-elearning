"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCourseSchema, type CreateCourseInput } from "@/lib/schemas/course";
import type { Domain, Teacher, Course } from "./types";

interface CourseFormProps {
  domains: Domain[];
  teachers: Teacher[];
  initialData?: Partial<Course>;
  onSubmit: (data: CreateCourseInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CourseForm({ domains, teachers, initialData, onSubmit, onCancel, isSubmitting }: CourseFormProps) {
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
      const validatedData = createCourseSchema.parse({
        ...formData,
        description: formData.description?.trim() || null,
        thumbnailUrl: formData.thumbnailUrl?.trim() || null,
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
