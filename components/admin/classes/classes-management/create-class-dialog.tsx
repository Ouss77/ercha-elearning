"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateClassDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateClassDialogProps) {
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teacherId: "",
    domainId: "",
  });

  useEffect(() => {
    if (open) {
      fetchDomains();
      fetchTeachers();
    }
  }, [open]);

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/domains");
      const data = await response.json();
      if (response.ok) {
        setDomains(data.domains || []);
      }
    } catch (error) {
      console.error("Error fetching domains:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/users?role=TRAINER");
      const data = await response.json();
      if (response.ok) {
        setTeachers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Le nom de la classe est requis");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          teacherId: formData.teacherId ? parseInt(formData.teacherId) : undefined,
          domainId: formData.domainId ? parseInt(formData.domainId) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Classe créée avec succès");
        setFormData({
          name: "",
          description: "",
          teacherId: "",
          domainId: "",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to create class");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer une Nouvelle Classe</DialogTitle>
          <DialogDescription>
            Créez une classe pour regrouper des étudiants et leur assigner des cours
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom de la Classe <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Développement Web 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Description de la classe..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teacherId">Formateur</Label>
              <Select
                value={formData.teacherId}
                onValueChange={(value) =>
                  setFormData({ ...formData, teacherId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="domainId">Domaine</Label>
              <Select
                value={formData.domainId}
                onValueChange={(value) =>
                  setFormData({ ...formData, domainId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un domaine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun domaine</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id.toString()}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer la Classe
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
