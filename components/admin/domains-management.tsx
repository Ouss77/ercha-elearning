"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Domain {
  id: number
  name: string
  description: string
  color: string
  coursesCount: number
}

export function DomainsManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Mock domains data
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: 1,
      name: "Informatique",
      description: "Cours de programmation, développement web, bases de données",
      color: "#3b82f6",
      coursesCount: 12,
    },
    {
      id: 2,
      name: "Marketing",
      description: "Marketing digital, stratégies commerciales, communication",
      color: "#10b981",
      coursesCount: 8,
    },
    {
      id: 3,
      name: "Design",
      description: "Design graphique, UX/UI, création visuelle",
      color: "#8b5cf6",
      coursesCount: 6,
    },
    {
      id: 4,
      name: "Gestion",
      description: "Management, leadership, gestion de projet",
      color: "#f59e0b",
      coursesCount: 4,
    },
  ])

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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un domaine
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau domaine</DialogTitle>
                  <DialogDescription>Ajoutez une nouvelle catégorie de cours</DialogDescription>
                </DialogHeader>
                <CreateDomainForm onClose={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => (
              <Card key={domain.id} className="border-border bg-card hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: domain.color }} />
                      <CardTitle className="text-lg">{domain.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">{domain.coursesCount} cours</Badge>
                  </div>
                  <CardDescription className="text-sm">{domain.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateDomainForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating domain:", formData)
    onClose()
  }

  const colorOptions = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16", "#f97316"]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du domaine</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="ex: Informatique"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description du domaine..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Couleur</Label>
        <div className="flex space-x-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? "border-foreground" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">Créer le domaine</Button>
      </div>
    </form>
  )
}
