"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/landing/hero";
import { StatsSection } from "@/components/landing/stats-section";
import { Courses } from "@/components/landing/courses";
import { Features } from "@/components/landing/features";
import { Teachers } from "@/components/landing/teachers";
import { CTASection } from "@/components/landing/cta-section";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to their respective dashboards
    if (status === "authenticated" && session?.user) {
      const role = session.user.role;

      switch (role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "TRAINER":
          router.push("/formateur");
          break;
        case "STUDENT":
          router.push("/etudiant");
          break;
        case "SUB_ADMIN":
          router.push("/sous-admin");
          break;
        default:
          break;
      }
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  // Don't render homepage content if user is authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

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
