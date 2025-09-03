'use client';

import {
  Calculator,
  Receipt,
  User,
  Shield,
  Users,
  MessageCircle,
  Gift,
  Settings,
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

const actions: ActionItem[] = [
  { id: 'settlement', title: '정산', icon: Calculator },
  { id: 'history', title: '수당내역', icon: Receipt },
  { id: 'account', title: '내 계정', icon: User },
  { id: 'security', title: '보안설정', icon: Shield },
  { id: 'partner', title: '파트너', icon: Users },
  { id: 'support', title: '고객문의', icon: MessageCircle },
  { id: 'benefits', title: '혜택', icon: Gift },
  { id: 'settings', title: '설정', icon: Settings },
];

export function QuickActions() {
  return (
    <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
      <h2 className="text-[color:var(--text)] font-semibold text-base mb-4">
        빠른 액션
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="flex flex-col items-center justify-center p-4 bg-[color:var(--bg)] rounded-[var(--radius-card)] hover:opacity-80 transition-opacity min-h-[88px]"
              aria-label={action.title}
            >
              <Icon className="w-6 h-6 text-[color:var(--primary)] mb-2" />
              <span className="text-[color:var(--text)] text-sm font-medium text-center">
                {action.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
