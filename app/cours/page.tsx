import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
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
} from "lucide-react";
import Image from "next/image";

export default function CoursesPage() {

  const courses = [
    {
      id: "developpement-web",
      title: "Développement Web",
      description:
        "Maîtrisez les technologies modernes du web : HTML, CSS, JavaScript, React et Next.js",
      instructor: "Walid Draa",
      duration: "12 semaines",
      level: "Débutant à Avancé",
      modules: 15,
      thumbnail: "/react-course.png",
      icon: Code,
      color: "blue",
      highlights: [
        "HTML5 & CSS3 moderne",
        "JavaScript ES6+",
        "React & Next.js",
        "Projets pratiques",
      ],
    },
    {
      id: "design-graphique",
      title: "Design Graphique",
      description:
        "Créez des designs professionnels avec Adobe Creative Suite et les principes de design UX/UI",
      instructor: "Adam Khairi",
      duration: "10 semaines",
      level: "Débutant à Intermédiaire",
      modules: 12,
      thumbnail: "/ux-ui-design-course.png",
      icon: Palette,
      color: "purple",
      highlights: [
        "Principes de design",
        "Adobe Photoshop & Illustrator",
        "Design UX/UI",
        "Portfolio professionnel",
      ],
    },
    {
      id: "marketing-digital",
      title: "Marketing Digital",
      description:
        "Développez vos compétences en marketing digital : SEO, réseaux sociaux, publicité en ligne",
      instructor: "Anas ElGhamraoui",
      duration: "8 semaines",
      level: "Tous niveaux",
      modules: 10,
      thumbnail: "/marketing-course-concept.png",
      icon: TrendingUp,
      color: "green",
      highlights: [
        "Stratégie digitale",
        "SEO & SEM",
        "Réseaux sociaux",
        "Analytics & ROI",
      ],
    },
  ];

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
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Nos Formations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Trois domaines d'excellence pour développer vos compétences
            professionnelles
          </p>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const colors = getColorClasses(course.color);
              const IconComponent = course.icon;

              return (
                <Card
                  key={course.id}
                  className={`group relative overflow-hidden ${colors.bg} border-2 ${colors.border} ${colors.hover} hover:shadow-xl transition-all duration-300 flex flex-col`}
                >
                  {/* Course Thumbnail */}
                  <div className={`relative h-56 ${colors.bg} overflow-hidden`}>
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Icon Badge */}
                    <div className="absolute top-4 right-4">
                      <div
                        className={`p-3 rounded-full ${colors.badge} backdrop-blur-sm`}
                      >
                        <IconComponent className={`h-6 w-6 ${colors.text}`} />
                      </div>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow space-y-4">
                    {/* Course Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {course.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {course.modules} modules
                        </span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <Award className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                        Points clés :
                      </h4>
                      <ul className="space-y-1">
                        {course.highlights.map((highlight, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                          >
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 rounded-full ${colors.badge}`}
                            />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructor */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Formateur:{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {course.instructor}
                        </span>
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Link href={`/cours/${course.id}`} className="block">
                      <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all group">
                        En savoir plus
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
