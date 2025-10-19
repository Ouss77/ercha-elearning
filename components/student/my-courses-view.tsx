"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Grid3x3,
  List,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { User } from "@/lib/auth/auth";

interface MyCoursesViewProps {
  user: User;
  enrolledCourses: Array<{
    enrollmentId: number;
    courseId: number;
    courseTitle: string;
    courseDescription: string | null;
    courseThumbnailUrl: string | null;
    enrolledAt: Date;
    completedAt: Date | null;
    domainId: number | null;
    domainName: string | null;
    domainColor: string | null;
    teacherId: number | null;
    teacherName: string | null;
    totalChapters: number;
    completedChapters: number;
  }>;
}

interface Course {
  id: number;
  title: string;
  description: string;
  domain: string;
  teacher: string;
  thumbnail: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  lastAccessed?: string;
  isCompleted: boolean;
}

export function MyCoursesView({
  user,
  enrolledCourses: rawEnrolledCourses,
}: MyCoursesViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "in-progress" | "completed"
  >("all");

  // Create domain color mapping from database
  const domainColorMap = useMemo(() => {
    const colorMap: Record<string, string> = {};
    rawEnrolledCourses.forEach((enrollment) => {
      if (enrollment.domainName && enrollment.domainColor) {
        colorMap[enrollment.domainName] = enrollment.domainColor;
      }
    });
    return colorMap;
  }, [rawEnrolledCourses]);

  // Transform database data to match component's Course interface
  const courses: Course[] = useMemo(() => {
    return rawEnrolledCourses.map((enrollment) => {
      const progress =
        enrollment.totalChapters > 0
          ? Math.round(
              (enrollment.completedChapters / enrollment.totalChapters) * 100
            )
          : 0;

      return {
        id: enrollment.courseId,
        title: enrollment.courseTitle,
        description:
          enrollment.courseDescription || "Pas de description disponible",
        domain: enrollment.domainName || "Non classé",
        teacher: enrollment.teacherName || "Non assigné",
        thumbnail: enrollment.courseThumbnailUrl || "/placeholder.svg",
        progress,
        totalChapters: enrollment.totalChapters,
        completedChapters: enrollment.completedChapters,
        lastAccessed: enrollment.enrolledAt.toISOString().split("T")[0],
        isCompleted: enrollment.completedAt !== null,
      };
    });
  }, [rawEnrolledCourses]);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "completed"
        ? course.isCompleted
        : filterStatus === "in-progress"
        ? !course.isCompleted && course.progress > 0
        : true;

    return matchesSearch && matchesFilter;
  });

  const getDomainColor = (domain: string) => {
    // Use database domain colors or fallback to default colors
    if (domainColorMap[domain]) {
      // The domain color from DB is in format like "bg-blue-500"
      // We need to convert it to badge-friendly classes
      const baseColor = domainColorMap[domain].replace("bg-", "");
      return `bg-${baseColor.replace("500", "100")} text-${baseColor.replace(
        "500",
        "700"
      )} dark:bg-${baseColor.replace(
        "500",
        "950"
      )} dark:text-${baseColor.replace("500", "400")}`;
    }

    // Fallback colors in case domain color is not in database
    const fallbackColors: Record<string, string> = {
      Informatique:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      "Développement Web":
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      Marketing:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      "Marketing Digital":
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      Design:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      "Design Graphique":
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    };
    return (
      fallbackColors[domain] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mes Cours</h1>
        <p className="text-muted-foreground mt-2">
          Gérez et continuez vos formations en cours
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cours Inscrits
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.filter((c) => c.isCompleted).length} terminés
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter((c) => !c.isCompleted && c.progress > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Cours en progression
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progression Moyenne
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                courses.reduce((acc, c) => acc + c.progress, 0) / courses.length
              )}
              %
            </div>
            <Progress
              value={Math.round(
                courses.reduce((acc, c) => acc + c.progress, 0) / courses.length
              )}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Tous
              </Button>
              <Button
                variant={filterStatus === "in-progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("in-progress")}
              >
                En cours
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("completed")}
              >
                Terminés
              </Button>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Display */}
      {filteredCourses.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6 text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun cours trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group border-border bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col"
            >
              {/* Course Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {course.isCompleted ? (
                    <Badge className="bg-emerald-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Terminé
                    </Badge>
                  ) : course.progress > 0 ? (
                    <Badge className="bg-cyan-500 text-white">
                      <PlayCircle className="h-3 w-3 mr-1" />
                      En cours
                    </Badge>
                  ) : null}
                </div>

                {/* Domain Badge */}
                <div className="absolute bottom-4 left-4">
                  <Badge className={getDomainColor(course.domain)}>
                    {course.domain}
                  </Badge>
                </div>
              </div>

              <CardHeader className="flex-grow">
                <CardTitle className="group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                {!course.isCompleted && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-semibold text-primary">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {course.completedChapters}/{course.totalChapters}{" "}
                      chapitres
                    </span>
                  </div>
                  {course.lastAccessed && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(course.lastAccessed)}</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link href={`/etudiant/course/${course.id}`}>
                  <Button className="w-full group/btn">
                    {course.isCompleted ? "Revoir le cours" : "Continuer"}
                    <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="border-border bg-card hover:shadow-md hover:border-primary/50 transition-all"
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getDomainColor(course.domain)}>
                            {course.domain}
                          </Badge>
                          {course.isCompleted && (
                            <Badge className="bg-emerald-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Terminé
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {!course.isCompleted && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progression
                          </span>
                          <span className="font-semibold text-primary">
                            {course.progress}%
                          </span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>
                            {course.completedChapters}/{course.totalChapters}{" "}
                            chapitres
                          </span>
                        </div>
                        {course.lastAccessed && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(course.lastAccessed)}</span>
                          </div>
                        )}
                      </div>

                      <Link href={`/etudiant/course/${course.id}`}>
                        <Button>
                          {course.isCompleted ? "Revoir" : "Continuer"}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
