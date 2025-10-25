"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset loading when route changes
    setIsLoading(false);
    setProgress(0);
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        !anchor.target &&
        anchor.href.startsWith(window.location.origin) &&
        anchor.href !== window.location.href
      ) {
        // Start loading
        setIsLoading(true);
        setProgress(0);

        // Simulate progress
        let currentProgress = 0;
        progressInterval = setInterval(() => {
          currentProgress += Math.random() * 30;
          if (currentProgress > 90) {
            currentProgress = 90;
            clearInterval(progressInterval);
          }
          setProgress(currentProgress);
        }, 200);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-primary/50 animate-pulse" />
      </div>
    </div>
  );
}
