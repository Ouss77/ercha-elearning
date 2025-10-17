import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/student/profile-view";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  return <ProfileView user={user} />;
}
