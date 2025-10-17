"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { UserPlus, Search, Trash2, PenBox, BookOpen } from "lucide-react"
import type { Role } from "@/lib/schemas/user"
import type { UserListItem } from "@/types/user"
import Link from "next/link"
import { BulkUserUpload } from "@/components/admin/bulk-user-upload"
import { CourseEnrollmentDialog } from "@/components/admin/course-enrollment-dialog"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { toast } from "sonner"

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
      } else {
        console.error("[v0] Failed to fetch users:", data.error)
        toast.error("Erreur lors du chargement des utilisateurs")
      }
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      toast.error("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const toggleUserStatus = async (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      })

      if (response.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)))
        toast.success(`Utilisateur ${!user.isActive ? 'activé' : 'désactivé'} avec succès`)
      } else {
        const data = await response.json()
        console.error("[v0] Failed to update user:", data.error)
        toast.error("Erreur lors de la mise à jour du statut")
      }
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      toast.error("Erreur lors de la mise à jour du statut")
    }
  }

  const handleDeleteClick = (user: UserListItem) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const deleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userToDelete.id))
        toast.success("Utilisateur supprimé avec succès")
        setDeleteDialogOpen(false)
        setUserToDelete(null)
      } else {
        const data = await response.json()
        console.error("[v0] Failed to delete user:", data.error)
        toast.error("Erreur lors de la suppression de l'utilisateur")
      }
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
      toast.error("Erreur lors de la suppression de l'utilisateur")
    }
  }

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "default"
      case "SUB_ADMIN":
        return "default"
      case "TRAINER":
        return "secondary"
      case "STUDENT":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur"
      case "SUB_ADMIN":
        return "Sous-administrateur"
      case "TRAINER":
        return "Professeur"
      case "STUDENT":
        return "Étudiant"
      default:
        return role
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>Gérez les comptes étudiants, professeurs et administrateurs</CardDescription>
            </div>
            <div className="flex gap-2">
              <BulkUserUpload onUploadComplete={fetchUsers} />
              <Link href="/admin/utilisateurs/creer">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter un utilisateur
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="ADMIN">Administrateurs</SelectItem>
                <SelectItem value="TRAINER">Professeurs</SelectItem>
                <SelectItem value="STUDENT">Étudiants</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManageCourses(user.id)}
                          className="text-primary hover:text-primary"
                          disabled={!["STUDENT", "TRAINER"].includes(user.role) || user.isActive === false}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          {["STUDENT", "TRAINER"].includes(user.role) ? "Gérer" : "—"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch checked={user.isActive} onCheckedChange={() => toggleUserStatus(user.id)} />
                          <span className="text-sm text-muted-foreground">{user.isActive ? "Actif" : "Inactif"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">

                          <Link href={`/admin/utilisateurs/${user.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-destructive"

                          >
                            <PenBox className="h-4 w-4" />
                          </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Enrollment Dialog */}
      {selectedUserId && (
        <CourseEnrollmentDialog
          userId={selectedUserId}
          open={enrollmentDialogOpen}
          onOpenChange={setEnrollmentDialogOpen}
          onEnrollmentComplete={fetchUsers}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={deleteUser}
        title="Supprimer l'utilisateur"
        itemName={userToDelete ? `l'utilisateur ${userToDelete.name}` : undefined}
      />
    </div>
  )
}
