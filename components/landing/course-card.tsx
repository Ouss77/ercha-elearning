"use client";

import { useState } from "react";
import Image from "next/image";
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
import { BookOpen, Users, ArrowRight } from "lucide-react";

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    domain: string;
    teacher: string;
    thumbnail: string;
    totalChapters?: number;
    totalModules?: number;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const [imageError, setImageError] = useState(false);

  // Helper function to get domain-specific fallback thumbnail
  const getDomainThumbnail = (domain: string) => {
    const thumbnails: Record<string, string> = {
      "Développement Web": "/react-course.png",
      "Design Graphique": "/ux-ui-design-course.png",
      "Marketing Digital": "/marketing-course-concept.png",
      // Fallback for old names
      Informatique: "/react-course.png",
      Design: "/ux-ui-design-course.png",
      Marketing: "/marketing-course-concept.png",
    };
    return thumbnails[domain] || "/placeholder.svg";
  };

  // Helper function to get domain color
  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      "Développement Web":
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-900",
      "Design Graphique":
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-900",
      "Marketing Digital":
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-900",
      // Fallback for old names
      Informatique:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-900",
      Marketing:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-900",
      Design:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-900",
    };
    return (
      colors[domain] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400 border-gray-200 dark:border-gray-900"
    );
  };

  // Helper function to get domain background color for card
  const getDomainBgColor = (domain: string) => {
    const bgColors: Record<string, string> = {
      "Développement Web": "bg-blue-50 dark:bg-blue-950/30",
      "Design Graphique": "bg-purple-50 dark:bg-purple-950/30",
      "Marketing Digital": "bg-green-50 dark:bg-green-950/30",
      // Fallback for old names
      Informatique: "bg-blue-50 dark:bg-blue-950/30",
      Marketing: "bg-green-50 dark:bg-green-950/30",
      Design: "bg-purple-50 dark:bg-purple-950/30",
    };
    return bgColors[domain] || "bg-gray-50 dark:bg-gray-950/30";
  };

  // Determine which image to display
  const imageSrc = imageError
    ? getDomainThumbnail(course.domain)
    : course.thumbnail;

  return (
    <Card
      className={`group relative overflow-hidden border-gray-200 dark:border-gray-800 ${getDomainBgColor(
        course.domain
      )} hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 flex flex-col`}
    >
      {/* Course Thumbnail */}
      <div
        className={`relative h-48 ${getDomainBgColor(
          course.domain
        )} overflow-hidden`}
      >
        {/* Actual Thumbnail Image */}
        <Image
          src={imageSrc}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
          priority={false}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Domain Badge - Positioned over image */}
        <div className="absolute bottom-4 left-4 z-10">
          <Badge
            className={`${getDomainColor(course.domain)} backdrop-blur-sm`}
          >
            {course.domain}
          </Badge>
        </div>
      </div>

      <CardHeader className="flex-grow">
        <CardTitle className="text-xl group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        {/* Course Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950">
              <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {course.totalModules ? "Modules" : "Chapitres"}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {course.totalModules || course.totalChapters}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Professeur
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                {course.teacher}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/cours/${course.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all group">
            Voir le cours
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
