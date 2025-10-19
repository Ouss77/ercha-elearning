import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface UsersFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedRole: string
  onRoleChange: (value: string) => void
}

export function UsersFilters({ searchTerm, onSearchChange, selectedRole, onRoleChange }: UsersFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={selectedRole} onValueChange={onRoleChange}>
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
  )
}
