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
import { Loader2 } from "lucide-react";
import type { Course } from "./types";

interface DeleteCourseDialogProps {
  course: Course | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCourseDialog({ course, isOpen, isDeleting, onClose, onConfirm }: DeleteCourseDialogProps) {
  if (!course) return null;

  const hasEnrollments = course._count && course._count.enrollments > 0;
  const warning = hasEnrollments
    ? `Ce cours a ${course._count.enrollments} inscription(s) active(s). Êtes-vous sûr de vouloir le supprimer ?`
    : null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            {warning ? (
              <div className="space-y-2">
                <p className="text-destructive font-medium">{warning}</p>
                <p>Cette action est irréversible.</p>
              </div>
            ) : (
              <p>
                Êtes-vous sûr de vouloir supprimer le cours &quot;{course.title}&quot; ? Cette action est
                irréversible.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
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
  );
}
