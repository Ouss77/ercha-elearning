import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/student/profile-view";
import { getUserById } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon Profil | Formateur",
  description: "Gérez votre profil et vos paramètres",
};

export default async function TrainerProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "TRAINER") {
    redirect("/connexion");
  }

  // Fetch full user data from database
  const userId = parseInt(user.id);
  const userDataResult = await getUserById(userId);
  const userData = userDataResult.success ? userDataResult.data : null;

  if (!userData) {
    // If user data fetch fails, use basic user data from session
    return <ProfileView user={user} userData={null} />;
  }

  return <ProfileView user={user} userData={userData} />;
}
