"use client";

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
import { Play, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
  description: string;
  domain: string;
  domainColor?: string;
  teacher: string;
  thumbnail: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  totalModules?: number; // New field for module count
  lastAccessed?: string;
  isCompleted: boolean;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const getDomainColor = (domain: string, dbColor?: string) => {
    // Use database color if available
    if (dbColor) {
      // Convert bg-color-500 to badge-friendly classes
      const baseColor = dbColor.replace("bg-", "");
      return `${dbColor.replace(
        "500",
        "10"
      )} text-${baseColor} border border-${baseColor.replace("500", "20")}`;
    }

    // Fallback colors
    switch (domain) {
      case "Informatique":
      case "Développement Web":
        return "bg-primary/10 text-primary border border-primary/20";
      case "Marketing":
      case "Marketing Digital":
        return "bg-chart-3/10 text-chart-3 border border-chart-3/20";
      case "Design":
      case "Design Graphique":
        return "bg-chart-2/10 text-chart-2 border border-chart-2/20";
      case "Gestion":
        return "bg-chart-4/10 text-chart-4 border border-chart-4/20";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  return (
    <Card className="border-border/50 bg-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-chart-2"></div>
        <Image
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          width={300}
          height={200}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.isCompleted && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-white shadow-lg">
              <CheckCircle className="w-3 h-3 mr-1" />
              Terminé
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge className={getDomainColor(course.domain, course.domainColor)}>
            {course.domain}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {course.totalModules ? (
              <>
                {course.totalModules} module{course.totalModules > 1 ? "s" : ""}
              </>
            ) : (
              <>
                {course.completedChapters}/{course.totalChapters} modules
              </>
            )}
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
        <p className="text-sm text-muted-foreground">Par {course.teacher}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>

          {course.lastAccessed && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Dernière visite:{" "}
              {new Date(course.lastAccessed).toLocaleDateString("fr-FR")}
            </div>
          )}

          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            <Link href={`/etudiant/course/${course.id}`}>
              <Play className="w-4 h-4 mr-2" />
              {course.progress > 0 ? "Continuer" : "Commencer"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
