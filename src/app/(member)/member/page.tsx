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
import { BottomTab } from './_components/BottomTab';
import PartnerOnlyModal from '@/components/PartnerOnlyModal';

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


export default function MemberHomePage() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [newInquiry, setNewInquiry] = useState({ title: '', content: '' });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('home');

  // 하단 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    console.log('📱 PWA 하단 탭 변경:', tabId);
    setActiveTab(tabId);
    
    // PWA 환경에서 부모 창에 탭 변경 알림
    if (window.parent !== window) {
      window.parent.postMessage({ 
        type: 'PWA_TAB_CHANGE', 
        tabId: tabId 
      }, '*');
    }

    // 실제 페이지 이동 로직
    switch (tabId) {
      case 'home':
        router.push('/member');
        break;
      case 'benefits':
        router.push('/benefits');
        break;
      case 'settlement':
        router.push('/settlement');
        break;
      case 'partner':
        router.push('/partner');
        break;
      case 'more':
        router.push('/profile');
        break;
      default:
        console.log('알 수 없는 탭:', tabId);
    }
  };

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // user 객체 안에서 사용자 데이터 가져오기
        } else {
          // PWA 환경 감지하여 적절한 로그인 페이지로 이동
          const isPwaEnvironment = window.parent !== window || window.location.pathname.includes('/pwa-');
          router.push(isPwaEnvironment ? '/pwa-login' : '/login');
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


  // 문의 내역 조회
  useEffect(() => {
    if (!user) return;

    const fetchInquiries = async () => {
      try {
        console.log('=== PWA 문의 내역 조회 시작 ===');
        const response = await fetch('/api/inquiries');
        console.log('PWA 문의 API 응답 상태:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 PWA 문의 API 응답 데이터:', data);
          console.log('🔍 PWA data.data:', data.data);
          console.log('🔍 PWA data.data?.inquiries:', data.data?.inquiries);
          
          // API 응답 구조: { success: true, data: { inquiries: [...] } }
          const inquiries = data.data?.inquiries || [];
          console.log('🔍 PWA 최종 inquiries 배열:', inquiries);
          console.log('🔍 PWA inquiries 길이:', inquiries.length);
          
          setInquiries(inquiries);
          console.log('✅ PWA 문의 목록 설정 완료:', inquiries);
        } else {
          const errorData = await response.json();
          console.error('PWA 문의 내역 조회 실패:', response.status, errorData);
        }
      } catch (error) {
        console.error('PWA 문의 내역 조회 실패:', error);
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
        const result = await response.json();
        console.log('문의 제출 성공:', result);
        
        // 폼 초기화
        setNewInquiry({ title: '', content: '' });
        setSubmitStatus('success');
        
        // 즉시 문의 목록 새로고침
        const inquiriesResponse = await fetch('/api/inquiries');
        if (inquiriesResponse.ok) {
          const data = await inquiriesResponse.json();
          // API 응답 구조: { success: true, data: { inquiries: [...] } }
          const inquiries = data.data?.inquiries || [];
          setInquiries(inquiries);
          console.log('문의 목록 업데이트됨:', inquiries);
          
          // 문의 목록으로 스크롤 이동
          setTimeout(() => {
            const inquiryList = document.querySelector('[data-inquiry-list]');
            if (inquiryList) {
              inquiryList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
        
        // 2초 후 성공 상태 초기화
        setTimeout(() => setSubmitStatus('idle'), 2000);
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
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-24 pt-4">
      {/* 앱바 */}
      <header className="bg-[color:var(--bg)] border-b border-slate-200/40">
        <div className="px-4 py-2">
          {/* 사용자 정보 - 밝은 하늘색 그라데이션 */}
          <div className="mb-0 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1">
                  {user?.name || '사용자'}님 <span className="text-sm font-normal">환영합니다</span>
                </h1>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {user?.role === 'MEMBER' ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <span className={`text-sm ${user?.role === 'MEMBER' ? 'text-green-600' : 'text-blue-600'}`}>
                        {user?.role === 'MEMBER' ? '파트너 회원' : '일반 회원'}
                      </span>
                    </div>
                  </div>
                  {user?.role === 'GENERAL' && user?.partnerStatus === 'PARTNER_APPLIED' && (
                    <span className="text-xs font-bold text-amber-600">
                      파트너승인대기중
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                {user?.role === 'GENERAL' && user?.partnerStatus === 'NOT_APPLIED' && (
                  <button
                    onClick={() => router.push('/partner-apply')}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    파트너회원으로<br />신청/전환하기
                  </button>
                )}
                {user?.role === 'GENERAL' && user?.partnerStatus === 'PARTNER_APPLIED' && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      나의 기준포인트
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatNumber(user?.finalPoints || 0)}P
                    </div>
                  </div>
                )}
                {user?.role === 'MEMBER' && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      나의 기준포인트
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatNumber(user?.points || 0)}P
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-4 py-2 pt-2 space-y-1">

        {/* 총 지급수수료 박스 */}
        <div 
          className={`bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4 transition-all duration-200 ${
            user?.role === 'MEMBER' 
              ? 'opacity-100' 
              : 'opacity-40 cursor-pointer hover:opacity-60'
          }`}
          onClick={() => {
            if (user?.role !== 'MEMBER') {
              setShowPartnerModal(true);
            }
          }}
        >
          <div className="flex justify-between items-center">
            <p className="text-[color:var(--text)] text-base font-semibold">이번달 지급수익</p>
            <div className="text-right">
              <span className="text-[color:var(--text)] text-xl font-bold tabular-nums">
                {user?.role === 'MEMBER' 
                  ? formatNumber((pointSummary.total || user?.points || 0) + (statsData?.monthlyExpectedIncome?.value || 0) + inquiries.filter(i => i.status === 'PENDING').length)
                  : '0'
                }P
              </span>
            </div>
          </div>
          {user?.role !== 'MEMBER' && (
            <div className="mt-2 text-xs text-blue-600 font-medium">
              💡 파트너회원 전용 기능
            </div>
          )}
        </div>

        {/* 요약 카드 */}
        <div 
          className={`bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4 transition-all duration-200 ${
            user?.role === 'MEMBER' 
              ? 'opacity-100' 
              : 'opacity-40 cursor-pointer hover:opacity-60'
          }`}
          onClick={() => {
            if (user?.role !== 'MEMBER') {
              setShowPartnerModal(true);
            }
          }}
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* 캐쉬백 */}
            <div>
              <p className="text-blue-600 text-sm mb-1 font-medium">캐쉬백</p>
              <div className="text-right">
                <span className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                  {user?.role === 'MEMBER' 
                    ? formatNumber(pointSummary.total || user?.points || 0)
                    : '0'
                  }P
                </span>
              </div>
            </div>

            {/* 트리수당 */}
            <div>
              <p className="text-green-600 text-sm mb-1 font-medium">트리수당</p>
              <div className="text-right">
                <span className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                  {user?.role === 'MEMBER' 
                    ? formatNumber(statsData?.monthlyExpectedIncome?.value || 0)
                    : '0'
                  }P
                </span>
              </div>
            </div>

            {/* 추천수당 */}
            <div>
              <p className="text-purple-600 text-sm mb-1 font-medium">추천수당</p>
              <div className="text-right">
                <span className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                  {user?.role === 'MEMBER' 
                    ? formatNumber(inquiries.filter(i => i.status === 'PENDING').length)
                    : '0'
                  }P
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
          {user?.role !== 'MEMBER' && (
            <div className="text-center text-xs text-blue-600 font-medium">
              💡 파트너회원 전용 기능
            </div>
          )}
        </div>

        {/* 정보 카드 */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div 
              className={`bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4 transition-all duration-200 ${
                user?.role === 'MEMBER' 
                  ? 'opacity-100' 
                  : 'opacity-40 cursor-pointer hover:opacity-60'
              }`}
              onClick={() => {
                if (user?.role !== 'MEMBER') {
                  setShowPartnerModal(true);
                }
              }}
            >
              <p className="text-[color:var(--muted)] text-sm mb-1">총 누적지급 수수료</p>
              <p className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                {user?.role === 'MEMBER' 
                  ? formatNumber((pointSummary.total || user?.points || 0) + (statsData?.monthlyExpectedIncome?.value || 0) + inquiries.filter(i => i.status === 'PENDING').length)
                  : '0'
                }P
              </p>
              {user?.role !== 'MEMBER' && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  💡 파트너회원 전용 기능
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4 transition-all duration-200 ${
                  user?.role === 'MEMBER' 
                    ? 'opacity-100' 
                    : 'opacity-40 cursor-pointer hover:opacity-60'
                }`}
                onClick={() => {
                  if (user?.role !== 'MEMBER') {
                    setShowPartnerModal(true);
                  }
                }}
              >
                <p className="text-[color:var(--muted)] text-sm mb-1">이번달추천인수</p>
                <p className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                  {user?.role === 'MEMBER' 
                    ? (user?.monthlyReferrals || 0)
                    : '0'
                  }명
                </p>
                {user?.role !== 'MEMBER' && (
                  <div className="mt-1 text-xs text-blue-600 font-medium">
                    💡 파트너 전용
                  </div>
                )}
              </div>

              <div 
                className={`bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4 transition-all duration-200 ${
                  user?.role === 'MEMBER' 
                    ? 'opacity-100' 
                    : 'opacity-40 cursor-pointer hover:opacity-60'
                }`}
                onClick={() => {
                  if (user?.role !== 'MEMBER') {
                    setShowPartnerModal(true);
                  }
                }}
              >
                <p className="text-[color:var(--muted)] text-sm mb-1">총추천인수</p>
                <p className="text-[color:var(--text)] text-lg font-bold tabular-nums">
                  {user?.role === 'MEMBER' 
                    ? (user?.totalReferrals || 0)
                    : '0'
                  }명
                </p>
                {user?.role !== 'MEMBER' && (
                  <div className="mt-1 text-xs text-blue-600 font-medium">
                    💡 파트너 전용
                  </div>
                )}
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


        {/* 문의 내역 */}
        <div className="space-y-4">
          <h2 className="text-[color:var(--text)] font-semibold text-base flex items-center">
            <span className="text-2xl mr-2">💬</span>
            무엇이든 물어보세요. 문의하기
          </h2>
          
          {/* 새 문의 작성 */}
          <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] shadow-sm p-4">
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
                className={`w-full py-3 px-5 rounded-lg font-semibold text-base shadow-md transition-all duration-200 transform hover:scale-105 ${
                  submitStatus === 'loading'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : submitStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : submitStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
                }`}
              >
                {submitStatus === 'loading' ? '제출 중...' : 
                 submitStatus === 'success' ? '제출 완료!' : 
                 submitStatus === 'error' ? '제출 실패' : 
                 '문의하기 입력완료'}
              </button>
            </div>
          </div>

          {/* 문의 목록 */}
          <div className="space-y-3" data-inquiry-list>
            {(() => {
              console.log('🔍 PWA 렌더링 시 inquiries 상태:', inquiries);
              console.log('🔍 PWA inquiries 타입:', typeof inquiries);
              console.log('🔍 PWA Array.isArray(inquiries):', Array.isArray(inquiries));
              console.log('🔍 PWA inquiries.length:', inquiries?.length);
              return null;
            })()}
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
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* 문의 헤더 */}
                  <div className="p-6 border-b border-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">{inquiry.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{inquiry.content}</p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ml-4 flex-shrink-0 ${
                          inquiry.status === 'ANSWERED'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}
                      >
                        {inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  {/* 관리자 답변 */}
                  {inquiry.answer && (
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-900">관리자</p>
                          <p className="text-xs text-blue-600">
                            {new Date(inquiry.answeredAt || inquiry.updatedAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                        <p className="text-gray-800 leading-relaxed">{inquiry.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 하단 탭 - PWA 전용 기능 유지 */}
      <BottomTab
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 파트너 전용 모달 */}
      <PartnerOnlyModal
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
      />
    </div>
  );
}
