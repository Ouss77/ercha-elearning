"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import type { UserListItem } from "@/types/user"
import Link from "next/link"
import { BulkUserUpload, CourseEnrollmentDialog } from "@/components/admin/shared"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { useUsers } from "./use-users"
import { UsersFilters } from "./users-filters"
import { UsersTable } from "./users-table"

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null)

  const { users, loading, fetchUsers, toggleUserStatus, deleteUser } = useUsers()

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = selectedRole === "all" || user.role === selectedRole
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, selectedRole])

  const handleDeleteClick = (user: UserListItem) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    const success = await deleteUser(userToDelete.id)
    if (success) {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleManageCourses = (userId: number) => {
    setSelectedUserId(userId)
    setEnrollmentDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>Gérez les comptes étudiants, professeurs et administrateurs</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 place-content-end">
              <BulkUserUpload onUploadComplete={fetchUsers} />
              <Link href="/admin/utilisateurs/creer" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter un utilisateur
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UsersFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />
          <UsersTable
            users={filteredUsers}
            loading={loading}
            onToggleStatus={toggleUserStatus}
            onDelete={handleDeleteClick}
            onManageCourses={handleManageCourses}
          />
        </CardContent>
      </Card>

      {selectedUserId && (
        <CourseEnrollmentDialog
          userId={selectedUserId}
          open={enrollmentDialogOpen}
          onOpenChange={setEnrollmentDialogOpen}
          onEnrollmentComplete={fetchUsers}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'utilisateur"
        itemName={userToDelete ? `l'utilisateur ${userToDelete.name}` : undefined}
      />
    </div>
  )
}
