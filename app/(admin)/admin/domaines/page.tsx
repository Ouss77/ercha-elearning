import { requireAuth } from "@/lib/auth/auth";
import { DomainsManagement } from "@/components/admin/domains-management";

export default async function DomainesPage() {
  await requireAuth(["admin"]);

  return <DomainsManagement />;
}
