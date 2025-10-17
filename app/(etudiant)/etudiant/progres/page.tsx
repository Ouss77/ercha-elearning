import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProgressView } from "@/components/student/progress-view";

export default async function ProgressPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  return <ProgressView user={user} />;
}
