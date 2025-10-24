"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface LogoProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "light" | "dark";
  href?: string;
}

export function Logo({
  className,
  iconSize = "md",
  showText = true,
  variant = "light",
  href = "/",
}: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-7 w-7",
    xl: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const textColorClass =
    variant === "dark"
      ? "bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent"
      : "bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent";

  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 group", className)}
    >
      <div
        className={cn(
          sizeClasses[iconSize],
          "bg-gradient-to-br from-teal-600 to-emerald-600 dark:from-teal-500 dark:to-emerald-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
        )}
      >
        <GraduationCap
          className={cn(iconSizeClasses[iconSize], "text-white")}
        />
      </div>
      {showText && (
        <span
          className={cn(
            textSizeClasses[iconSize],
            "font-bold transition-colors",
            textColorClass
          )}
        >
          EduPlatform
        </span>
      )}
    </Link>
  );
}
