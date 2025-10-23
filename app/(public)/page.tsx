import { Hero } from "@/components/landing/hero";
import { StatsSection } from "@/components/landing/stats-section";
import { Courses } from "@/components/landing/courses";
import { Features } from "@/components/landing/features";
import { Teachers } from "@/components/landing/teachers";
import { CTASection } from "@/components/landing/cta-section";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <Hero />

      {/* Stats Section */}
      <StatsSection />

      {/* Popular Courses Section */}
      <Courses />

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      <Teachers />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
