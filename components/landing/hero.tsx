"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Hero Section for EduPlatform
 * Features:
 * - Large headline with gradient accent
 * - Search bar for course discovery
 * - Decorative background patterns
 * - Course count display
 * - Responsive layout
 */
export function Hero() {
  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-background dark:via-background/95 dark:to-background/90">
      {/* Decorative Grid Pattern - Left Side */}
      <div className="absolute left-8 top-20 md:left-16 md:top-32 opacity-30 pointer-events-none">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="120"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="30"
            y1="0"
            x2="30"
            y2="120"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="60"
            y1="0"
            x2="60"
            y2="120"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="90"
            y1="0"
            x2="90"
            y2="120"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="120"
            y1="0"
            x2="120"
            y2="120"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="0"
            x2="120"
            y2="0"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="30"
            x2="120"
            y2="30"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="60"
            x2="120"
            y2="60"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="90"
            x2="120"
            y2="90"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
          <line
            x1="0"
            y1="120"
            x2="120"
            y2="120"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-600 dark:text-teal-400"
          />
        </svg>
      </div>

      {/* Decorative Circle with Stripes - Right Side */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] md:w-[700px] md:h-[700px] -translate-y-1/4 translate-x-1/4 opacity-50 pointer-events-none">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 dark:from-teal-600 dark:to-emerald-600 opacity-20"></div>
          {/* Diagonal stripes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 700">
            <defs>
              <pattern
                id="stripes"
                patternUnits="userSpaceOnUse"
                width="20"
                height="20"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="20"
                  stroke="white"
                  strokeWidth="3"
                  className="dark:stroke-teal-500"
                />
              </pattern>
              <mask id="circle-mask">
                <circle cx="350" cy="350" r="340" fill="white" />
              </mask>
            </defs>
            <circle
              cx="350"
              cy="350"
              r="340"
              fill="url(#stripes)"
              mask="url(#circle-mask)"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-foreground mb-6 leading-tight">
            Développez vos compétences avec{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                EduPlatform
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 300 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5C80 1.5 160 1.5 299 5.5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-teal-600 dark:text-teal-400"
                />
              </svg>
            </span>
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-600 dark:text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Accédez à des cours de qualité, suivez votre progression en temps
            réel et validez vos acquis avec des quiz interactifs. Notre
            plateforme e-learning vous accompagne dans votre parcours de
            formation professionnelle.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-card shadow-2xl rounded-full p-2 border border-gray-200 dark:border-border">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="h-5 w-5 text-gray-400 dark:text-muted-foreground flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Que voulez-vous apprendre aujourd'hui ?"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-gray-400 dark:placeholder:text-muted-foreground"
                />
              </div>
              <Button
                size="lg"
                className="rounded-full px-8 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:from-teal-500 dark:to-emerald-500 text-white shadow-lg"
              >
                Rechercher
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Course Count */}
          <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-foreground">
            <span className="text-lg">Découvrez</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              15+
            </span>
            <span className="text-lg">cours dans 3 domaines clés</span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="px-8 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:from-teal-500 dark:to-emerald-500 text-white shadow-xl"
              asChild
            >
              <Link href="/a-propos">À Propos de Nous</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 border-2 border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
              asChild
            >
              <Link href="/contact">Contactez-nous</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements for Student Images (placeholders) */}
      <div className="absolute left-0 bottom-0 w-64 h-64 md:w-96 md:h-96 opacity-0 pointer-events-none">
        {/* Placeholder for left student image - can be replaced with actual image */}
      </div>
      <div className="absolute right-0 bottom-0 w-64 h-64 md:w-96 md:h-96 opacity-0 pointer-events-none">
        {/* Placeholder for right student image - can be replaced with actual image */}
      </div>
    </section>
  );
}

export default Hero;
