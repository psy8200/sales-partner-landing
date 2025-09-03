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

  useEffect(() => {
    // 로그인된 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
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
      case 'GENERAL': return '예비파트너';
      case 'MEMBER': return '파트너';
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
          <div className="py-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-4"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                프로필 정보
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {user.name}님의 상세 정보를 확인하세요
              </p>
            </motion.div>

            {/* 역할 및 상태 표시 */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getRoleLabel(user.role)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {getPartnerStatusLabel(user.partnerStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* 기본 정보 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold mr-3">👤</span>
              기본 정보
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">이름</span>
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">이메일</span>
                <span className="text-sm font-medium text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
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
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm font-bold mr-3">🤝</span>
              파트너 정보
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
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
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">포인트</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.points?.toLocaleString() || 0} P
                </span>
              </div>
              {user.bankName && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">은행</span>
                  <span className="text-sm font-medium text-gray-900">{user.bankName}</span>
                </div>
              )}
              {user.accountHolder && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">예금주</span>
                  <span className="text-sm font-medium text-gray-900">{user.accountHolder}</span>
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
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md">
            <span className="font-medium">프로필 편집</span>
          </button>
        </motion.div>
      </div>

      {/* 하단 고정 메뉴바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-4">
          {/* 홈 */}
          <button 
                          onClick={() => window.location.href = '/mypage'}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs font-medium">홈</span>
          </button>
          
          {/* 신청내역 */}
          <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="text-xl mb-1">📋</span>
            <span className="text-xs font-medium">신청내역</span>
          </button>
          
          {/* 정산관리 */}
          <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="text-xl mb-1">💰</span>
            <span className="text-xs font-medium">정산관리</span>
          </button>
          
          {/* 나의조직도 */}
          <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="text-xl mb-1">🌳</span>
            <span className="text-xs font-medium">나의조직도</span>
          </button>
          
          {/* 프로필 */}
          <button className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-50 text-blue-600 transition-colors">
            <span className="text-xl mb-1">👤</span>
            <span className="text-xs font-medium">프로필</span>
          </button>
        </div>
      </div>

      {/* 하단 메뉴바 공간 확보 */}
      <div className="h-20"></div>
    </div>
  );
};

export default ProfilePage;




