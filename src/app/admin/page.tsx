'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminHomePage = () => {
  const { user, loading } = useAdminAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPartners: 0,
    totalContracts: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // 통계 데이터 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        
        // 총 회원수 조회
        const membersResponse = await fetch('/api/admin/stats/members');
        const membersData = await membersResponse.json();
        
        // 총 파트너수 조회
        const partnersResponse = await fetch('/api/admin/stats/partners');
        const partnersData = await partnersResponse.json();
        
        // 총 계약건수 조회
        const contractsResponse = await fetch('/api/admin/stats/contracts');
        const contractsData = await contractsResponse.json();
        
        setStats({
          totalMembers: membersData.count || 0,
          totalPartners: partnersData.count || 0,
          totalContracts: contractsData.count || 0
        });
      } catch (error) {
        console.error('통계 데이터 조회 오류:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (!loading && user) {
      fetchStats();
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">오늘하루도 감사한 마음으로</h1>
        <p className="mt-2 text-gray-600">
          안녕하세요, {user?.name}님! 세일즈 파트너 관리자 시스템에 오신 것을 환영합니다.
        </p>
      </div>

      {/* 관리자 정보 및 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 관리자 정보 카드 (절반 크기) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">관리자 정보</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">연락처</label>
              <p className="mt-1 text-sm text-gray-900">{user?.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">역할</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.role === 'SUPER_ADMIN' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role === 'SUPER_ADMIN' ? '최고관리자' : '관리자'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">접속 상태</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.isOnline 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.isOnline ? '접속중' : '대기중'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">마지막 로그인</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 통계 카드들 */}
        <div className="space-y-4">
          {/* 총 회원수 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">총 회원수</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {statsLoading ? '...' : stats.totalMembers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">전체 등록 회원</p>
              </div>
            </div>
          </div>

          {/* 총 파트너수 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">총 파트너수</h3>
                <p className="text-3xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.totalPartners.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">승인된 파트너</p>
              </div>
            </div>
          </div>

          {/* 총 계약건수 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">총 계약건수</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {statsLoading ? '...' : stats.totalContracts.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">완료된 계약</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminHomePage;