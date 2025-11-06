"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/sections/hero-section";
import FeaturesSection from "@/components/sections/features-section";
import SpecialtiesSection from "@/components/sections/specialties-section";
import FooterSection from "@/components/sections/footer-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Popular Specialties */}
      <SpecialtiesSection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
