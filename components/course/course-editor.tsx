"use client";

import { useEffect, useState } from "react";
import { CourseFormPage } from "@/components/admin/courses/courses-management/course-form-page";
import type { User } from "@/types/user";
import { Loader2 } from "lucide-react";

interface CourseEditorProps {
  courseId: number;
  user: User;
}

export function CourseEditor({ courseId, user }: CourseEditorProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseRes, domainsRes, teachersRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch("/api/domains"),
          fetch("/api/users?role=TRAINER"),
        ]);

        if (!courseRes.ok) {
          throw new Error("Failed to fetch course");
        }

        const [courseData, domainsData, teachersData] = await Promise.all([
          courseRes.json(),
          domainsRes.json(),
          teachersRes.json(),
        ]);

        setData({
          course: courseData.course,
          domains: domainsData.domains || [],
          teachers: teachersData.users || [],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error || "Failed to load course"}</p>
      </div>
    );
  }

  return (
    <CourseFormPage
      domains={data.domains}
      teachers={data.teachers}
      initialData={data.course}
      userRole={user.role}
      userId={user.id}
    />
  );
}
