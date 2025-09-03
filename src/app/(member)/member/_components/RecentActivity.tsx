'use client';

import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface ActivityItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  amount: string;
  isPositive?: boolean;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[color:var(--muted)] rounded-[var(--radius-btn)] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[color:var(--muted)] rounded animate-pulse" />
              <div className="h-3 bg-[color:var(--muted)] rounded animate-pulse w-2/3" />
            </div>
            <div className="h-6 bg-[color:var(--muted)] rounded animate-pulse w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-8 text-center">
      <Clock className="w-12 h-12 text-[color:var(--muted)] mx-auto mb-4" />
      <p className="text-[color:var(--text)] font-medium mb-2">
        최근 활동이 없습니다
      </p>
      <p className="text-[color:var(--muted)] text-sm">
        새로운 활동이 생기면 여기에 표시됩니다
      </p>
    </div>
  );
}

export function RecentActivity({ activities, isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-[color:var(--text)] font-semibold text-base">
          최근 활동
        </h2>
        <ActivitySkeleton />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-[color:var(--text)] font-semibold text-base">
          최근 활동
        </h2>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[color:var(--text)] font-semibold text-base">
        최근 활동
      </h2>
      
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity, index) => {
          const Icon = activity.icon;
          const isPositive = activity.isPositive ?? activity.amount.startsWith('+');
          
          return (
            <div
              key={index}
              className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[color:var(--bg)] rounded-[var(--radius-btn)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[color:var(--primary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-[color:var(--text)] font-medium text-sm">
                    {activity.title}
                  </p>
                  <p className="text-[color:var(--muted)] text-xs">
                    {activity.subtitle}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-[color:var(--success)]" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-[color:var(--danger)]" />
                  )}
                  <span
                    className={`font-semibold text-sm tabular-nums ${
                      isPositive
                        ? 'text-[color:var(--success)]'
                        : 'text-[color:var(--danger)]'
                    }`}
                  >
                    {activity.amount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
