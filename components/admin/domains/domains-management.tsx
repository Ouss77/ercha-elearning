"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useDomains } from "./use-domains"
import { DomainForm } from "./domain-form"
import { DomainCard } from "./domain-card"
import { DomainLoadingSkeleton } from "./domain-loading-skeleton"
import { DomainEmptyState } from "./domain-empty-state"
import { DeleteDomainDialog } from "./delete-domain-dialog"
import type { Domain } from "./types"

export function DomainsManagement() {
  const {
    domains,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createDomain,
    updateDomain,
    deleteDomain,
  } = useDomains()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null)

  const handleCreate = async (data: any) => {
    await createDomain(data)
    setIsCreateDialogOpen(false)
  }

  const handleUpdate = async (data: any) => {
    if (editingDomain) {
      await updateDomain(editingDomain.id, data)
      setEditingDomain(null)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteDomain(id)
    setDeletingDomain(null)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Domaines</CardTitle>
              <CardDescription>Organisez vos cours par catégories</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un domaine
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau domaine</DialogTitle>
                  <DialogDescription>Ajoutez une nouvelle catégorie de cours</DialogDescription>
                </DialogHeader>
                <DomainForm 
                  onSubmit={handleCreate}
                  onClose={() => setIsCreateDialogOpen(false)}
                  isSubmitting={isCreating}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DomainLoadingSkeleton />
          ) : domains.length === 0 ? (
            <DomainEmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => (
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  onEdit={setEditingDomain}
                  onDelete={setDeletingDomain}
                  disabled={isUpdating || isDeleting}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Domain Dialog */}
      {editingDomain && (
        <Dialog open={!!editingDomain} onOpenChange={(open) => !open && setEditingDomain(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le domaine</DialogTitle>
              <DialogDescription>Modifiez les informations du domaine</DialogDescription>
            </DialogHeader>
            <DomainForm 
              initialData={{
                name: editingDomain.name,
                description: editingDomain.description || "",
                color: editingDomain.color,
              }}
              onSubmit={handleUpdate}
              onClose={() => setEditingDomain(null)}
              isSubmitting={isUpdating}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm Dialog */}
      <DeleteDomainDialog
        domain={deletingDomain}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeletingDomain(null)}
      />
    </div>
  )
}
