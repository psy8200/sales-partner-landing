'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-10 h-10 rounded-[var(--radius-btn)] bg-[color:var(--card)] border border-slate-200/40 flex items-center justify-center"
        aria-label="테마 토글"
      >
        <div className="w-4 h-4 bg-[color:var(--muted)] rounded animate-pulse" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 rounded-[var(--radius-btn)] bg-[color:var(--card)] border border-slate-200/40 flex items-center justify-center hover:opacity-80 transition-opacity"
      aria-label={`${theme === 'dark' ? '라이트' : '다크'} 모드로 전환`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-[color:var(--text)]" />
      ) : (
        <Moon className="w-4 h-4 text-[color:var(--text)]" />
      )}
    </button>
  );
}
