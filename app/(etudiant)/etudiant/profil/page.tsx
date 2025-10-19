import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/student/profile-view";
import { getUserById } from "@/lib/db/queries";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  // Fetch full user data from database
  const userId = parseInt(user.id);
  const userDataResult = await getUserById(userId);
  const userData = userDataResult.success ? userDataResult.data : null;

  if (!userData) {
    redirect("/unauthorized");
  }

  return <ProfileView user={user} userData={userData} />;
}
