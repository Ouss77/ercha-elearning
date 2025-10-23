import type React from "react";
import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HomeHeader />
      {children}
      <Footer />
    </>
  );
}
