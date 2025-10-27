import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { CoursesTableRow } from "./courses-table-row";
import type { Course } from "./types";

interface CoursesTableProps {
  courses: Course[];
  searchTerm: string;
  domainFilter?: number | null;
  teacherFilter?: number | null;
  statusFilter?: "all" | "active" | "inactive";
  onToggleStatus: (courseId: number) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function CoursesTable({
  courses,
  searchTerm,
  domainFilter,
  teacherFilter,
  statusFilter = "all",
  onToggleStatus,
  onEdit,
  onDelete,
}: CoursesTableProps) {
  const filteredCourses = courses.filter((course) => {
    // Apply domain filter
    if (domainFilter && course.domainId !== domainFilter) {
      return false;
    }

    // Apply teacher filter
    if (teacherFilter && course.teacherId !== teacherFilter) {
      return false;
    }

    // Apply status filter
    if (statusFilter === "active" && !course.isActive) {
      return false;
    }
    if (statusFilter === "inactive" && course.isActive) {
      return false;
    }

    // Apply search term filter
    if (searchTerm) {
      return (
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (course.domain?.name.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (course.teacher?.name.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
      );
    }

    return true;
  });

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] max-w-[250px]">Cours</TableHead>
              <TableHead className="hidden md:table-cell w-[140px]">
                Domaine
              </TableHead>
              <TableHead className="hidden lg:table-cell w-[150px]">
                Professeur
              </TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">
                Étudiants
              </TableHead>
              <TableHead className="hidden xl:table-cell w-[100px]">
                Modules
              </TableHead>
              <TableHead className="hidden sm:table-cell w-[130px]">
                Statut
              </TableHead>
              <TableHead className="text-right w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm ? "Aucun cours trouvé" : "Aucun cours disponible"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <CoursesTableRow
                  key={course.id}
                  course={course}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
