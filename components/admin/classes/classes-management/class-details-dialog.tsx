"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, BookOpen, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Class } from "./index";

interface Student {
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentAvatarUrl: string | null;
  enrolledAt: Date;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  assignedAt: Date;
}

interface ClassDetailsDialogProps {
  classItem: Class;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ClassDetailsDialog({
  classItem,
  open,
  onOpenChange,
  onUpdate,
}: ClassDetailsDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (open) {
      fetchClassDetails();
      fetchAllStudents();
      fetchAllCourses();
    }
  }, [open, classItem.id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsResponse = await fetch(`/api/admin/classes/${classItem.id}/students`);
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
      }

      // Fetch courses
      const coursesResponse = await fetch(`/api/admin/classes/${classItem.id}/courses`);
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await fetch("/api/users?role=STUDENT");
      const data = await response.json();
      if (response.ok) {
        setAllStudents(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();
      if (response.ok) {
        setAllCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      toast.error("Veuillez sélectionner un étudiant");
      return;
    }

    try {
      const response = await fetch(`/api/admin/classes/${classItem.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: parseInt(selectedStudentId) }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Étudiant ajouté avec succès${
            data.coursesEnrolled > 0
              ? ` et inscrit à ${data.coursesEnrolled} cours`
              : ""
          }`
        );
        setSelectedStudentId("");
        fetchClassDetails();
        onUpdate();
      } else {
        toast.error(data.error || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cet étudiant de la classe ?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/classes/${classItem.id}/students/${studentId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Étudiant retiré avec succès");
        fetchClassDetails();
        onUpdate();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to remove student");
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    }
  };

  const handleAddCourse = async () => {
    if (!selectedCourseId) {
      toast.error("Veuillez sélectionner un cours");
      return;
    }

    try {
      const response = await fetch(`/api/admin/classes/${classItem.id}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: parseInt(selectedCourseId) }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Cours assigné avec succès et tous les étudiants ont été inscrits");
        setSelectedCourseId("");
        fetchClassDetails();
        onUpdate();
      } else {
        toast.error(data.error || "Failed to assign course");
      }
    } catch (error) {
      console.error("Error assigning course:", error);
      toast.error("Failed to assign course");
    }
  };

  const handleRemoveCourse = async (courseId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce cours de la classe ?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/classes/${classItem.id}/courses?classId=${classItem.id}&courseId=${courseId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Cours retiré avec succès");
        fetchClassDetails();
        onUpdate();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to remove course");
      }
    } catch (error) {
      console.error("Error removing course:", error);
      toast.error("Failed to remove course");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const availableStudents = allStudents.filter(
    (student) => !students.some((s) => s.studentId === student.id)
  );

  const availableCourses = allCourses.filter(
    (course) => !courses.some((c) => c.id === course.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{classItem.name}</DialogTitle>
          <DialogDescription>
            {classItem.description || "Aucune description"}
          </DialogDescription>
          <div className="flex gap-2 mt-2">
            {classItem.domainName && (
              <Badge
                variant="outline"
                style={{
                  borderColor: classItem.domainColor || undefined,
                  color: classItem.domainColor || undefined,
                }}
              >
                {classItem.domainName}
              </Badge>
            )}
            <Badge variant={classItem.isActive ? "default" : "secondary"}>
              {classItem.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Étudiants ({students.length})
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Cours ({courses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ajouter un Étudiant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Select
                    value={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddStudent} disabled={!selectedStudentId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun étudiant dans cette classe
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <Card key={student.studentId}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.studentAvatarUrl || ""} />
                          <AvatarFallback>
                            {getInitials(student.studentName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.studentEmail}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStudent(student.studentId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigner un Cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Select
                    value={selectedCourseId}
                    onValueChange={setSelectedCourseId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un cours" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddCourse} disabled={!selectedCourseId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Assigner
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun cours assigné à cette classe
              </div>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {course.description || "Aucune description"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCourse(course.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}