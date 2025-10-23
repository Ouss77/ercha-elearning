"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteClassDialogProps {
  classItem: {
    id: number;
    name: string;
    studentCount: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (unenrollStudents: boolean) => void;
  isDeleting?: boolean;
}

export function DeleteClassDialog({
  classItem,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteClassDialogProps) {
  const [unenrollStudents, setUnenrollStudents] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && classItem) {
      fetchEnrollmentCount();
      setUnenrollStudents(false);
    }
  }, [open, classItem?.id]);

  const fetchEnrollmentCount = async () => {
    if (!classItem) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/classes/${classItem.id}/enrollment-count`);
      if (response.ok) {
        const data = await response.json();
        setEnrollmentCount(data.enrollmentCount || 0);
      }
    } catch (error) {
      console.error("Error fetching enrollment count:", error);
      // Fallback to 0 if we can't fetch
      setEnrollmentCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (!classItem) return null;

  const hasStudents = classItem.studentCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Êtes-vous sûr de vouloir supprimer la classe <span className="font-semibold">&quot;{classItem.name}&quot;</span> ?
              </p>
              
              {hasStudents && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-destructive">
                        Cette classe contient {classItem.studentCount} étudiant(s)
                      </p>
                      {loading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Vérification des inscriptions aux cours...</span>
                        </div>
                      ) : enrollmentCount !== null && enrollmentCount > 0 ? (
                        <p className="text-muted-foreground">
                          Il y a {enrollmentCount} inscription(s) active(s) aux cours pour les étudiants de cette classe.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {!loading && enrollmentCount !== null && enrollmentCount > 0 && (
                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="unenroll"
                        checked={unenrollStudents}
                        onCheckedChange={(checked) => setUnenrollStudents(checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="unenroll"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Désinscrire les étudiants de tous les cours de cette classe
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Si non coché, les inscriptions aux cours seront conservées même après la suppression de la classe.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Cette action est irréversible et supprimera définitivement la classe.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(unenrollStudents)}
            disabled={isDeleting || loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer la classe"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
