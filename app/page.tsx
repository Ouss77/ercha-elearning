import { getCurrentUser } from "@/lib/auth/auth";
import { HomeHeader } from "@/components/layout/home-header";
import { Hero } from "@/components/landing/hero";
import { StatsSection } from "@/components/landing/stats-section";
import { Courses } from "@/components/landing/courses";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/layout/footer";

//TODO : Rename Route Groups to French

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HomeHeader user={user} />

      {/* Hero Section with Search */}
      <Hero user={user} />

      {/* Stats Section */}
      <StatsSection />

      {/* Popular Courses Section */}
      <Courses />

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
