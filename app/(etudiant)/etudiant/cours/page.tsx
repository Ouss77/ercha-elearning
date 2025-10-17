import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { MyCoursesView } from "@/components/student/my-courses-view";

export default async function MyCoursesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  return <MyCoursesView user={user} />;
}
