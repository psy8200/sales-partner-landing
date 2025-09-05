'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import BenefitSection from '@/components/BenefitSection';
import RewardSection from '@/components/RewardSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

// 수익구조 스타일별 컴포넌트들
import ProfitTableSection from '@/components/ProfitTableSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <BenefitSection />
      <ProfitTableSection />
      <RewardSection />
      <CTASection />
      <Footer />
    </main>
  );
}
