import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { HomeHeader } from "@/components/layout/home-header";
import { Hero } from "@/components/landing/hero";
import { StatsSection } from "@/components/landing/stats-section";
import { Courses } from "@/components/landing/courses";
import { Features } from "@/components/landing/features";
import { Teachers } from "@/components/landing/teachers";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/layout/footer";

//TODO : Rename Route Groups to French

export default async function HomePage() {
  const user = await getCurrentUser();

  // Redirect authenticated users to their respective dashboards
  if (user) {
    switch (user.role) {
      case "ADMIN":
        redirect("/admin");
      case "TRAINER":
        redirect("/formateur");
      case "STUDENT":
        redirect("/etudiant");
      case "SUB_ADMIN":
        redirect("/sous-admin");
      default:
        // If role is unknown, redirect to unauthorized page
        redirect("/non-autorise");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HomeHeader user={user} />

      {/* Hero Section with Search */}
      <Hero user={user} />

      {/* Stats Section */}
      <StatsSection />

      {/* Popular Courses Section */}
      {await Courses()}

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      <Teachers />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
