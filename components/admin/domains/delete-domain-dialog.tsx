import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import type { Domain } from "./types"

interface DeleteDomainDialogProps {
  domain: Domain | null
  isDeleting: boolean
  onConfirm: (id: number) => void
  onClose: () => void
}

export function DeleteDomainDialog({ domain: domainToDelete, isDeleting, onConfirm, onClose }: DeleteDomainDialogProps) {
  if (!domainToDelete) return null

  const hasActiveCourses = domainToDelete.coursesCount && domainToDelete.coursesCount > 0

  return (
    <AlertDialog open={!!domainToDelete} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le domaine <strong>{domainToDelete.name}</strong> ?
            {hasActiveCourses ? (
              <span className="block mt-2 text-destructive font-medium">
                ⚠️ Ce domaine contient {domainToDelete.coursesCount} cours. Vous ne pouvez pas le supprimer.
              </span>
            ) : (
              <span className="block mt-2">
                Cette action est irréversible.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(domainToDelete.id)}
            disabled={isDeleting || hasActiveCourses || false}
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
  )
}
