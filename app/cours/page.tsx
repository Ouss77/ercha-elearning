import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/auth";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Palette,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Clock,
  Award,
  Users,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import { getCoursesWithDetails, getDomainsWithCounts } from "@/lib/db/queries";

interface PageProps {
  searchParams: { domain?: string };
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const { domain: domainFilter } = searchParams;

  // Fetch courses and domains from database
  const coursesResult = await getCoursesWithDetails();
  const domainsResult = await getDomainsWithCounts();

  const dbCourses = coursesResult.success ? coursesResult.data : [];
  const domains = domainsResult.success ? domainsResult.data : [];

  // Helper function to get domain-specific fallback thumbnail
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

  // Filter courses by domain if specified
  let filteredCourses = dbCourses;
  if (domainFilter) {
    filteredCourses = dbCourses.filter(
      (course: any) =>
        course.domain?.name?.toLowerCase() === domainFilter.toLowerCase()
    );
  }

  // Transform database courses
  const courses = filteredCourses.map((course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description || "Description à venir",
    instructor: course.teacher?.name || "Formateur",
    domain: course.domain?.name || "Non spécifié",
    modules: course.chapterCount || 0,
    enrollments: course.enrollmentCount || 0,
    thumbnail: course.thumbnailUrl || getDomainThumbnail(course.domain?.name),
    icon: getDomainIcon(course.domain?.name),
    color: getDomainColor(course.domain?.name),
  }));

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        hover: "hover:border-blue-300 dark:hover:border-blue-700",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        hover: "hover:border-purple-300 dark:hover:border-purple-700",
        badge:
          "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-950/30",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
        hover: "hover:border-green-300 dark:hover:border-green-700",
        badge:
          "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      },
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader user={user} />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {domainFilter ? `Cours de ${domainFilter}` : "Nos Formations"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {domainFilter
              ? `Découvrez tous nos cours en ${domainFilter}`
              : "Explorez toutes nos formations pour développer vos compétences professionnelles"}
          </p>

          {/* Show back to all courses link when filtered */}
          {domainFilter && (
            <div className="mt-6">
              <Link href="/cours">
                <Button variant="outline" size="sm">
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Voir tous les cours
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucun cours disponible
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {domainFilter
                  ? `Aucun cours trouvé pour ${domainFilter}`
                  : "Aucun cours n'est disponible pour le moment"}
              </p>
              {domainFilter && (
                <Link href="/cours" className="mt-4 inline-block">
                  <Button variant="outline">Voir tous les cours</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => {
                const colors = getColorClasses(course.color);
                const IconComponent = course.icon;

                return (
                  <Card
                    key={course.id}
                    className={`group relative overflow-hidden ${colors.bg} border-2 ${colors.border} ${colors.hover} hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
                  >
                    {/* Course Thumbnail */}
                    <div
                      className={`relative h-48 ${colors.bg} overflow-hidden flex-shrink-0`}
                    >
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Icon Badge */}
                      <div className="absolute top-4 right-4">
                        <div
                          className={`p-2.5 rounded-full ${colors.badge} backdrop-blur-sm`}
                        >
                          <IconComponent className={`h-5 w-5 ${colors.text}`} />
                        </div>
                      </div>

                      {/* Domain Badge */}
                      <div className="absolute bottom-4 left-4">
                        <Badge className={`${colors.badge} text-xs`}>
                          {course.domain}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="flex-shrink-0 pb-3">
                      <CardTitle className="text-xl line-clamp-2 h-14 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2 h-10">
                        {course.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col justify-between space-y-4 pt-0">
                      <div className="space-y-4">
                        {/* Course Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {course.modules} chapitres
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {course.enrollments} étudiants
                            </span>
                          </div>
                        </div>

                        {/* Instructor */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            Formateur:{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {course.instructor}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link
                        href={`/cours/${course.id}`}
                        className="block mt-auto"
                      >
                        <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all group text-sm py-2">
                          Voir le cours
                          <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
