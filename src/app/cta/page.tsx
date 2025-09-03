'use client';

import React from 'react';
import CTASection from '@/components/CTASection';
import Navigation from '@/components/Navigation';

export default function CTAPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <CTASection />
      </main>
    </>
  );
} 