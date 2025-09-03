'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatPoints } from '@/lib/format';
import { AppBar } from './_components/AppBar';
import { SummaryCard } from './_components/SummaryCard';
import { QuickActions } from './_components/QuickActions';
import { InfoCards } from './_components/InfoCards';
import { RecentActivity } from './_components/RecentActivity';
import { BottomTab } from './_components/BottomTab';

// 더미 데이터
const dummyData = {
  totalBalance: 15098995,
  monthlySpend: 15098995,
  pendingCount: 2,
  info: [
    { title: '이번 달 수당', value: '₩ 1,240,000' },
    { title: '보유 포인트', value: '52,300 P' },
    { title: '내 등급', value: 'GOLD', suffix: '혜택 보기' },
  ],
  recent: [
    {
      icon: ArrowUpRight,
      title: '수당 지급',
      subtitle: '9월 정산',
      amount: '+₩ 420,000',
      isPositive: true,
    },
    {
      icon: ArrowDownRight,
      title: '송금',
      subtitle: 'KB국민 110-***',
      amount: '-₩ 50,000',
      isPositive: false,
    },
  ],
};

export default function MemberHomePage() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-20">
      {/* 앱바 */}
      <AppBar userName="김성분" />

      {/* 메인 콘텐츠 */}
      <main className="px-4 py-6 space-y-6">
        {/* 요약 카드 */}
        <SummaryCard
          totalBalance={dummyData.totalBalance}
          monthlySpend={dummyData.monthlySpend}
          pendingCount={dummyData.pendingCount}
        />

        {/* 빠른 액션 */}
        <QuickActions />

        {/* 정보 카드 */}
        <div className="space-y-4">
          <h2 className="text-[color:var(--text)] font-semibold text-base">
            내 정보
          </h2>
          <InfoCards items={dummyData.info} />
        </div>

        {/* 최근 활동 */}
        <RecentActivity activities={dummyData.recent} />
      </main>

      {/* 하단 탭 */}
      <BottomTab
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
