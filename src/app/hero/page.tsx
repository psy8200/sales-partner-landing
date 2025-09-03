'use client';

import React from 'react';
import HeroSection from '@/components/HeroSection';
import Navigation from '@/components/Navigation';

export default function HeroPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <HeroSection />
      </main>
    </>
  );
} 