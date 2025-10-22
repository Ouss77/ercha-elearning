import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/auth";
import { AboutContent } from "@/components/landing/about-content";

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <AboutContent />
      <Footer />
    </div>
  );
}
