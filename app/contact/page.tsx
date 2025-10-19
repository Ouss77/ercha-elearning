import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/auth";
import { ContactContent } from "@/components/landing/contact-content";

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader user={user} />
      <ContactContent />
      <Footer />
    </div>
  );
}
