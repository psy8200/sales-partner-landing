'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  partnerStatus: string;
  points: number;
  bankName?: string;
  bankAccount?: string;
  accountHolder?: string;
  settlementCycle?: string;
  createdAt: string;
}

const ProfilePage = () => {
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  useEffect(() => {
    // 로그인된 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          
          // 사용자 정보를 가져온 후 프로필변경요청 내역도 가져오기
          if (userData.user?.id && userData.user?.name && userData.user?.phone) {
            await fetchProfileChangeRequests(userData.user.id, userData.user.name, userData.user.phone);
          }
        } else {
          // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          return;
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        window.location.href = '/login';
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 로그아웃 성공 시 로그인 페이지로 리다이렉트
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">사용자 정보를 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'GENERAL': return '일반회원';
      case 'MEMBER': return '파트너회원';
      case 'ADMIN': return '관리자';
      default: return role;
    }
  };

  const getPartnerStatusLabel = (status: string) => {
    switch (status) {
      case 'NOT_APPLIED': return '미신청';
      case 'PARTNER_APPLIED': return '파트너신청';
      case 'APPROVED': return '승인완료';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="px-4 py-3"
            >
              <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  프로필정보
                </h1>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  disabled={logoutLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {logoutLoading ? '로그아웃 중...' : '로그아웃'}
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* 쇼핑몰 배너 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-3 text-center shadow-sm"
        >
          <button
            onClick={() => setShowShoppingModal(true)}
            className="text-white text-base font-medium hover:opacity-80 transition-opacity"
          >
            🛍️ 쇼핑하고포인트받기 · 프리미엄쇼핑몰
          </button>
        </motion.div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {/* 기본 정보 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
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
          </motion.div>

          {/* 파트너 정보 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold mr-3">📋</span>
              파트너 정보
            </h2>
            <div className="space-y-2">
              {user.role === 'MEMBER' && (
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-sm text-gray-600">나의 기준포인트</span>
                  <span className="text-sm font-medium text-blue-600">
                    {user.points?.toLocaleString() || 0} P
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
          </motion.div>
        </motion.div>

        {/* 편집 버튼 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button 
            onClick={() => setShowRequestModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <span className="font-medium">프로필변경요청하기</span>
          </button>
        </motion.div>

        {/* 요청 내역 테이블 */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
          </motion.div>
        )}
      </div>

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

      {/* 하단 고정 메뉴바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-4">
          {/* 홈 */}
          <button 
            onClick={() => window.location.href = '/member'}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs font-medium">홈</span>
          </button>
          
          {/* 혜택 */}
          <button 
            onClick={() => window.location.href = '/benefits'}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mb-1">🎁</span>
            <span className="text-xs font-medium">혜택</span>
          </button>
          
          {/* 정산 */}
          <button 
            onClick={() => window.location.href = '/settlement'}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mb-1">🧮</span>
            <span className="text-xs font-medium">정산</span>
          </button>
          
          {/* 파트너 */}
          <button 
            onClick={() => window.location.href = '/partner'}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mb-1">👥</span>
            <span className="text-xs font-medium">파트너</span>
          </button>
          
          {/* 프로필 */}
          <button className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-50 text-blue-600 transition-colors">
            <span className="text-xl mb-1">☰</span>
            <span className="text-xs font-medium">프로필</span>
          </button>
        </div>
      </div>

      {/* 하단 메뉴바 공간 확보 */}
      <div className="h-20"></div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100"
          >
            {/* 귀여운 아이콘 */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <span className="text-4xl">👋</span>
              </div>
              {/* 떠다니는 하트들 */}
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce [animation-delay:0.1s]">💕</div>
              <div className="absolute -bottom-1 -left-2 text-xl animate-bounce [animation-delay:0.3s]">✨</div>
            </div>
            
            {/* 제목 */}
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              정말 로그아웃하시나요?
            </h3>
            
            {/* 설명 */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              다시 만나요! 😊<br />
              <span className="text-sm text-gray-500">언제든지 돌아오세요~</span>
            </p>
            
            {/* 버튼들 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                disabled={logoutLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {logoutLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    로그아웃 중...
                  </div>
                ) : (
                  '로그아웃'
                )}
              </button>
            </div>
            
            {/* 귀여운 장식 */}
            <div className="mt-6 flex justify-center space-x-2">
              <span className="text-lg animate-pulse">🌟</span>
              <span className="text-lg animate-pulse [animation-delay:0.2s]">💫</span>
              <span className="text-lg animate-pulse [animation-delay:0.4s]">⭐</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* 쇼핑몰 모달 */}
      {showShoppingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
          >
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
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;




