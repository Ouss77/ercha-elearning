import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/auth";
import { getCoursesWithDetails, getChaptersByCourseId } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Clock,
  Award,
  CheckCircle,
  ArrowLeft,
  PlayCircle,
  FileText,
  Code,
  Palette,
  TrendingUp,
} from "lucide-react";

interface CourseDetailPageProps {
  params: { id: string };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const user = await getCurrentUser();
  const courseId = parseInt(params.id);

  if (isNaN(courseId)) {
    notFound();
  }

  // Fetch course details
  const coursesResult = await getCoursesWithDetails();
  const allCourses = coursesResult.success ? coursesResult.data : [];
  const courseData = allCourses.find((c: any) => c.id === courseId);

  if (!courseData) {
    notFound();
  }

  // Fetch chapters
  const chaptersResult = await getChaptersByCourseId(courseId);
  const chapters = chaptersResult.success ? chaptersResult.data : [];

  // Helper function to get domain-specific thumbnail
  const getDomainThumbnail = (domainName: string | null | undefined) => {
    const thumbnails: Record<string, string> = {
      "Développement Web": "/react-course.png",
      "Design Graphique": "/ux-ui-design-course.png",
      "Marketing Digital": "/marketing-course-concept.png",
    };
    return thumbnails[domainName || ""] || "/placeholder.svg";
  };

  // Helper function to get domain icon
  const getDomainIcon = (domainName: string | null | undefined) => {
    const icons: Record<string, any> = {
      "Développement Web": Code,
      "Design Graphique": Palette,
      "Marketing Digital": TrendingUp,
    };
    return icons[domainName || ""] || BookOpen;
  };

  // Helper function to get domain color
  const getDomainColor = (domainName: string | null | undefined) => {
    const colors: Record<string, string> = {
      "Développement Web": "blue",
      "Design Graphique": "purple",
      "Marketing Digital": "green",
    };
    return colors[domainName || ""] || "teal";
  };

  const course = {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description || "Description à venir",
    instructor: courseData.teacher?.name || "Formateur",
    instructorEmail: courseData.teacher?.email || "",
    domain: courseData.domain?.name || "Non spécifié",
    domainColor:
      courseData.domain?.color || getDomainColor(courseData.domain?.name),
    modules: courseData._count?.chapters || 0,
    enrollments: courseData._count?.enrollments || 0,
    thumbnail:
      courseData.thumbnailUrl || getDomainThumbnail(courseData.domain?.name),
    icon: getDomainIcon(courseData.domain?.name),
    color: getDomainColor(courseData.domain?.name),
    isActive: courseData.isActive,
    createdAt: courseData.createdAt,
  };

  const IconComponent = course.icon;

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
        gradient: "from-blue-600 to-cyan-600",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        badge:
          "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
        gradient: "from-purple-600 to-pink-600",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-950/30",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
        badge:
          "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
        gradient: "from-green-600 to-emerald-600",
      },
      teal: {
        bg: "bg-teal-50 dark:bg-teal-950/30",
        border: "border-teal-200 dark:border-teal-800",
        text: "text-teal-600 dark:text-teal-400",
        badge: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
        gradient: "from-teal-600 to-emerald-600",
      },
    };
    return colors[color] || colors.teal;
  };

  const colors = getColorClasses(course.color);

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader user={user} />

      {/* Hero Section with Course Info */}
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/cours">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux cours
            </Button>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Course Image */}
            <div className="relative">
              <Card className={`overflow-hidden ${colors.border} border-2`}>
                <div className="relative h-[400px]">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Domain Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      className={`${colors.badge} flex items-center gap-2`}
                    >
                      <IconComponent className={`h-4 w-4 ${colors.text}`} />
                      {course.domain}
                    </Badge>
                  </div>

                  {/* Status Badge */}
                  {course.isActive && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white">Actif</Badge>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Course Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {course.description}
                </p>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${colors.bg}`}>
                        <BookOpen className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {course.modules}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Chapitres
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${colors.bg}`}>
                        <Users className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {course.enrollments}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Étudiants
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Course Chapters */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Contenu du cours
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {chapters.length} chapitres disponibles
                </p>
              </div>

              {chapters.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Aucun chapitre disponible pour le moment
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chapter: any, index: number) => (
                    <Card
                      key={chapter.id}
                      className={`group hover:shadow-md transition-all duration-300 ${colors.border} hover:border-2`}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-full ${colors.bg} flex-shrink-0`}
                          >
                            <span
                              className={`text-lg font-bold ${colors.text}`}
                            >
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-grow">
                            <CardTitle className="text-xl mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {chapter.title}
                            </CardTitle>
                            {chapter.description && (
                              <CardDescription className="text-sm">
                                {chapter.description}
                              </CardDescription>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <PlayCircle className="h-4 w-4" />
                                <span>Vidéo</span>
                              </div>
                              {chapter.content && (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>Contenu</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {user && (
                            <CheckCircle className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - What You'll Learn */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className={`h-5 w-5 ${colors.text}`} />
                    Ce que vous allez apprendre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Maîtriser les concepts fondamentaux
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Développer des projets pratiques
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Acquérir des compétences professionnelles
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Obtenir un certificat de réussite
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className={`h-5 w-5 ${colors.text}`} />
                    Informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Niveau
                    </span>
                    <Badge variant="outline">Tous niveaux</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Durée estimée
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {chapters.length * 2}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Langue
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Français
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Certificat
                    </span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
