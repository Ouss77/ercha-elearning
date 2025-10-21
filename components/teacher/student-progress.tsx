"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Users,
  Eye,
  Activity,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Mail,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

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
  totalQuizzes?: number;
  testsCompleted?: number;
  totalTests?: number;
  status: "active" | "inactive" | "struggling";
}

interface StudentProgressProps {
  students: StudentData[];
  teacherId: number;
}

export function StudentProgress({ students, teacherId }: StudentProgressProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewStudent = (student: StudentData) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  // Get unique courses
  const uniqueCourses = useMemo(() => {
    const courseMap = new Map<number, { id: number; title: string }>();
    students.forEach((s) => {
      if (!courseMap.has(s.courseId)) {
        courseMap.set(s.courseId, { id: s.courseId, title: s.courseTitle });
      }
    });
    return Array.from(courseMap.values());
  }, [students]);

  // Get unique domains
  const uniqueDomains = useMemo(() => {
    const domainMap = new Map<
      number,
      { id: number; name: string; color: string }
    >();
    students.forEach((s) => {
      if (s.domainId && !domainMap.has(s.domainId)) {
        domainMap.set(s.domainId, {
          id: s.domainId,
          name: s.domainName || "Non classé",
          color: s.domainColor || "#6366f1",
        });
      }
    });
    return Array.from(domainMap.values());
  }, [students]);

  // Filter students based on selected domain and course
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Domain filter: show all when "all" selected, otherwise match specific domain
      const matchesDomain =
        selectedDomain === "all" ||
        student.domainId?.toString() === selectedDomain;

      // Course filter: show all when "all" selected, otherwise match specific course
      const matchesCourse =
        selectedCourse === "all" ||
        student.courseId.toString() === selectedCourse;

      return matchesDomain && matchesCourse;
    });
  }, [students, selectedDomain, selectedCourse]);

  // Calculate total unique students (from all enrollments, not filtered)
  const totalStudents = useMemo(() => {
    if (!students || students.length === 0) return 0;
    const uniqueStudentIds = new Set(students.map((s) => s.studentId));
    return uniqueStudentIds.size;
  }, [students]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Statistics Card */}
      <Card className="border-border bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                Total Étudiants
              </p>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalStudents}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Inscrits à vos cours
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Mes Étudiants</h2>
          <p className="text-muted-foreground">
            Liste de tous les étudiants inscrits à vos cours avec leurs
            statistiques
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tous les domaines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les domaines</SelectItem>
                  {uniqueDomains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: domain.color }}
                        />
                        {domain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[250px]">
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

              <div className="flex-1 flex items-center justify-end text-sm text-muted-foreground">
                {filteredStudents.length} résultat
                {filteredStudents.length > 1 ? "s" : ""}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead>Domaine</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Activité</TableHead>
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
                        {/* Student Info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={student.studentAvatarUrl || ""}
                                alt={student.studentName || ""}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
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

                        {/* Course */}
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="font-medium text-sm line-clamp-1">
                              {student.courseTitle}
                            </p>
                          </div>
                        </TableCell>

                        {/* Domain */}
                        <TableCell>
                          {student.domainName && (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: student.domainColor || "#6366f1",
                                color: student.domainColor || "#6366f1",
                                backgroundColor: `${
                                  student.domainColor || "#6366f1"
                                }10`,
                              }}
                            >
                              {student.domainName}
                            </Badge>
                          )}
                        </TableCell>

                        {/* Quiz Stats */}
                        <TableCell>
                          <div className="space-y-1 min-w-[100px]">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-sm font-medium">
                                {student.quizzesCompleted}/
                                {student.totalQuizzes || 0}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Moy: {student.averageQuizScore}%
                            </p>
                          </div>
                        </TableCell>

                        {/* Test Stats */}
                        <TableCell>
                          <div className="space-y-1 min-w-[100px]">
                            <div className="flex items-center gap-1.5">
                              <ClipboardCheck className="h-3.5 w-3.5 text-purple-600" />
                              <span className="text-sm font-medium">
                                {student.testsCompleted || 0}/
                                {student.totalTests || 0}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Tests complétés
                            </p>
                          </div>
                        </TableCell>

                        {/* Activity */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Activity className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(student.lastActivityDate)}
                              </span>
                            </div>
                            {student.enrolledAt && (
                              <p className="text-xs text-muted-foreground">
                                Inscrit: {formatDate(student.enrolledAt)}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
                            onClick={() => handleViewStudent(student)}
                          >
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
      </div>

      {/* Student Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-emerald-500/20">
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-semibold text-lg"
                      style={{
                        background: `linear-gradient(135deg, ${
                          selectedStudent.domainColor || "#3b82f6"
                        } 0%, ${
                          selectedStudent.domainColor
                            ? `${selectedStudent.domainColor}dd`
                            : "#2563eb"
                        } 100%)`,
                      }}
                    >
                      {getInitials(selectedStudent.studentName)}
                    </div>
                  </Avatar>
                  <div>
                    <div className="text-xl font-bold">
                      {selectedStudent.studentName}
                    </div>
                    <div className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {selectedStudent.studentEmail}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Statistiques détaillées de l&apos;étudiant
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Course Info */}
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    Cours
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Titre
                      </span>
                      <span className="text-sm font-medium">
                        {selectedStudent.courseTitle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Domaine
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: selectedStudent.domainColor || "#3b82f6",
                          color: selectedStudent.domainColor || "#3b82f6",
                          backgroundColor: selectedStudent.domainColor
                            ? `${selectedStudent.domainColor}10`
                            : "#3b82f610",
                        }}
                      >
                        {selectedStudent.domainName || "Aucun domaine"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Progression
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Chapitres complétés
                        </span>
                        <span className="text-sm font-medium">
                          {selectedStudent.chaptersCompleted}/
                          {selectedStudent.totalChapters}
                        </span>
                      </div>
                      <Progress
                        value={selectedStudent.progress}
                        className="h-2"
                      />
                      <div className="text-right text-xs text-muted-foreground mt-1">
                        {selectedStudent.progress.toFixed(0)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          Quiz
                        </div>
                        <div className="text-lg font-semibold">
                          {selectedStudent.quizzesCompleted}/
                          {selectedStudent.totalQuizzes}
                        </div>
                        {selectedStudent.averageQuizScore !== null &&
                          selectedStudent.averageQuizScore !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              Moyenne:{" "}
                              {selectedStudent.averageQuizScore.toFixed(1)}%
                            </div>
                          )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ClipboardCheck className="h-4 w-4" />
                          Tests
                        </div>
                        <div className="text-lg font-semibold">
                          {selectedStudent.testsCompleted}/
                          {selectedStudent.totalTests}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          À venir
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    Activité
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Inscrit le
                      </span>
                      <span className="text-sm font-medium">
                        {selectedStudent.enrolledAt
                          ? new Date(
                              selectedStudent.enrolledAt
                            ).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Dernière activité
                      </span>
                      <span className="text-sm font-medium">
                        {selectedStudent.lastActivityDate
                          ? new Date(
                              selectedStudent.lastActivityDate
                            ).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Aucune activité"}
                      </span>
                    </div>
                    {selectedStudent.completedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Cours terminé le
                        </span>
                        <span className="text-sm font-medium text-emerald-600">
                          {new Date(
                            selectedStudent.completedAt
                          ).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                {(selectedStudent.studentPhone ||
                  selectedStudent.studentCity) && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <h3 className="font-semibold text-base">
                      Informations complémentaires
                    </h3>
                    <div className="space-y-2">
                      {selectedStudent.studentPhone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Téléphone
                          </span>
                          <span className="text-sm font-medium">
                            {selectedStudent.studentPhone}
                          </span>
                        </div>
                      )}
                      {selectedStudent.studentCity && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Ville
                          </span>
                          <span className="text-sm font-medium">
                            {selectedStudent.studentCity}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
