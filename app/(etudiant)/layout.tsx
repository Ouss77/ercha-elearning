import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/auth"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"
import { getUserById } from "@/lib/db/queries";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Access control is enforced by middleware; fetch the current user for UI
  const user = await getCurrentUser()

  if (!user) {
    redirect("/connexion");
  }

  // Fetch full user data from database to get the latest avatar
  const userId = parseInt(user.id);
  const userDataResult = await getUserById(userId);
  const userData = userDataResult.success ? userDataResult.data : null;

  // Merge database avatar with session user
  const userWithAvatar = {
    ...user,
    image: userData?.avatarUrl || user.image,
  };

  return (
    <LayoutWrapper role="STUDENT" user={userWithAvatar}>
      {children}
    </LayoutWrapper>
  );
}
