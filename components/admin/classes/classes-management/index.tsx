"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { ClassesTable } from "./classes-table";
import { CreateClassDialog } from "./create-class-dialog";
import { ClassDetailsDialog } from "./class-details-dialog";

export interface Class {
  id: number;
  name: string;
  description: string | null;
  domainId: number | null;
  domainName: string | null;
  domainColor: string | null;
  isActive: boolean | null;
  maxStudents: number | null;
  createdAt: Date;
  studentCount: number;
}

export function ClassesManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/classes");
      const data = await response.json();

      if (response.ok) {
        setClasses(data.classes || []);
      } else {
        toast.error(data.error || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleViewDetails = (classItem: Class) => {
    setSelectedClass(classItem);
    setDetailsDialogOpen(true);
  };

  const handleDelete = async (classId: number) => {
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Classe supprimée avec succès");
        fetchClasses();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Gestion des Classes
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérer les classes et assigner des cours aux groupes d'étudiants
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Classe
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Classes
                      </p>
                      <p className="text-2xl font-bold">{classes.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Classes Actives
                      </p>
                      <p className="text-2xl font-bold">
                        {classes.filter((c) => c.isActive).length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Étudiants
                      </p>
                      <p className="text-2xl font-bold">
                        {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-chart-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ClassesTable
            classes={classes}
            loading={loading}
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
            onRefresh={fetchClasses}
          />
        </CardContent>
      </Card>

      <CreateClassDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchClasses}
      />

      {selectedClass && (
        <ClassDetailsDialog
          classItem={selectedClass}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onUpdate={fetchClasses}
        />
      )}
    </div>
  );
}