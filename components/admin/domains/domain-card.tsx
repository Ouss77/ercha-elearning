"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Domain } from "./types"

interface DomainCardProps {
  domain: Domain
  onEdit: (domain: Domain) => void
  onDelete: (domain: Domain) => void
  disabled?: boolean
}

export function DomainCard({ domain, onEdit, onDelete, disabled }: DomainCardProps) {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/admin/cours?domaine=${domain.id}`)
  }

  return (
    <Card 
      className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: domain.color }} />
            <CardTitle className="text-lg">{domain.name}</CardTitle>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
            onClick={(e) => {
              e.stopPropagation()
              onEdit(domain)
            }}
            disabled={disabled}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(domain)
            }}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

