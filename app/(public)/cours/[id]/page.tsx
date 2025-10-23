import { getCourseById } from "@/lib/data/static-courses";
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
  Clock,
  Award,
  CheckCircle,
  ArrowLeft,
  FileText,
  Code,
  Palette,
  TrendingUp,
  Target,
  Wrench,
} from "lucide-react";

interface CourseDetailPageProps {
  params: { id: string };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const courseId = parseInt(params.id);

  if (isNaN(courseId)) {
    notFound();
  }

  // Get static course data
  const staticCourse = getCourseById(courseId);

  if (!staticCourse) {
    notFound();
  }

  // Helper function to get domain icon
  const getDomainIcon = (domainName: string) => {
    const icons: Record<string, any> = {
      "Développement Web": Code,
      "Design Graphique": Palette,
      "Marketing Digital": TrendingUp,
    };
    return icons[domainName] || BookOpen;
  };

  // Helper function to get domain color
  const getDomainColor = (domainName: string) => {
    const colors: Record<string, string> = {
      "Développement Web": "blue",
      "Design Graphique": "purple",
      "Marketing Digital": "green",
    };
    return colors[domainName] || "teal";
  };

  const course = {
    id: staticCourse.id,
    slug: staticCourse.slug,
    title: staticCourse.title,
    description: staticCourse.fullDescription,
    instructor: staticCourse.instructor,
    domain: staticCourse.domain,
    domainColor: getDomainColor(staticCourse.domain),
    modules: staticCourse.chapters.length,
    enrollments: Math.floor(Math.random() * 50) + 10, // Mock data
    thumbnail: staticCourse.thumbnail,
    duration: staticCourse.duration,
    level: staticCourse.level,
    learningObjectives: staticCourse.learningObjectives,
    prerequisites: staticCourse.prerequisites,
    tools: staticCourse.tools,
  };

  const chapters = staticCourse.chapters;
  const IconComponent = getDomainIcon(course.domain);

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

  const colors = getColorClasses(course.domainColor);

  return (
    <div className="min-h-screen bg-background">
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

                  {/* Level Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
                      {course.level}
                    </Badge>
                  </div>
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
                    <div className="flex flex-col items-center text-center gap-2">
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
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`p-3 rounded-full ${colors.bg}`}>
                        <Clock className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {course.duration.split(" ")[0]}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {course.duration.split(" ")[1]}
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
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Course Chapters */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Contenu du cours
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {chapters.length} chapitres • {course.duration}
                </p>
              </div>

              <div className="space-y-4">
                {chapters.map((chapter, index: number) => (
                  <Card
                    key={chapter.id}
                    className={`group hover:shadow-md transition-all duration-300 border-2 hover:${colors.border}`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-full ${colors.bg} flex-shrink-0`}
                        >
                          <span className={`text-lg font-bold ${colors.text}`}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <CardTitle className="text-xl mb-2">
                            {chapter.title}
                          </CardTitle>
                          <CardDescription className="text-sm mb-3">
                            {chapter.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {chapter.topics
                              .slice(0, 3)
                              .map((topic: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            {chapter.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{chapter.topics.length - 3} plus
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{chapter.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{chapter.topics.length} sujets</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning Objectives */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className={`h-5 w-5 ${colors.text}`} />
                    Objectifs d'apprentissage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {course.learningObjectives.map(
                      (objective: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {objective}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Prerequisites */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className={`h-5 w-5 ${colors.text}`} />
                    Prérequis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map(
                      (prereq: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-gray-400">•</span>
                          {prereq}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className={`h-5 w-5 ${colors.text}`} />
                    Outils utilisés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tools.map((tool: string, index: number) => (
                      <Badge key={index} className={colors.badge}>
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Info */}
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
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Durée estimée
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {course.duration}
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
    </div>
  );
}
