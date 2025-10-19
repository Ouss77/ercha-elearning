import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { getTeacherCourseDetails } from "@/lib/db/queries";
import CourseDetailView from "@/components/teacher/course-detail-view";

export default async function TeacherCourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TRAINER") {
    redirect("/unauthorized");
  }

  const courseId = parseInt(params.id, 10);
  if (isNaN(courseId)) {
    redirect("/formateur/cours");
  }

  const teacherId = Number(session.user.id);
  if (isNaN(teacherId)) {
    redirect("/formateur/cours");
  }

  const result = await getTeacherCourseDetails(courseId, teacherId);

  if (!result.success || !result.data) {
    redirect("/formateur/cours");
  }

  const courseData = {
    ...result.data,
    course: {
      ...result.data.course,
      isActive: Boolean(result.data.course.isActive),
    },
  };

  return <CourseDetailView courseData={courseData} />;
}
