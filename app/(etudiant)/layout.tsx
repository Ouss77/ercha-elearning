import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { getUserById } from "@/lib/db/queries";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Access control is enforced by middleware; fetch the current user for UI
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  return (
    <LayoutWrapper role="STUDENT" user={user}>
      {children}
    </LayoutWrapper>
  );
}
