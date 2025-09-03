'use client';

import React from 'react';
import ProfitTableSection from '@/components/ProfitTableSection';
import Navigation from '@/components/Navigation';

export default function ProfitStructurePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <ProfitTableSection />
      </main>
    </>
  );
} 