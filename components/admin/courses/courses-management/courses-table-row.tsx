import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import type { Course } from "./types";

interface CoursesTableRowProps {
  course: Course;
  onToggleStatus: (courseId: number) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

const getDomainColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    "#3B82F6": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "#10B981":
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "#8B5CF6":
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "#F59E0B":
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "#EF4444": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return (
    colorMap[color] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
};

export function CoursesTableRow({
  course,
  onToggleStatus,
  onEdit,
  onDelete,
}: CoursesTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium max-w-[250px]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="hover:text-primary cursor-pointer truncate">
               <Link href={`/admin/cours/${course.id}`}>
              {course.title}
               </Link>
            </span>
            <span
              className={`sm:hidden h-2 w-2 rounded-full flex-shrink-0 ${
                course.isActive ? "bg-green-500" : "bg-gray-400"
              }`}
              title={course.isActive ? "Actif" : "Inactif"}
            />
          </div>
          <span className="text-xs text-muted-foreground line-clamp-2">
            {course.description || "Pas de description"}
          </span>
          <div className="flex flex-wrap gap-1 md:hidden mt-1">
            {course.domain && (
              <Badge
                className={getDomainColorClass(course.domain.color)}
                variant="outline"
              >
                {course.domain.name}
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {course.domain ? (
          <Badge className={getDomainColorClass(course.domain.color)}>
            {course.domain.name}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Non assigné</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm">{course.teacher?.name || "Non assigné"}</span>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm">{course._count?.enrollments || 0}</span>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <span className="text-sm">{course._count?.chapters || 0}</span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center space-x-2">
          <Switch
            checked={course.isActive}
            onCheckedChange={() => onToggleStatus(course.id)}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {course.isActive ? "Actif" : "Inactif"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" asChild title="Gérer les chapitres">
            <Link href={`/admin/cours/${course.id}/chapters`}>
              <BookOpen className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Voir le cours"
            className="hidden lg:inline-flex"
          >
            <Link href={`/admin/cours/${course.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            title="Modifier le cours"
            className="text-primary hover:text-primary"
          >
            <Link href={`/admin/cours/${course.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(course)}
            title="Supprimer le cours"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
