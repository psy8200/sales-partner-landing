'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SimpleChart from '@/components/SimpleChart';

interface Activity {
  id: string;
  type: 'USER_REGISTRATION' | 'PARTNER_APPLICATION' | 'PARTNER_APPROVAL' | 'QUESTION_SUBMITTED' | 'SUGGESTION_SUBMITTED';
  title: string;
  description: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalPartners: number;
  newPartnersThisMonth: number;
  conversionRate: number;
  consultationRequestsThisMonth: number;
  consultationsInProgress: number;
  approvedConsultationsThisMonth: number;
  approvalConversionRate: number;
}

const AdminDashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('month');
  const [adminStatus, setAdminStatus] = useState<string>('확인 중...');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // AdminGuard에서 이미 인증을 처리하므로 상태를 직접 설정
        setAdminStatus('✅ 어드민 로그인 완료');
        
        // 통계 데이터와 활동 데이터를 병렬로 가져오기
        const [statsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/activities/recent?limit=10')
        ]);

        if (!statsResponse.ok || !activitiesResponse.ok) {
          throw new Error('데이터를 가져오는데 실패했습니다.');
        }

        const [statsData, activitiesData] = await Promise.all([
          statsResponse.json(),
          activitiesResponse.json()
        ]);

        setStats(statsData);
        setActivities(activitiesData.activities || []);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'USER_REGISTRATION':
        return '👤';
      case 'PARTNER_APPLICATION':
        return '📝';
      case 'PARTNER_APPROVAL':
        return '✅';
      case 'QUESTION_SUBMITTED':
        return '❓';
      case 'SUGGESTION_SUBMITTED':
        return '💡';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'USER_REGISTRATION':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'PARTNER_APPLICATION':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      case 'PARTNER_APPROVAL':
        return 'bg-gradient-to-r from-purple-400 to-violet-500';
      case 'QUESTION_SUBMITTED':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'SUGGESTION_SUBMITTED':
        return 'bg-gradient-to-r from-pink-400 to-rose-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-slate-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}시간 전`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}일 전`;
    }
  };

  const StatCard = ({ title, value, change, icon, color }: {
    title: string;
    value: string | number;
    change?: string;
    icon: string;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' 
              ? title === '전환율' 
                ? `${value.toLocaleString()}%` 
                : value.toLocaleString()
              : value}
          </p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <span className="mr-1">↗</span>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const QuickActionButton = ({ title, href, icon, color }: {
    title: string;
    href: string;
    icon: string;
    color: string;
  }) => (
    <Link
      href={href}
      className={`${color} rounded-lg p-4 text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-90">바로가기</p>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">대시보드 데이터를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🏢 세일즈 파트너 어드민</h1>
            <p className="text-blue-100 mt-1">시스템 현황을 한눈에 확인하세요</p>
            {/* 어드민 상태 표시 */}
            <div className="mt-2 p-2 bg-blue-500 bg-opacity-30 rounded-lg">
              <p className="text-sm font-medium">{adminStatus}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-200">마지막 업데이트</p>
              <p className="font-medium">{new Date().toLocaleString('ko-KR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 회원 수"
          value={stats?.totalUsers || 0}
          change="이번 달 +12%"
          icon="👥"
          color="bg-gradient-to-r from-blue-400 to-indigo-500"
        />
        <StatCard
          title="파트너 수"
          value={stats?.totalPartners || 0}
          change={`이번 달 +${stats?.newPartnersThisMonth || 0}`}
          icon="🤝"
          color="bg-gradient-to-r from-green-400 to-emerald-500"
        />
        <StatCard
          title="전환율"
          value={stats?.conversionRate || 0}
          icon="📈"
          color="bg-gradient-to-r from-purple-400 to-violet-500"
        />
        <StatCard
          title="진행중인 상담"
          value={stats?.consultationsInProgress || 0}
          icon="📋"
          color="bg-gradient-to-r from-orange-400 to-red-500"
        />
      </div>

      {/* 빠른 액션 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ 빠른 액션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            title="회원 관리"
            href="/admin/members"
            icon="👥"
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <QuickActionButton
            title="상담 관리"
            href="/admin/contracts"
            icon="📝"
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <QuickActionButton
            title="아이템 관리"
            href="/admin/items"
            icon="🧩"
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <QuickActionButton
            title="정산 관리"
            href="/admin/settlements"
            icon="💼"
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* 최근 활동 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">📋 최근 활동</h2>
              <p className="text-sm text-gray-600 mt-1">시스템에서 발생한 최근 활동들을 확인하세요</p>
            </div>
                         <div className="flex items-center space-x-2">
               <label htmlFor="timeRange" className="text-sm text-gray-600">기간:</label>
               <select
                 id="timeRange"
                 value={selectedTimeRange}
                 onChange={(e) => setSelectedTimeRange(e.target.value as 'today' | 'week' | 'month')}
                 className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
                 aria-label="활동 기간 선택"
               >
                                 <option key="admin-today" value="today">오늘</option>
                <option key="admin-week" value="week">이번 주</option>
                <option key="admin-month" value="month">이번 달</option>
               </select>
             </div>
          </div>
        </div>
        
        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <div className="text-gray-500 text-lg">아직 활동이 없습니다</div>
              <div className="text-gray-400 text-sm mt-2">새로운 활동이 발생하면 여기에 표시됩니다.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div 
                  key={`activity-${activity.id || idx}-${idx}`} 
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-lg">{getActivityIcon(activity.type)}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-500 mt-1">
                        사용자: {activity.user.name} ({activity.user.email})
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activities.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/admin/activities"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>모든 활동 보기</span>
                <span className="ml-2">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>

             {/* 차트 및 상세 통계 섹션 */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <SimpleChart
             title="📈 이번 달 활동 현황"
             data={[
               { label: '신규 회원', value: stats?.totalUsers || 0, color: 'bg-blue-500' },
               { label: '파트너 신청', value: stats?.consultationRequestsThisMonth || 0, color: 'bg-green-500' },
               { label: '승인 완료', value: stats?.approvedConsultationsThisMonth || 0, color: 'bg-purple-500' },
               { label: '진행중', value: stats?.consultationsInProgress || 0, color: 'bg-orange-500' },
             ]}
             height={150}
           />
         </div>
         
         <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 시스템 상태</h3>
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">데이터베이스</span>
                 <span className="flex items-center text-green-600">
                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                   정상
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">API 서버</span>
                 <span className="flex items-center text-green-600">
                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                   정상
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">메모리 사용량</span>
                 <span className="text-sm text-gray-900">45%</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">디스크 사용량</span>
                 <span className="text-sm text-gray-900">23%</span>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 이번 달 성과</h3>
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">신규 회원</span>
                 <span className="font-medium text-gray-900">+{stats?.newPartnersThisMonth || 0}명</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">상담 신청</span>
                 <span className="font-medium text-gray-900">{stats?.consultationRequestsThisMonth || 0}건</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">승인율</span>
                 <span className="font-medium text-gray-900">{stats?.approvalConversionRate || 0}%</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">평균 처리 시간</span>
                 <span className="font-medium text-gray-900">2.3일</span>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

export default AdminDashboard;


