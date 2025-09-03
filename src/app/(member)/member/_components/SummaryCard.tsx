'use client';

import { formatCurrency, formatNumber } from '@/lib/format';

interface SummaryCardProps {
  totalBalance: number;
  monthlySpend: number;
  pendingCount: number;
}

export function SummaryCard({ totalBalance, monthlySpend, pendingCount }: SummaryCardProps) {
  return (
    <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
      {/* 메인 잔액 */}
      <div className="mb-4">
        <p className="text-[color:var(--muted)] text-sm mb-1">총 잔액</p>
        <p className="text-[color:var(--text)] text-3xl font-bold tabular-nums">
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {/* 월 지출 */}
      <div className="mb-4">
        <p className="text-[color:var(--muted)] text-sm mb-1">이번 달 지출</p>
        <p className="text-[color:var(--text)] text-lg font-semibold tabular-nums">
          {formatCurrency(monthlySpend)}
        </p>
      </div>

      {/* 대기 중인 건수 */}
      <div className="mb-4">
        <p className="text-[color:var(--muted)] text-sm mb-1">대기 중인 건수</p>
        <p className="text-[color:var(--text)] text-lg font-semibold tabular-nums">
          {formatNumber(pendingCount)}건
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-[var(--radius-btn)] py-2 px-3 text-sm font-medium hover:opacity-90 transition-opacity">
          충전
        </button>
        <button className="flex-1 bg-[color:var(--card)] text-[color:var(--text)] border border-slate-200/40 rounded-[var(--radius-btn)] py-2 px-3 text-sm font-medium hover:opacity-80 transition-opacity">
          송금
        </button>
      </div>
    </div>
  );
}
