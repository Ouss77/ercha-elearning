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
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  FileText,
  Mail,
  Award,
  TrendingUp,
  Clock,
  ArrowLeft,
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
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/formateur/cours">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux cours
          </Button>
        </Link>
      </div>

      {/* Course Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Course Thumbnail */}
            <div className="relative w-full md:w-64 h-40 rounded-lg overflow-hidden bg-muted">
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
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <div className="flex gap-2">
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
              </div>

              {course.description && (
                <CardDescription className="text-base">
                  {course.description}
                </CardDescription>
              )}

              <div className="flex gap-4 text-sm text-muted-foreground">
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Étudiants inscrits
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedStudents} ont terminé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenu</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChapters}</div>
            <p className="text-xs text-muted-foreground">
              {chapters.length} chapitres au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de complétion
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedStudents}/{stats.totalStudents} étudiants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progrès moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">Progression globale</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Teacher Info and Chapters */}
        <div className="md:col-span-2 space-y-6">
          {/* Teacher Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Informations sur le formateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={course.teacherAvatarUrl || ""}
                    alt={course.teacherName || ""}
                  />
                  <AvatarFallback>
                    {getInitials(course.teacherName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {course.teacherName}
                    </h3>
                    {course.teacherEmail && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Mail className="h-4 w-4" />
                        {course.teacherEmail}
                      </div>
                    )}
                  </div>

                  {course.teacherBio && (
                    <div>
                      <Separator className="mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {course.teacherBio}
                      </p>
                    </div>
                  )}

                  {course.domainName && (
                    <div>
                      <Separator className="mb-3" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Domaine d'expertise:
                        </span>
                        <Badge
                          style={{
                            backgroundColor: course.domainColor || "#6366f1",
                            color: "white",
                          }}
                        >
                          {course.domainName}
                        </Badge>
                      </div>
                      {course.domainDescription && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {course.domainDescription}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapters List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contenu du cours ({chapters.length} chapitres)
              </CardTitle>
              <CardDescription>
                Liste de tous les chapitres organisés par modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chapters.length > 0 ? (
                <div className="space-y-3">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium">{chapter.title}</h4>
                        {chapter.description && (
                          <p className="text-sm text-muted-foreground">
                            {chapter.description}
                          </p>
                        )}
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {chapter.contentType && (
                            <Badge variant="outline" className="text-xs">
                              {chapter.contentType}
                            </Badge>
                          )}
                          {chapter.createdAt && (
                            <span>Créé le {formatDate(chapter.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun chapitre créé pour ce cours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Enrollments */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Inscriptions récentes
              </CardTitle>
              <CardDescription>
                Derniers étudiants inscrits au cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {recentEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.studentId}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={enrollment.studentAvatarUrl || ""}
                          alt={enrollment.studentName || ""}
                        />
                        <AvatarFallback>
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
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun étudiant inscrit</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
