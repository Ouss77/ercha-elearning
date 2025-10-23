"use client";

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
import { AlertTriangle } from "lucide-react";

interface RemoveCourseDialogProps {
  course: {
    id: number;
    title: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RemoveCourseDialog({
  course,
  open,
  onOpenChange,
  onConfirm,
}: RemoveCourseDialogProps) {
  if (!course) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Retirer le cours
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir retirer le cours <span className="font-semibold">&quot;{course.title}&quot;</span> de cette classe ?
              </p>
              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Note :</strong> Les étudiants garderont leurs inscriptions individuelles à ce cours. Seul le lien avec cette classe sera supprimé.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Retirer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
