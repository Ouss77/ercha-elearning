"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Users, BookOpen, BarChart3, FileText, UserPlus, TrendingUp, Clock } from "lucide-react"
import type { User } from "@/lib/auth"

interface SubAdminDashboardProps {
  user: User
}

interface Enrollment {
  id: number
  studentName: string
  courseName: string
  enrolledDate: string
  status: "active" | "completed" | "pending"
}

interface Absence {
  id: number
  studentName: string
  date: string
  reason: string
  status: "justified" | "unjustified"
}

interface Note {
  id: number
  studentName: string
  content: string
  createdAt: string
  author: string
}

export function SubAdminDashboard({ user }: SubAdminDashboardProps) {
  // Mock data - replace with real data from database
  const stats = {
    totalStudents: 45,
    activeEnrollments: 38,
    completionRate: 76,
    pendingAbsences: 3,
  }

  const [recentEnrollments] = useState<Enrollment[]>([
    {
      id: 1,
      studentName: "Marie Dupont",
      courseName: "Introduction à React",
      enrolledDate: "2025-01-15",
      status: "active",
    },
    {
      id: 2,
      studentName: "Pierre Bernard",
      courseName: "Marketing Digital",
      enrolledDate: "2025-01-14",
      status: "active",
    },
    {
      id: 3,
      studentName: "Sophie Martin",
      courseName: "Design UX/UI",
      enrolledDate: "2025-01-13",
      status: "pending",
    },
  ])

  const [absences] = useState<Absence[]>([
    {
      id: 1,
      studentName: "Jean Dubois",
      date: "2025-01-15",
      reason: "Maladie",
      status: "justified",
    },
    {
      id: 2,
      studentName: "Claire Petit",
      date: "2025-01-14",
      reason: "Non spécifié",
      status: "unjustified",
    },
    {
      id: 3,
      studentName: "Marc Leroy",
      date: "2025-01-13",
      reason: "Rendez-vous médical",
      status: "justified",
    },
  ])

  const [notes] = useState<Note[]>([
    {
      id: 1,
      studentName: "Marie Dupont",
      content: "Excellente participation en classe. Montre un grand intérêt pour le sujet.",
      createdAt: "2025-01-15",
      author: user.name,
    },
    {
      id: 2,
      studentName: "Pierre Bernard",
      content: "Besoin d'un suivi supplémentaire sur les concepts avancés.",
      createdAt: "2025-01-14",
      author: user.name,
    },
  ])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">dans votre établissement</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions Actives</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">cours en cours</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">moyenne locale</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absences en Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAbsences}</div>
            <p className="text-xs text-muted-foreground">à traiter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Manual Enrollment Form */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>Inscription Manuelle</span>
            </CardTitle>
            <CardDescription>Inscrire un étudiant à un cours</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Étudiant</Label>
                <Select>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Sélectionner un étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Marie Dupont</SelectItem>
                    <SelectItem value="2">Pierre Bernard</SelectItem>
                    <SelectItem value="3">Sophie Martin</SelectItem>
                    <SelectItem value="4">Jean Dubois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Cours</Label>
                <Select>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Sélectionner un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Introduction à React</SelectItem>
                    <SelectItem value="2">Marketing Digital Avancé</SelectItem>
                    <SelectItem value="3">Design UX/UI Moderne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ajouter des notes sur cette inscription..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Inscrire l'étudiant
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Local Analytics */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Analyses Locales</span>
            </CardTitle>
            <CardDescription>Statistiques de votre établissement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Introduction à React</p>
                  <p className="text-sm text-muted-foreground">15 étudiants inscrits</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">72%</p>
                  <p className="text-xs text-muted-foreground">progression</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Marketing Digital</p>
                  <p className="text-sm text-muted-foreground">12 étudiants inscrits</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">85%</p>
                  <p className="text-xs text-muted-foreground">progression</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Design UX/UI</p>
                  <p className="text-sm text-muted-foreground">11 étudiants inscrits</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">68%</p>
                  <p className="text-xs text-muted-foreground">progression</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Absence Tracking */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Suivi des Absences</CardTitle>
          <CardDescription>Gérer les absences des étudiants</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absences.map((absence) => (
                <TableRow key={absence.id}>
                  <TableCell className="font-medium">{absence.studentName}</TableCell>
                  <TableCell>{new Date(absence.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>{absence.reason}</TableCell>
                  <TableCell>
                    <Badge variant={absence.status === "justified" ? "default" : "destructive"}>
                      {absence.status === "justified" ? "Justifiée" : "Non justifiée"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes Management */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Gestion des Notes</span>
          </CardTitle>
          <CardDescription>Notes et observations sur les étudiants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="p-4 rounded-lg bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{note.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{note.content}</p>
                <p className="text-xs text-muted-foreground">Par: {note.author}</p>
              </div>
            ))}

            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Ajouter une note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Enrollments */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Inscriptions Récentes</CardTitle>
          <CardDescription>Dernières inscriptions dans votre établissement</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{enrollment.studentName}</TableCell>
                  <TableCell>{enrollment.courseName}</TableCell>
                  <TableCell>{new Date(enrollment.enrolledDate).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        enrollment.status === "active"
                          ? "default"
                          : enrollment.status === "completed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {enrollment.status === "active"
                        ? "Actif"
                        : enrollment.status === "completed"
                          ? "Terminé"
                          : "En attente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
