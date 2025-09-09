'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomTab } from '../(member)/member/_components/BottomTab';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  partnerStatus: string;
  points: number;
  level: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  settlementCycle: string;
  createdAt: string;
  status: string;
  isActive: boolean;
  finalPoints: number;
  totalReferrals: number;
  monthlyReferrals: number;
  currentLevel: number;
  levelName: string;
  levelIcon: string;
  nextLevelRequirement: number;
  remainingReferrals: number;
  isMaxLevel: boolean;
}

const MorePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('more');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestContent, setRequestContent] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requests, setRequests] = useState<Array<{
    id: string;
    content: string;
    status: string;
    createdAt: string;
  }>>([]);
  const [showShoppingModal, setShowShoppingModal] = useState(false);

  // 날짜 형식 변환 함수 (날짜만)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // 상태값 한글 변환 함수
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '요청중';
      case 'PROCESSING': return '처리중';
      case 'COMPLETED': return '수정완료';
      case 'REJECTED': return '거부';
      default: return status;
    }
  };

  // 프로필변경요청 내역 가져오기
  const fetchProfileChangeRequests = async (userId: string, userName: string, userPhone: string) => {
    try {
      const params = new URLSearchParams({
        userId: userId,
        userName: userName,
        userPhone: userPhone
      });
      
      const response = await fetch(`/api/profile-change-requests?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.requests) {
          // 날짜 형식 변환하여 저장
          const formattedRequests = data.requests.map((request: any) => ({
            ...request,
            createdAt: formatDate(request.createdAt)
          }));
          setRequests(formattedRequests);
        }
      }
    } catch (error) {
      console.error('프로필변경요청 내역 가져오기 실패:', error);
    }
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          
          // 사용자 정보를 가져온 후 프로필변경요청 내역도 가져오기
          if (data.user?.id && data.user?.name && data.user?.phone) {
            await fetchProfileChangeRequests(data.user.id, data.user.name, data.user.phone);
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      setLogoutLoading(true);
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
        });
        
        if (response.ok) {
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
        } else {
          alert('로그아웃 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      } finally {
        setLogoutLoading(false);
      }
    }
  };

  // 프로필변경요청 처리
  const handleProfileChangeRequest = async () => {
    if (!requestContent.trim()) {
      alert('요청내용을 입력해주세요.');
      return;
    }

    setRequestLoading(true);
    try {
      const response = await fetch('/api/profile-change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: requestContent,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRequestContent('');
        setShowRequestModal(false);
        alert('프로필변경요청이 접수되었습니다.');
        
        // 요청 성공 후 내역 다시 가져오기
        if (user?.id && user?.name && user?.phone) {
          await fetchProfileChangeRequests(user.id, user.name, user.phone);
        }
      } else {
        alert(data.error || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('요청 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setRequestLoading(false);
    }
  };

  // 역할 라벨 변환
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'GENERAL': return '일반회원';
      case 'MEMBER': return '파트너회원';
      case 'ADMIN': return '관리자';
      default: return role;
    }
  };

  // 파트너 상태 라벨 변환
  const getPartnerStatusLabel = (status: string) => {
    switch (status) {
      case 'NOT_APPLIED': return '미신청';
      case 'PARTNER_APPLIED': return '파트너신청';
      case 'APPROVED': return '승인완료';
      default: return status;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-20 pt-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-20 pt-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">사용자 정보를 불러올 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-20 pt-4">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200/40">
        <div className="h-20 px-4 flex items-center justify-between pt-2">
          <div className="text-left flex-1">
            <h1 className="text-2xl font-bold text-black mb-1 tracking-wide">
              프로필정보
            </h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {logoutLoading ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>
      </header>

      {/* 쇼핑몰 배너 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-3 text-center shadow-sm">
          <button
            onClick={() => setShowShoppingModal(true)}
            className="text-white text-base font-medium hover:opacity-80 transition-opacity"
          >
            🛍️ 쇼핑하고포인트받기 · 프리미엄쇼핑몰
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-4">

        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold mr-3">📋</span>
            기본 정보
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-sm text-gray-600">이름</span>
              <span className="text-sm font-medium text-gray-900">{user.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-sm text-gray-600">이메일</span>
              <span className="text-sm font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-sm text-gray-600">전화번호</span>
              <span className="text-sm font-medium text-gray-900">{user.phone}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">가입일</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* 파트너 정보 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold mr-3">📋</span>
            파트너 정보
          </h2>
          <div className="space-y-2">
            {user.role === 'MEMBER' ? (
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-sm text-gray-600">나의 기준포인트</span>
                <span className="text-sm font-medium text-blue-600">
                  {user.points?.toLocaleString() || 0} P
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-sm text-gray-600">파트너 상태</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  user.partnerStatus === 'APPROVED' 
                    ? 'bg-green-100 text-green-800'
                    : user.partnerStatus === 'PARTNER_APPLIED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getPartnerStatusLabel(user.partnerStatus)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-sm text-gray-600">포인트</span>
              <span className="text-sm font-medium text-gray-900">
                {user.points?.toLocaleString() || 0} P
              </span>
            </div>
            {user.bankName && (
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-sm text-gray-600">은행</span>
                <span className="text-sm font-medium text-gray-900">{user.bankName}</span>
              </div>
            )}
            {user.accountHolder && (
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-sm text-gray-600">예금주</span>
                <span className="text-sm font-medium text-gray-900">{user.accountHolder}</span>
              </div>
            )}
            {user.bankAccount && (
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-sm text-gray-600">계좌번호</span>
                <span className="text-sm font-medium text-gray-900">{user.bankAccount}</span>
              </div>
            )}
            {user.settlementCycle && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">정산 주기</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.settlementCycle === 'WEEKLY' ? '주간' : 
                   user.settlementCycle === 'MONTHLY' ? '월간' : 
                   user.settlementCycle === 'QUARTERLY' ? '분기' : user.settlementCycle}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 프로필 편집 버튼 */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            프로필변경요청하기
          </button>
        </div>

        {/* 요청 내역 테이블 */}
        {requests.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold mr-3">📋</span>
              요청 내역
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">요청일</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">요청내용</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100">
                      <td className="py-2 text-sm text-gray-900">{request.createdAt}</td>
                      <td className="py-2 text-sm text-gray-900">{request.content}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 요청 모달 */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold mr-3">📝</span>
                요청정보
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요청내용
              </label>
              <textarea
                value={requestContent}
                onChange={(e) => setRequestContent(e.target.value)}
                placeholder="변경하고 싶은 내용을 자세히 입력해주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleProfileChangeRequest}
                disabled={requestLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestLoading ? '요청 중...' : '요청하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 쇼핑몰 모달 */}
      {showShoppingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">쇼핑몰 준비중!</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              열심히 제작중입니다.<br />
              최대한빨리 찾아뵐께요~!!
            </p>
            <button
              onClick={() => setShowShoppingModal(false)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            >
              알겠습니다! 😊
            </button>
          </div>
        </div>
      )}

      {/* 하단 탭 - 웹 전용 기능 유지 */}
      <BottomTab
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default MorePage;
