"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Users,
  Plus,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

interface StudentData {
  studentId: number;
  studentName: string | null;
  studentEmail: string | null;
  studentAvatarUrl: string | null;
  studentPhone: string | null;
  studentCity: string | null;
  courseId: number;
  courseTitle: string;
  courseThumbnailUrl: string | null;
  domainId: number | null;
  domainName: string | null;
  domainColor: string | null;
  enrolledAt: Date | null;
  completedAt: Date | null;
  lastActivityDate: Date | null;
  chaptersCompleted: number;
  totalChapters: number;
  progress: number;
  averageQuizScore: number;
  quizzesCompleted: number;
  status: "active" | "inactive" | "struggling";
}

interface ClassData {
  id: number;
  name: string;
  description: string | null;
  domainId: number | null;
  domainName: string | null;
  domainColor: string | null;
  isActive: boolean | null;
  maxStudents: number | null;
  createdAt: Date | null;
  studentCount: number;
}

interface StudentProgressProps {
  students: StudentData[];
  classes: ClassData[];
  teacherId: number;
}

export function StudentProgress({
  students,
  classes,
  teacherId,
}: StudentProgressProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [newClassMaxStudents, setNewClassMaxStudents] = useState("");

  const uniqueCourses = Array.from(
    new Map(
      students.map((s) => [
        s.courseId,
        { id: s.courseId, title: s.courseTitle },
      ])
    ).values()
  );

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      selectedCourse === "all" || student.courseId === parseInt(selectedCourse);

    const matchesStatus =
      selectedStatus === "all" || student.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    struggling: students.filter((s) => s.status === "struggling").length,
    inactive: students.filter((s) => s.status === "inactive").length,
    avgProgress:
      students.length > 0
        ? Math.round(
            students.reduce((sum, s) => sum + s.progress, 0) / students.length
          )
        : 0,
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Actif</Badge>;
      case "struggling":
        return <Badge className="bg-yellow-500">En difficulté</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactif</Badge>;
      default:
        return null;
    }
  };

  const getTrendIcon = (progress: number) => {
    if (progress >= 70)
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (progress >= 40) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error("Le nom de la classe est requis");
      return;
    }

    try {
      const response = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClassName,
          description: newClassDescription,
          maxStudents: newClassMaxStudents
            ? parseInt(newClassMaxStudents)
            : null,
        }),
      });

      if (response.ok) {
        toast.success("Classe créée avec succès");
        setIsCreateClassOpen(false);
        setNewClassName("");
        setNewClassDescription("");
        setNewClassMaxStudents("");
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la création");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Étudiants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En difficulté</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.struggling}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progrès Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Étudiants ({students.length})
          </TabsTrigger>
          <TabsTrigger value="classes">
            <Users className="h-4 w-4 mr-2" />
            Classes ({classes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Liste des Étudiants</CardTitle>
                  <CardDescription>
                    Tous les étudiants inscrits à vos cours
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email ou cours..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Tous les cours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les cours</SelectItem>
                    {uniqueCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="struggling">En difficulté</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Étudiant</TableHead>
                      <TableHead>Cours</TableHead>
                      <TableHead>Progression</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière activité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Aucun étudiant trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow
                          key={`${student.studentId}-${student.courseId}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={student.studentAvatarUrl || ""}
                                  alt={student.studentName || ""}
                                />
                                <AvatarFallback>
                                  {getInitials(student.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {student.studentName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {student.studentEmail}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-sm">
                                {student.courseTitle}
                              </p>
                              {student.domainName && (
                                <Badge
                                  variant="outline"
                                  style={{
                                    borderColor:
                                      student.domainColor || "#6366f1",
                                    color: student.domainColor || "#6366f1",
                                  }}
                                  className="text-xs"
                                >
                                  {student.domainName}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getTrendIcon(student.progress)}
                                <span className="text-sm font-medium">
                                  {student.progress}%
                                </span>
                              </div>
                              <Progress
                                value={student.progress}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                {student.chaptersCompleted}/
                                {student.totalChapters} chapitres
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {student.averageQuizScore}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.quizzesCompleted} quiz
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.status)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(student.lastActivityDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Gestion des Classes</CardTitle>
                  <CardDescription>
                    Créez et gérez vos classes d'étudiants
                  </CardDescription>
                </div>
                <Dialog
                  open={isCreateClassOpen}
                  onOpenChange={setIsCreateClassOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une classe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une nouvelle classe</DialogTitle>
                      <DialogDescription>
                        Créez une classe pour regrouper vos étudiants
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom de la classe *</Label>
                        <Input
                          id="name"
                          placeholder="Ex: Promotion 2025 - React"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Description de la classe..."
                          value={newClassDescription}
                          onChange={(e) =>
                            setNewClassDescription(e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxStudents">
                          Nombre maximum d'étudiants
                        </Label>
                        <Input
                          id="maxStudents"
                          type="number"
                          placeholder="Ex: 30"
                          value={newClassMaxStudents}
                          onChange={(e) =>
                            setNewClassMaxStudents(e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateClassOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button onClick={handleCreateClass}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucune classe créée
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Créez votre première classe pour organiser vos étudiants
                  </p>
                  <Button onClick={() => setIsCreateClassOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une classe
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((classItem) => (
                    <Card key={classItem.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {classItem.name}
                            </CardTitle>
                            {classItem.domainName && (
                              <Badge
                                style={{
                                  backgroundColor:
                                    classItem.domainColor || "#6366f1",
                                  color: "white",
                                }}
                                className="text-xs"
                              >
                                {classItem.domainName}
                              </Badge>
                            )}
                          </div>
                          <Badge
                            variant={
                              classItem.isActive ? "default" : "secondary"
                            }
                          >
                            {classItem.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {classItem.description && (
                          <p className="text-sm text-muted-foreground">
                            {classItem.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {classItem.studentCount}
                              {classItem.maxStudents
                                ? ` / ${classItem.maxStudents}`
                                : ""}{" "}
                              étudiants
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
