import { requireAuth } from "@/lib/auth/auth";
import { UsersManagement } from "@/components/admin/users-management";

export default async function UtilisateursPage() {
  await requireAuth(["admin"]);

  return <UsersManagement />;
}
