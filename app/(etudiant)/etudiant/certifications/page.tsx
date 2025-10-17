import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { CertificatesView } from "@/components/student/certificates-view";

export default async function CertificatesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  return <CertificatesView user={user} />;
}
