"use client";

import { useState, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseWithStats {
  courseId: number;
  courseTitle: string;
  courseDescription: string | null;
  courseThumbnailUrl: string | null;
  courseIsActive: boolean | null;
  domainId: number | null;
  domainName: string | null;
  domainColor: string | null;
  totalStudents: number;
  totalChapters: number;
  completedEnrollments: number;
  totalProgress: number;
}

interface MyCoursesProps {
  courses: CourseWithStats[];
}

export function MyCourses({ courses }: MyCoursesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Transform database courses to include calculated fields
  const transformedCourses = useMemo(() => {
    return courses.map((course) => {
      const averageProgress =
        course.totalChapters > 0 && course.totalStudents > 0
          ? Math.round(
              (course.totalProgress /
                (course.totalChapters * course.totalStudents)) *
                100
            )
          : 0;

      return {
        id: course.courseId,
        title: course.courseTitle,
        description: course.courseDescription || "",
        domain: course.domainName || "Non catégorisé",
        domainColor: course.domainColor || "#6366f1",
        thumbnail: course.courseThumbnailUrl || "/placeholder.svg",
        studentsCount: course.totalStudents,
        chaptersCount: course.totalChapters,
        averageProgress,
        isActive: course.courseIsActive ?? true,
      };
    });
  }, [courses]);

  const filteredCourses = transformedCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && course.isActive) ||
      (activeTab === "inactive" && !course.isActive) ||
      (activeTab === "enrolled" && course.studentsCount > 0) ||
      (activeTab === "not-enrolled" && course.studentsCount === 0);
    return matchesSearch && matchesTab;
  });

  // Calculate stats for tabs
  const stats = useMemo(() => {
    return {
      all: transformedCourses.length,
      active: transformedCourses.filter((c) => c.isActive).length,
      inactive: transformedCourses.filter((c) => !c.isActive).length,
      enrolled: transformedCourses.filter((c) => c.studentsCount > 0).length,
      notEnrolled: transformedCourses.filter((c) => c.studentsCount === 0)
        .length,
    };
  }, [transformedCourses]);

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Cours
                </p>
                <p className="text-2xl font-bold">{stats.all}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avec Étudiants
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.enrolled}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sans Étudiants
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.notEnrolled}
                </p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Taux d'Inscription
                </p>
                <p className="text-2xl font-bold">
                  {stats.all > 0
                    ? Math.round((stats.enrolled / stats.all) * 100)
                    : 0}
                  %
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Mes Cours</CardTitle>
          <CardDescription>Gérez et suivez vos cours assignés</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
                  <TabsTrigger value="all">Tous ({stats.all})</TabsTrigger>
                  <TabsTrigger value="enrolled">
                    Avec étudiants ({stats.enrolled})
                  </TabsTrigger>
                  <TabsTrigger value="not-enrolled">
                    Sans étudiants ({stats.notEnrolled})
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Actifs ({stats.active})
                  </TabsTrigger>
                  <TabsTrigger value="inactive">
                    Inactifs ({stats.inactive})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="relative">
                  <Image
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={course.isActive ? "default" : "secondary"}>
                      {course.isActive ? "Actif" : "Inactif"}
                    </Badge>
                    {course.studentsCount === 0 && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                      >
                        Aucun étudiant
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge
                      style={{
                        backgroundColor: `${course.domainColor}20`,
                        color: course.domainColor,
                        borderColor: `${course.domainColor}40`,
                      }}
                    >
                      {course.domain}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {course.chaptersCount} chapitres
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {course.studentsCount}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          étudiants
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {course.averageProgress}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          progression
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression moyenne</span>
                        <span>{course.averageProgress}%</span>
                      </div>
                      <Progress
                        value={course.averageProgress}
                        className="h-2"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/formateur/cours/${course.id}`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                {activeTab === "all" && "Aucun cours trouvé"}
                {activeTab === "enrolled" &&
                  "Aucun cours avec des étudiants inscrits"}
                {activeTab === "not-enrolled" &&
                  "Tous vos cours ont des étudiants inscrits"}
                {activeTab === "active" && "Aucun cours actif"}
                {activeTab === "inactive" && "Aucun cours inactif"}
              </p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Essayez de modifier vos critères de recherche
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
