import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { UserListItem } from "@/types/user"
import { UsersTableRow } from "./users-table-row"

interface UsersTableProps {
  users: UserListItem[]
  loading: boolean
  onToggleStatus: (userId: number) => void
  onDelete: (user: UserListItem) => void
  onManageCourses: (userId: number) => void
}

export function UsersTable({ users, loading, onToggleStatus, onDelete, onManageCourses }: UsersTableProps) {
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement...</div>
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Utilisateur</TableHead>
              <TableHead className="hidden md:table-cell min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Rôle</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[100px]">Cours</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[200px]">Cours inscrits</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[120px]">Statut</TableHead>
              <TableHead className="hidden xl:table-cell min-w-[120px]">Date d'inscription</TableHead>
              <TableHead className="text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UsersTableRow
                key={user.id}
                user={user}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                onManageCourses={onManageCourses}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
