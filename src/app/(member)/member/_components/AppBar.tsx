'use client';

import { Bell } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface AppBarProps {
  userName?: string;
}

export function AppBar({ userName = '사용자' }: AppBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[color:var(--bg)] border-b border-slate-200/40">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* 좌측: 로고/이름 */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[color:var(--primary)] rounded-[var(--radius-btn)] flex items-center justify-center">
            <span className="text-[color:var(--primary-foreground)] text-sm font-semibold">
              {userName.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-[color:var(--text)] font-semibold text-base">
              {userName}님
            </h1>
            <p className="text-[color:var(--muted)] text-xs">
              안녕하세요!
            </p>
          </div>
        </div>

        {/* 우측: 알림 + 테마 토글 */}
        <div className="flex items-center space-x-2">
          <button
            className="w-10 h-10 rounded-[var(--radius-btn)] bg-[color:var(--card)] border border-slate-200/40 flex items-center justify-center hover:opacity-80 transition-opacity relative"
            aria-label="알림"
          >
            <Bell className="w-4 h-4 text-[color:var(--text)]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[color:var(--danger)] rounded-full" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
