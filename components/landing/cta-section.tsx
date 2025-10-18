"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * CTA Section
 * Call-to-action section encouraging users to start learning
 */
export function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 dark:from-teal-900 dark:via-cyan-900 dark:to-emerald-900">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <svg
          className="absolute left-0 top-0 h-full w-64 opacity-10"
          viewBox="0 0 100 100"
        >
          <defs>
            <pattern
              id="cta-pattern"
              x="0"
              y="0"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#cta-pattern)" />
        </svg>

        {/* Floating Circles */}
        <div className="absolute top-10 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">
            Commencez Votre Parcours
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Prêt à Développer Vos Compétences ?
        </h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Rejoignez plus de 1,250 étudiants qui ont déjà transformé leur
          carrière grâce à nos formations de qualité
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/a-propos">
            <Button
              size="lg"
              className="bg-white text-teal-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group px-8"
            >
              En Savoir Plus
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-teal-600 hover:bg-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
            >
              Contactez-nous
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Formations Professionnelles</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Certificats Reconnus</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Suivi Personnalisé</span>
          </div>
        </div>
      </div>
    </section>
  );
}
