"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Users } from "lucide-react";
import type { Class } from "./index";

interface ClassesTableProps {
  classes: Class[];
  loading: boolean;
  onViewDetails: (classItem: Class) => void;
  onDelete: (classId: number) => void;
  onRefresh: () => void;
}

export function ClassesTable({
  classes,
  loading,
  onViewDetails,
  onDelete,
}: ClassesTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune classe trouvée
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom de la Classe</TableHead>
              <TableHead className="hidden md:table-cell">Domaine</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead>Étudiants</TableHead>
              <TableHead className="hidden sm:table-cell">Capacité Max</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span>{classItem.name}</span>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {classItem.domainName || "Aucun domaine"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {classItem.domainName ? (
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: classItem.domainColor || undefined,
                        color: classItem.domainColor || undefined,
                      }}
                    >
                      {classItem.domainName}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Aucun domaine
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-[200px]">
                  <span className="text-sm text-muted-foreground line-clamp-2">
                    {classItem.description || "Aucune description"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{classItem.studentCount}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {classItem.maxStudents || "Illimité"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={classItem.isActive ? "default" : "secondary"}>
                    {classItem.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(classItem)}
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (
                          confirm(
                            "Êtes-vous sûr de vouloir supprimer cette classe ?"
                          )
                        ) {
                          onDelete(classItem.id);
                        }
                      }}
                      title="Supprimer"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}