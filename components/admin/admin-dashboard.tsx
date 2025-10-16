"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersManagement } from "./users-management"
import { CoursesManagement } from "./courses-management"
import { DomainsManagement } from "./domains-management"
import { Users, BookOpen, BarChart3, UserPlus, BookPlus, TrendingUp, Activity } from "lucide-react"
import type { User } from "@/lib/auth/auth"

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - replace with real data from database
  const stats = {
    totalUsers: 156,
    totalStudents: 120,
    totalTeachers: 15,
    totalCourses: 24,
    activeCourses: 18,
    totalDomains: 4,
    completionRate: 78,
  }

  return (
    <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="courses">Cours</TabsTrigger>
            <TabsTrigger value="domains">Domaines</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalStudents} étudiants, {stats.totalTeachers} professeurs
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cours Actifs</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCourses}</div>
                  <p className="text-xs text-muted-foreground">sur {stats.totalCourses} cours créés</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Domaines</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDomains}</div>
                  <p className="text-xs text-muted-foreground">catégories de cours</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">moyenne générale</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>Gérez votre plateforme efficacement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button
                    onClick={() => setActiveTab("users")}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <UserPlus className="h-6 w-6" />
                    <span>Ajouter un utilisateur</span>
                  </Button>

                  <Button
                    onClick={() => setActiveTab("courses")}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <BookPlus className="h-6 w-6" />
                    <span>Créer un cours</span>
                  </Button>

                  <Button
                    onClick={() => setActiveTab("domains")}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span>Gérer les domaines</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>Dernières actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nouvel étudiant inscrit</p>
                      <p className="text-xs text-muted-foreground">Marie Dupont - il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Cours "React Avancé" publié</p>
                      <p className="text-xs text-muted-foreground">Prof. Martin - il y a 5 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quiz complété</p>
                      <p className="text-xs text-muted-foreground">Pierre Bernard - il y a 1 jour</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="courses">
            <CoursesManagement />
          </TabsContent>

          <TabsContent value="domains">
            <DomainsManagement />
          </TabsContent>
        </Tabs>
    </div>
  )
}
