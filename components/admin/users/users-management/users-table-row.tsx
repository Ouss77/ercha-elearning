import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Trash2, PenBox, BookOpen } from "lucide-react"
import type { Role } from "@/lib/schemas/user"
import type { UserListItem } from "@/types/user"
import Link from "next/link"

interface UsersTableRowProps {
  user: UserListItem
  onToggleStatus: (userId: number) => void
  onDelete: (user: UserListItem) => void
  onManageCourses: (userId: number) => void
}

const getRoleBadgeVariant = (role: Role) => {
  switch (role) {
    case "ADMIN":
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

export function UsersTableRow({ user, onToggleStatus, onDelete, onManageCourses }: UsersTableRowProps) {
  const canManageCourses = ["STUDENT", "TRAINER"].includes(user.role)

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/utilisateurs/${user.id}/details`}
              className="hover:text-primary hover:underline cursor-pointer"
            >
              {user.name}
            </Link>
            <span
              className={`sm:hidden h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
              title={user.isActive ? 'Actif' : 'Inactif'}
            />
          </div>
          <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs whitespace-nowrap">
          {getRoleLabel(user.role)}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onManageCourses(user.id)}
          className="text-primary hover:text-primary whitespace-nowrap"
          disabled={!canManageCourses || !user.isActive}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          {canManageCourses ? "Gérer" : "—"}
        </Button>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[180px]">
            {user.enrolledCourses.slice(0, 3).map((slug, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {slug.toUpperCase()}
              </Badge>
            ))}
            {user.enrolledCourses.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{user.enrolledCourses.length - 3}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">
            {canManageCourses ? "Aucun cours" : "—"}
          </span>
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center space-x-2">
          <Switch checked={user.isActive} onCheckedChange={() => onToggleStatus(user.id)} />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {user.isActive ? "Actif" : "Inactif"}
          </span>
        </div>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/utilisateurs/${user.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary"
              title="Modifier"
            >
              <PenBox className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(user)}
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageCourses(user.id)}
            className="lg:hidden text-primary hover:text-primary"
            disabled={!canManageCourses || !user.isActive}
            title="Gérer les cours"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
