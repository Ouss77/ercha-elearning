"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  ArrowLeft,
  Edit,
  Eye,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseDetailData {
  course: {
    id: number;
    title: string;
    slug: string | null;
    description: string | null;
    thumbnailUrl: string | null;
    isActive: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    domainId: number | null;
    domainName: string | null;
    domainColor: string | null;
    domainDescription: string | null;
    teacherId: number | null;
    teacherName: string | null;
    teacherEmail: string | null;
    teacherAvatarUrl: string | null;
    teacherBio: string | null;
  };
  chapters: Array<{
    id: number;
    title: string;
    description: string | null;
    orderIndex: number;
    contentType: string | null;
    createdAt: Date | null;
  }>;
  stats: {
    totalStudents: number;
    completedStudents: number;
    totalChapters: number;
    averageProgress: number;
    completionRate: number;
  };
  recentEnrollments: Array<{
    studentId: number;
    studentName: string | null;
    studentEmail: string | null;
    studentAvatarUrl: string | null;
    enrolledAt: Date | null;
    completedAt: Date | null;
  }>;
}

export default function CourseDetailView({
  courseData,
}: {
  courseData: CourseDetailData;
}) {
  const { course, chapters, stats, recentEnrollments } = courseData;

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
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <Link href="/formateur/cours">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux cours
          </Button>
        </Link>
        
        <div className="flex gap-2">
          <Link href={`/formateur/cours/${course.id}/modifier`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
          <Link href={`/cours/${course.id}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
          </Link>
          <Link href={`/formateur/cours/${course.id}/analytics`}>
            <Button size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyses
            </Button>
          </Link>
        </div>
      </div>

      {/* Course Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Course Thumbnail */}
            <div className="relative w-full md:w-64 h-40 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <CardTitle className="text-2xl md:text-3xl">{course.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {course.domainName && (
                    <Badge
                      style={{
                        backgroundColor: course.domainColor || "#6366f1",
                        color: "white",
                      }}
                    >
                      {course.domainName}
                    </Badge>
                  )}
                  <Badge variant={course.isActive ? "default" : "secondary"}>
                    {course.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>

              {course.description && (
                <CardDescription className="text-base leading-relaxed">
                  {course.description}
                </CardDescription>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Créé le {formatDate(course.createdAt)}
                </div>
                {course.updatedAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Mis à jour le {formatDate(course.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Étudiants inscrits
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedStudents} ont terminé le cours
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenu</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChapters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {chapters.length} chapitres répartis en modules
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de complétion
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedStudents} sur {stats.totalStudents} étudiants
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Chapters (takes more space) */}
        <div className="lg:col-span-2">
          {/* Chapters List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Contenu du cours
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {chapters.length} chapitre{chapters.length > 1 ? 's' : ''} organisé{chapters.length > 1 ? 's' : ''} par modules
                  </CardDescription>
                </div>
                <Link href={`/formateur/cours/${course.id}/chapitres`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Gérer
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {chapters.length > 0 ? (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="group flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all cursor-pointer"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <h4 className="font-medium leading-tight group-hover:text-primary transition-colors">
                          {chapter.title}
                        </h4>
                        {chapter.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {chapter.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {chapter.contentType && (
                            <Badge variant="secondary" className="text-xs">
                              {chapter.contentType}
                            </Badge>
                          )}
                          {chapter.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(chapter.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="font-medium text-lg mb-2">Aucun chapitre</h3>
                  <p className="text-sm mb-4">Commencez par créer votre premier chapitre</p>
                  <Link href={`/formateur/cours/${course.id}/chapitres/nouveau`}>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Créer un chapitre
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Enrollments */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Inscriptions récentes
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Derniers étudiants inscrits
                  </CardDescription>
                </div>
                {recentEnrollments.length > 0 && (
                  <Link href={`/formateur/etudiants?courseId=${course.id}`}>
                    <Button variant="ghost" size="sm">
                      Voir tous
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recentEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {recentEnrollments.slice(0, 8).map((enrollment) => (
                    <div
                      key={enrollment.studentId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-background">
                        <AvatarImage
                          src={enrollment.studentAvatarUrl || ""}
                          alt={enrollment.studentName || ""}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(enrollment.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {enrollment.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(enrollment.enrolledAt)}
                        </p>
                      </div>
                      {enrollment.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium hidden sm:inline">
                            Terminé
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun étudiant inscrit</p>
                  <p className="text-xs mt-1">Les inscriptions apparaîtront ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
