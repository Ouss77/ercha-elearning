import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import type { Domain } from "./types"

interface DomainCardProps {
  domain: Domain
  onEdit: (domain: Domain) => void
  onDelete: (domain: Domain) => void
  disabled?: boolean
}

export function DomainCard({ domain, onEdit, onDelete, disabled }: DomainCardProps) {
  return (
    <Card className="border-border bg-card hover:bg-accent/50 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: domain.color }} />
            <CardTitle className="text-lg">{domain.name}</CardTitle>
          </div>
          <Badge variant="secondary">{domain.coursesCount || 0} cours</Badge>
        </div>
        <CardDescription className="text-sm">{domain.description || "Aucune description"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(domain)}
            disabled={disabled}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(domain)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

