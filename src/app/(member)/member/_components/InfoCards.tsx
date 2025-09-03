'use client';

import { ChevronRight } from 'lucide-react';

interface InfoItem {
  title: string;
  value: string;
  suffix?: string;
  href?: string;
}

interface InfoCardsProps {
  items: InfoItem[];
}

export function InfoCards({ items }: InfoCardsProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <button
          key={index}
          className="w-full bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
          aria-label={`${item.title} 보기`}
        >
          <div className="flex-1 text-left">
            <p className="text-[color:var(--muted)] text-sm mb-1">
              {item.title}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-[color:var(--text)] font-semibold text-base tabular-nums">
                {item.value}
              </p>
              {item.suffix && (
                <p className="text-[color:var(--primary)] text-sm">
                  {item.suffix}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[color:var(--muted)]" />
        </button>
      ))}
    </div>
  );
}
