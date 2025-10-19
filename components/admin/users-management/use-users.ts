import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { UserListItem } from "@/types/user"

export function useUsers() {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)

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

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId))
        toast.success("Utilisateur supprimé avec succès")
        return true
      } else {
        const data = await response.json()
        console.error("[v0] Failed to delete user:", data.error)
        toast.error("Erreur lors de la suppression de l'utilisateur")
        return false
      }
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
      toast.error("Erreur lors de la suppression de l'utilisateur")
      return false
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    fetchUsers,
    toggleUserStatus,
    deleteUser,
  }
}
