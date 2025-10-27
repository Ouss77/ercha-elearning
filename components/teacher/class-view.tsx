"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  FolderOpen,
  Calendar,
  Mail,
  Eye,
} from "lucide-react";
import Image from "next/image";

interface ClassData {
  id: number;
  name: string;
  description: string | null;
  domainId: number | null;
  domainName: string | null;
  domainColor: string | null;
  isActive: boolean | null;
  createdAt: Date;
  studentCount: number;
  courseCount: number;
  courses: Array<{
    courseId: number;
    courseTitle: string;
    courseDescription: string | null;
    courseThumbnailUrl: string | null;
    assignedAt: Date;
  }>;
  students: Array<{
    studentId: number;
    studentName: string;
    studentEmail: string;
    studentAvatarUrl: string | null;
    enrolledAt: Date;
  }>;
}

interface ClassViewProps {
  classes: ClassData[];
}

export function ClassView({ classes }: ClassViewProps) {
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (classItem: ClassData) => {
    setSelectedClass(classItem);
    setDetailsOpen(true);
  };

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune classe assignée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card
            key={classItem.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {classItem.name}
                  </CardTitle>
                  {classItem.domainName && (
                    <Badge
                      variant="secondary"
                      className="mb-2"
                      style={{
                        backgroundColor: classItem.domainColor || undefined,
                        color: "white",
                      }}
                    >
                      {classItem.domainName}
                    </Badge>
                  )}
                  {classItem.description && (
                    <CardDescription className="text-sm line-clamp-2">
                      {classItem.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Étudiants</p>
                    <p className="text-sm font-semibold">
                      {classItem.studentCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                    <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cours</p>
                    <p className="text-sm font-semibold">
                      {classItem.courseCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleViewDetails(classItem)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir les détails
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedClass?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedClass?.description || "Détails de la classe"}
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <Tabs defaultValue="students" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="students">
                  <Users className="h-4 w-4 mr-2" />
                  Étudiants ({selectedClass.studentCount})
                </TabsTrigger>
                <TabsTrigger value="courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Cours ({selectedClass.courseCount})
                </TabsTrigger>
              </TabsList>

              {/* Students Tab */}
              <TabsContent value="students" className="space-y-4">
                {selectedClass.students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun étudiant inscrit</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedClass.students.map((student) => (
                      <Card key={student.studentId}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={student.studentAvatarUrl || undefined}
                                alt={student.studentName}
                              />
                              <AvatarFallback>
                                {student.studentName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {student.studentName}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {student.studentEmail}
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  student.enrolledAt
                                ).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-4">
                {selectedClass.courses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun cours assigné</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedClass.courses.map((course) => (
                      <Card key={course.courseId} className="overflow-hidden">
                        <div className="aspect-video relative bg-muted">
                          {course.courseThumbnailUrl ? (
                            <Image
                              src={course.courseThumbnailUrl}
                              alt={course.courseTitle}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="h-12 w-12 text-muted-foreground opacity-50" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 line-clamp-1">
                            {course.courseTitle}
                          </h4>
                          {course.courseDescription && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {course.courseDescription}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Assigné le{" "}
                            {new Date(course.assignedAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
