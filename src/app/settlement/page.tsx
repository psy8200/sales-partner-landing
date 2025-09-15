'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Calendar, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Gift,
  Calculator,
  FileText,
  Banknote
} from 'lucide-react';
import { BottomTab } from '../(member)/member/_components/BottomTab';
import { formatNumber } from '@/lib/utils';

// 정산 데이터 타입 정의
interface SettlementData {
  id: string;
  month: string;
  totalAmount: number;
  basicSalary: number;
  recruitmentBonus: number;
  indirectBonus: number;
  dividendIncome: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  requestDate: string;
  completedDate?: string;
}

// 포인트 요약 타입
interface PointSummary {
  basicSalary: number; // 기본수당
  recruitmentBonus: number; // 모집수당
  indirectBonus: number; // 간접수당
  dividendIncome: number; // 배당수익
  total: number; // 총 수당
  withdrawable: number; // 출금 가능
  scheduled: number; // 정산 예정
  totalPaid: number; // 지급 완료
}

// 사용자 정보 타입
interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  finalPoints: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
}

const SettlementPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settlement');
  const [user, setUser] = useState<User | null>(null);
  const [pointSummary, setPointSummary] = useState<PointSummary>({
    basicSalary: 0,
    recruitmentBonus: 0,
    indirectBonus: 0,
    dividendIncome: 0,
    total: 0,
    withdrawable: 0,
    scheduled: 0,
    totalPaid: 0,
  });
  const [settlementHistory, setSettlementHistory] = useState<SettlementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
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

  // 정산 요약 조회
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSettlementSummary = async () => {
      try {
        console.log('🔍 정산 요약 조회 시작:', user.name, user.phone);
        
        // SettlementRecord 데이터 조회
        const response = await fetch(`/api/mypage/settlement-summary?userName=${encodeURIComponent(user.name)}&userPhone=${encodeURIComponent(user.phone)}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 정산 요약 조회 성공:', data);
          
          if (data.success && data.data) {
            const { summary, settlements } = data.data;
            
            // 포인트 요약 업데이트
            setPointSummary({
              basicSalary: summary.totalBasicCommission || 0,
              recruitmentBonus: summary.totalRecruitmentCommission || 0,
              indirectBonus: summary.totalIndirectCommission || 0,
              dividendIncome: summary.totalDividendCommission || 0,
              total: summary.totalCommission || 0,
              withdrawable: summary.withdrawableAmount || 0,
              scheduled: summary.scheduledAmount || 0,
              totalPaid: summary.totalPaid || 0,
            });
            
            // 정산 이력 업데이트
            setSettlementHistory(settlements || []);
            
            console.log('📊 정산 데이터 업데이트 완료:', {
              total: summary.totalCommission,
              withdrawable: summary.withdrawableAmount,
              scheduled: summary.scheduledAmount,
              historyCount: settlements?.length || 0
            });
          } else {
            console.log('⚠️ API 응답에서 데이터를 찾을 수 없음');
            // 기본값 설정
            setPointSummary({
              basicSalary: 0,
              recruitmentBonus: 0,
              indirectBonus: 0,
              dividendIncome: 0,
              total: 0,
              withdrawable: 0,
              scheduled: 0,
              totalPaid: 0,
            });
            setSettlementHistory([]);
          }
        } else {
          console.log('⚠️ API 호출 실패, 기본값으로 진행');
          // 기본값 설정
          setPointSummary({
            basicSalary: 0,
            recruitmentBonus: 0,
            indirectBonus: 0,
            dividendIncome: 0,
            total: 0,
            withdrawable: 0,
            scheduled: 0,
            totalPaid: 0,
          });
          setSettlementHistory([]);
        }
      } catch (error) {
        console.error('정산 요약 조회 실패:', error);
        // 네트워크 에러 등이 발생해도 기본값으로 계속 진행
        setPointSummary({
          basicSalary: 0,
          recruitmentBonus: 0,
          indirectBonus: 0,
          dividendIncome: 0,
          total: 0,
          withdrawable: 0,
          scheduled: 0,
          totalPaid: 0,
        });
        setSettlementHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSettlementSummary();
  }, [user]);


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

  // 정산 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            대기중
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            지급완료
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            취소
          </span>
        );
      default:
        return null;
    }
  };

  // 정산 신청 핸들러
  const handleSettlementRequest = () => {
    if (!user || user.role !== 'MEMBER') {
      alert('파트너 회원만 정산 신청이 가능합니다.');
      return;
    }
    
    if (!pointSummary) {
      alert('정산 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    const totalAmount = (pointSummary.basicSalary || 0) + 
                       (pointSummary.recruitmentBonus || 0) + 
                       (pointSummary.indirectBonus || 0) + 
                       (pointSummary.dividendIncome || 0);
    
    if (totalAmount <= 0) {
      alert('정산 가능한 수당이 없습니다.');
      return;
    }
    
    // 정산 신청 로직 (실제로는 API 호출)
    alert(`총 ${formatNumber(totalAmount)}P 정산 신청이 준비 중입니다.`);
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 pt-4">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <div className="mb-0 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1">
                  💰 정산 관리
                </h1>
                <p className="text-sm text-gray-600">
                  당월지급내역 5일이후출금가능
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  출금 가능 포인트
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatNumber(pointSummary?.withdrawable || 0)}P
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-4 py-2 pt-2 space-y-4">
        
        {/* 수당 현황 카드 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Banknote className="h-5 w-5 mr-2 text-green-600" />
              수당 현황
            </h2>
            <button
              onClick={handleSettlementRequest}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              출금신청하기
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-600 text-sm font-medium">기본수당</p>
              <p className="text-xl font-bold text-blue-700">
                {formatNumber(pointSummary?.basicSalary || 0)}P
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-green-600 text-sm font-medium">모집수당</p>
              <p className="text-xl font-bold text-green-700">
                {formatNumber(pointSummary?.recruitmentBonus || 0)}P
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-orange-600 text-sm font-medium">간접수당</p>
              <p className="text-xl font-bold text-orange-700">
                {formatNumber(pointSummary?.indirectBonus || 0)}P
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-purple-600 text-sm font-medium">배당수익</p>
              <p className="text-xl font-bold text-purple-700">
                {formatNumber(pointSummary?.dividendIncome || 0)}P
              </p>
            </div>
          </div>
          
          {/* 출금 안내 텍스트 */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center flex items-center justify-center">
              <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
              출금신청시 소득세 3.3%골제후 익일11시지급합니다.
            </p>
            <p className="text-xs text-gray-500 text-center flex items-center justify-center mt-1">
              <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
              출금요청은 월 1회가능합니다. 5일~30일까지
            </p>
          </div>
        </div>

        {/* 정산 신청 버튼 - 항상 표시 */}
        {user.role === 'MEMBER' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                정산 신청
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                출금 가능한 포인트를 정산 신청하세요
              </p>
              <button
                onClick={handleSettlementRequest}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <DollarSign className="h-5 w-5 inline mr-2" />
                정산 신청하기
              </button>
            </div>
          </div>
        )}


        {/* 정산 내역 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            정산 내역
          </h2>
          
          {!settlementHistory || settlementHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                정산 내역이 없습니다
              </p>
              <p className="text-gray-500 text-sm">
                정산 신청 후 내역이 여기에 표시됩니다
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlementHistory.map((settlement) => (
                <div key={settlement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {settlement.month} 정산
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(settlement.requestDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    {getStatusBadge(settlement.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      ₩{formatNumber(settlement.totalAmount)}
                    </span>
                    <button className="text-blue-600 text-sm font-medium hover:underline">
                      상세보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 정산 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            정산 안내
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 정산 신청은 매월 1일부터 25일까지 가능합니다</li>
            <li>• 정산 처리 기간은 신청 후 3-5 영업일 소요됩니다</li>
            <li>• 최소 출금 금액은 10,000원입니다</li>
            <li>• 정산 관련 문의는 고객센터로 연락해주세요</li>
          </ul>
        </div>
      </main>

      {/* 하단 탭 */}
      <BottomTab
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default SettlementPage;
