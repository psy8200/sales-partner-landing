'use client';

import { Home, Gift, Calculator, Users, Menu } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface BottomTabProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const tabs: TabItem[] = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'benefits', label: '혜택', icon: Gift },
  { id: 'settlement', label: '정산', icon: Calculator },
  { id: 'partner', label: '파트너', icon: Users },
  { id: 'more', label: '전체', icon: Menu },
];

export function BottomTab({ activeTab = 'home', onTabChange }: BottomTabProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[color:var(--card)] border-t border-slate-200/40 pb-safe">
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className="flex flex-col items-center justify-center py-2 px-3 min-h-[44px] min-w-[44px] rounded-[var(--radius-btn)] transition-colors"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 mb-1 ${
                  isActive
                    ? 'text-[color:var(--primary)]'
                    : 'text-[color:var(--muted)]'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? 'text-[color:var(--primary)]'
                    : 'text-[color:var(--muted)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
