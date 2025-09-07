'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Calculator, 
  User, 
  Users, 
  MessageCircle, 
  Gift, 
  Clock,
  Home,
  Menu
} from 'lucide-react';

import { getLevelIcon } from '@/lib/levelIcons';
import { formatNumber } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  partnerStatus: string;
  points: number;
  level: number;
  finalPoints: number;
  monthlyReferrals: number;
  totalReferrals: number;
  levelIcon: string;
  levelName: string;
  isMaxLevel: boolean;
  remainingReferrals: number;
  currentLevel: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  settlementCycle: string;
  createdAt: string;
  status: string;
  isActive: boolean;
}

interface PointSummary {
  total: number;
  withdrawable: number;
  scheduled: number;
  totalPaid: number;
}

interface StatsData {
  monthlyExpectedIncome?: { value: number };
  cashback?: { value: number };
  referralIncome?: { value: number };
}

interface Inquiry {
  id: string;
  title: string;
  content: string;
  answer: string;
  status: string;
  createdAt: string;
  answeredAt: string;
}

// 실제 활동 데이터 타입
interface RealActivity {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  amount: string;
  isPositive: boolean;
  date: string;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pointSummary, setPointSummary] = useState<PointSummary>({
    total: 0,
    withdrawable: 0,
    scheduled: 0,
    totalPaid: 0,
  });
  const [statsData, setStatsData] = useState<StatsData>({});
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activities, setActivities] = useState<RealActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newInquiry, setNewInquiry] = useState({ title: '', content: '' });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('home');

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // user 객체 안에서 사용자 데이터 가져오기
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        setError('사용자 정보를 불러올 수 없습니다.');
      }
    };

    fetchUser();
  }, [router]);

  // 포인트 요약 조회
  useEffect(() => {
    if (!user) return;

    const fetchPointSummary = async () => {
      try {
        const response = await fetch('/api/points/summary');
        if (response.ok) {
          const data = await response.json();
          setPointSummary(data);
        }
      } catch (error) {
        console.error('포인트 요약 조회 실패:', error);
      }
    };

    fetchPointSummary();
  }, [user]);

  // 통계 데이터 조회
  useEffect(() => {
    if (!user) return;

    const fetchStatsData = async () => {
      try {
        const response = await fetch('/api/mypage/stats');
        if (response.ok) {
          const data = await response.json();
          setStatsData(data);
        }
      } catch (error) {
        console.error('통계 데이터 조회 실패:', error);
      }
    };

    fetchStatsData();
  }, [user]);

  // 활동 데이터 조회
  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/mypage/activities');
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('활동 데이터 조회 실패:', error);
      }
    };

    fetchActivities();
  }, [user]);

  // 문의 내역 조회
  useEffect(() => {
    if (!user) return;

    const fetchInquiries = async () => {
      try {
        const response = await fetch('/api/inquiries');
        if (response.ok) {
          const data = await response.json();
          setInquiries(data.inquiries || []);
        }
      } catch (error) {
        console.error('문의 내역 조회 실패:', error);
      }
    };

    fetchInquiries();
    setLoading(false);
  }, [user]);

  // 문의 제출
  const handleInquirySubmit = async () => {
    if (!newInquiry.title.trim() || !newInquiry.content.trim()) return;

    setSubmitStatus('loading');

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry),
      });

      if (response.ok) {
        setNewInquiry({ title: '', content: '' });
        setSubmitStatus('success');
        
        // 문의 목록 새로고침
        const inquiriesResponse = await fetch('/api/inquiries');
        if (inquiriesResponse.ok) {
          const data = await inquiriesResponse.json();
          setInquiries(data.inquiries || []);
        }
        
        // 3초 후 성공 상태 초기화
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('문의 제출 실패:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--primary)] mx-auto mb-4"></div>
          <p className="text-[color:var(--muted)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[color:var(--danger)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] rounded-[var(--radius-btn)] hover:opacity-90"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-24">
      {/* 상단 여백 추가 */}
      <div className="h-4"></div>
      
      {/* 앱바 */}
      <header className="bg-[color:var(--bg)] border-b border-slate-200/40">
        <div className="px-4 py-4">
          {/* 환영 메시지 */}
          <div className="mb-3">
            <h1 className="text-[color:var(--text)] font-semibold text-lg">
              <span className="text-2xl font-bold">{user?.name || '사용자'}</span>님 환영합니다.
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mt-2">
              <p className="text-sm text-green-600 font-medium">
                {user?.role === 'MEMBER' ? '파트너' : '일반회원'}
                {user?.partnerStatus === 'APPROVED' && ' • 승인완료'}
              </p>
              {user?.role === 'GENERAL' && (
                <button
                  onClick={() => router.push('/partner-apply')}
                  className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] text-sm px-4 py-2 rounded-[var(--radius-btn)] font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                  파트너신청
                </button>
              )}
            </div>
          </div>

          {/* 결정포인트 정보 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <p className="text-[color:var(--text)] text-sm font-medium text-center">
              나의 기준포인트: <span className="text-xl font-bold text-blue-600">{formatNumber(user?.finalPoints || 0)}</span>P
            </p>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-4 py-4 space-y-4">

        {/* 총 지급수수료 박스 */}
        {user?.role === 'MEMBER' && (
          <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
            <div className="flex justify-between items-center">
              <p className="text-[color:var(--text)] text-base font-semibold">총 지급수수료</p>
              <div className="text-right">
                <span className="text-[color:var(--text)] text-xl font-bold tabular-nums">
                  {formatNumber((pointSummary.total || user?.points || 0) + (statsData?.monthlyExpectedIncome?.value || 0) + inquiries.filter(i => i.status === 'PENDING').length)}P
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 요약 카드 */}
        {user?.role === 'MEMBER' && (
          <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* 캐쉬백 */}
              <div>
                <p className="text-blue-600 text-sm mb-1 font-medium">캐쉬백</p>
                <div className="text-right">
                  <span className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                    {formatNumber(pointSummary.total || user?.points || 0)}P
                  </span>
                </div>
              </div>

              {/* 트리수당 */}
              <div>
                <p className="text-green-600 text-sm mb-1 font-medium">트리수당</p>
                <div className="text-right">
                  <span className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                    {formatNumber(statsData?.monthlyExpectedIncome?.value || 0)}P
                  </span>
                </div>
              </div>

              {/* 추천수당 */}
              <div>
                <p className="text-purple-600 text-sm mb-1 font-medium">추천수당</p>
                <div className="text-right">
                  <span className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                    {formatNumber(inquiries.filter(i => i.status === 'PENDING').length)}P
                  </span>
                </div>
              </div>

              {/* 추천매칭 */}
              <div>
                <p className="text-orange-600 text-sm mb-1 font-medium">추천매칭</p>
                <div className="text-right">
                  <span className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                    0P
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}



                          {/* 정보 카드 */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
            <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
              <p className="text-[color:var(--muted)] text-sm mb-1">총 누적수익</p>
              <p className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                {formatNumber((pointSummary.total || user?.points || 0) + (statsData?.monthlyExpectedIncome?.value || 0) + inquiries.filter(i => i.status === 'PENDING').length)}P
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
                <p className="text-[color:var(--muted)] text-sm mb-1">이번달추천인수</p>
                <p className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                  {user?.monthlyReferrals || 0}명
                </p>
              </div>

              <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
                <p className="text-[color:var(--muted)] text-sm mb-1">총추천인수</p>
                <p className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                  {user?.totalReferrals || 0}명
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-3">
                <p className="text-[color:var(--muted)] text-sm mb-1">현재등급</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{user?.levelIcon || '🥚'}</span>
                  <p className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                    {user?.levelName || '알'}
                  </p>
                </div>
              </div>

              <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-3">
                <p className="text-[color:var(--muted)] text-sm mb-1">승급기준</p>
                <div className="flex items-center justify-between">
                  <p className="text-[color:var(--text)] text-sm font-medium tabular-nums">
                    {user?.isMaxLevel ? '최고등급' : `다음승급까지 ${user?.remainingReferrals || 0}명`}
                  </p>
                  {!user?.isMaxLevel && (
                    <span className="text-2xl opacity-60">
                      {user?.currentLevel !== undefined ? getLevelIcon(user.currentLevel + 1) : '🥚'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="space-y-4">
          <h2 className="text-[color:var(--text)] font-semibold text-base">
            최근 활동
          </h2>
          
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-8 text-center">
                <Clock className="w-12 h-12 text-[color:var(--muted)] mx-auto mb-4" />
                <p className="text-[color:var(--text)] font-medium mb-2">
                  활동 내역이 없습니다
                </p>
                <p className="text-[color:var(--muted)] text-sm">
                  새로운 활동이 생기면 여기에 표시됩니다
                </p>
              </div>
            ) : (
              activities.map((activity) => {
                // 아이콘 컴포넌트 동적 렌더링
                const getIconComponent = (iconName: string) => {
                  switch (iconName) {
                    case 'ArrowUpRight': return ArrowUpRight;
                    case 'ArrowDownRight': return ArrowDownRight;
                    case 'MessageCircle': return MessageCircle;
                    default: return ArrowUpRight;
                  }
                };
                
                const IconComponent = getIconComponent(activity.icon);
                
                return (
                  <div
                    key={activity.id}
                    className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[color:var(--bg)] rounded-[var(--radius-btn)] flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-[color:var(--primary)]" />
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
                        {activity.isPositive ? (
                          <ArrowUpRight className="w-4 h-4 text-[color:var(--success)]" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-[color:var(--danger)]" />
                        )}
                        <span
                          className={`font-semibold text-sm tabular-nums ${
                            activity.isPositive
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
              })
            )}
          </div>
        </div>

        {/* 문의 내역 */}
        <div className="space-y-4">
          <h2 className="text-[color:var(--text)] font-semibold text-base">
            문의 내역
          </h2>
          
          {/* 새 문의 작성 */}
          <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
            <h3 className="text-sm font-medium text-[color:var(--text)] mb-3">새 문의 작성</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={newInquiry.title}
                onChange={(e) => setNewInquiry({ ...newInquiry, title: e.target.value })}
                className="w-full px-4 py-3 bg-[color:var(--bg)] rounded-[var(--radius-btn)] border border-slate-200/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent text-[color:var(--text)]"
              />
              <textarea
                placeholder="내용을 입력하세요"
                value={newInquiry.content}
                onChange={(e) => setNewInquiry({ ...newInquiry, content: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[color:var(--bg)] rounded-[var(--radius-btn)] border border-slate-200/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent resize-none text-[color:var(--text)]"
              />
              <button
                onClick={handleInquirySubmit}
                disabled={submitStatus === 'loading'}
                className={`w-full py-3 px-4 rounded-[var(--radius-btn)] font-medium transition-opacity ${
                  submitStatus === 'loading'
                    ? 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)] cursor-not-allowed'
                    : submitStatus === 'success'
                    ? 'bg-[color:var(--success)] text-[color:var(--success-foreground)]'
                    : submitStatus === 'error'
                    ? 'bg-[color:var(--danger)] text-[color:var(--danger-foreground)]'
                    : 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90'
                }`}
              >
                {submitStatus === 'loading' ? '제출 중...' : 
                 submitStatus === 'success' ? '제출 완료!' : 
                 submitStatus === 'error' ? '제출 실패' : 
                 '문의 제출'}
              </button>
            </div>
          </div>

          {/* 문의 목록 */}
          <div className="space-y-3">
            {!inquiries || !Array.isArray(inquiries) || inquiries.length === 0 ? (
              <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-8 text-center">
                <Clock className="w-12 h-12 text-[color:var(--muted)] mx-auto mb-4" />
                <p className="text-[color:var(--text)] font-medium mb-2">
                  문의 내역이 없습니다
                </p>
                <p className="text-[color:var(--muted)] text-sm">
                  새로운 문의가 생기면 여기에 표시됩니다
                </p>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-[color:var(--text)] truncate">{inquiry.title}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inquiry.status === 'ANSWERED'
                          ? 'bg-[color:var(--success)]/10 text-[color:var(--success)]'
                          : 'bg-[color:var(--warning)]/10 text-[color:var(--warning)]'
                      }`}
                    >
                      {inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                    </span>
                  </div>
                  <p className="text-sm text-[color:var(--muted)] mb-2 line-clamp-2">{inquiry.content}</p>
                  
                  {/* 답변 내용 표시 */}
                  {inquiry.answer && (
                    <div className="mt-3 p-3 bg-[color:var(--success)]/5 border border-[color:var(--success)]/20 rounded-[var(--radius-btn)]">
                      <div className="flex items-center mb-2">
                        <span className="text-xs font-medium text-[color:var(--success)]">관리자 답변</span>
                        {inquiry.answeredAt && (
                          <span className="text-xs text-[color:var(--muted)] ml-2">
                            {new Date(inquiry.answeredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[color:var(--text)] whitespace-pre-wrap">{inquiry.answer}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-[color:var(--muted)] mt-2">
                    <span>작성일: {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 하단 탭 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[color:var(--card)] border-t border-slate-200/40 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          {[
            { id: 'home', label: '홈', icon: Home },
            { id: 'benefits', label: '혜택', icon: Gift },
            { id: 'settlement', label: '정산', icon: Calculator },
            { id: 'partner', label: '파트너', icon: Users },
            { id: 'more', label: '전체', icon: Menu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            
            return (
              <Link
                key={tab.id}
                href={tab.id === 'home' ? '/mypage' : `/${tab.id}`}
                className="flex flex-col items-center justify-center py-2 px-3 min-h-[44px] min-w-[44px] rounded-[var(--radius-btn)] transition-colors"
                aria-label={tab.label}
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
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
