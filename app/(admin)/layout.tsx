import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { getUserById } from "@/lib/db/queries";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify user is authenticated and has ADMIN role
  const user = await requireAuth(["ADMIN"]);

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
    <LayoutWrapper role="ADMIN" user={userWithAvatar}>
      {children}
    </LayoutWrapper>
  );
}
