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
}

interface ApplicationHistory {
  id: string;
  productName: string;
  productCategory: string;
  monthlyAmount: number;
  commissionRate: number;
  commissionAmount: number;
  points: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  appliedAt: string;
  approvedAt?: string;
  adminNote?: string;
}

const ApplicationHistoryPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    // 로그인된 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
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
    fetchApplicationHistory();
  }, []);

  // 신청내역 가져오기 (임시 데이터)
  const fetchApplicationHistory = async () => {
    try {
      // 실제로는 API에서 가져와야 함
      // const response = await fetch('/api/application-history');
      // const result = await response.json();
      
      // 임시 데이터
      const mockData: ApplicationHistory[] = [
        {
          id: '1',
          productName: 'SKT 5G 요금제',
          productCategory: '통신',
          monthlyAmount: 85000,
          commissionRate: 3.5,
          commissionAmount: 2975,
          points: 1000,
          status: 'APPROVED',
          appliedAt: '2024-01-15T10:30:00Z',
          approvedAt: '2024-01-16T14:20:00Z',
          adminNote: '정상 승인 처리되었습니다.'
        },
        {
          id: '2',
          productName: '삼성생명 종신보험',
          productCategory: '보험',
          monthlyAmount: 120000,
          commissionRate: 5.0,
          commissionAmount: 6000,
          points: 1500,
          status: 'PENDING',
          appliedAt: '2024-01-20T09:15:00Z',
          adminNote: '서류 검토 중입니다.'
        },
        {
          id: '3',
          productName: 'KB국민은행 대출',
          productCategory: '금융',
          monthlyAmount: 500000,
          commissionRate: 2.0,
          commissionAmount: 10000,
          points: 2000,
          status: 'COMPLETED',
          appliedAt: '2024-01-10T11:45:00Z',
          approvedAt: '2024-01-12T16:30:00Z',
          adminNote: '지급 완료되었습니다.'
        },
        {
          id: '4',
          productName: 'LG U+ 인터넷',
          productCategory: '통신',
          monthlyAmount: 45000,
          commissionRate: 4.0,
          commissionAmount: 1800,
          points: 800,
          status: 'REJECTED',
          appliedAt: '2024-01-18T13:20:00Z',
          approvedAt: '2024-01-19T10:15:00Z',
          adminNote: '서류 미비로 반려되었습니다.'
        }
      ];

      setApplications(mockData);
    } catch (error) {
      console.error('신청내역 조회 오류:', error);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '승인대기';
      case 'APPROVED': return '승인완료';
      case 'REJECTED': return '승인반려';
      case 'COMPLETED': return '지급완료';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '통신': return 'bg-blue-100 text-blue-800';
      case '보험': return 'bg-green-100 text-green-800';
      case '금융': return 'bg-purple-100 text-purple-800';
      case '장례': return 'bg-gray-100 text-gray-800';
      case '쇼핑': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = filterStatus === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const totalCommission = applications
    .filter(app => app.status === 'COMPLETED')
    .reduce((sum, app) => sum + app.commissionAmount, 0);

  const totalPoints = applications
    .filter(app => app.status === 'COMPLETED')
    .reduce((sum, app) => sum + app.points, 0);

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
                📋 신청내역
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {user.name}님의 상품 신청 및 승인 현황을 확인하세요
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 통계 요약 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 신청건수</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}건</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 수수료</p>
                <p className="text-2xl font-bold text-green-600">₩{totalCommission.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 포인트</p>
                <p className="text-2xl font-bold text-purple-600">{totalPoints.toLocaleString()}P</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 필터 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'ALL' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'PENDING' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                승인대기
              </button>
              <button
                onClick={() => setFilterStatus('APPROVED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'APPROVED' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                승인완료
              </button>
              <button
                onClick={() => setFilterStatus('COMPLETED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'COMPLETED' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                지급완료
              </button>
              <button
                onClick={() => setFilterStatus('REJECTED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'REJECTED' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                승인반려
              </button>
            </div>
          </div>
        </motion.div>

        {/* 신청내역 테이블 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">상품 신청 내역</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    월 금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수수료율
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수수료
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    포인트
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리자 메모
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>신청내역이 없습니다.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {application.productName}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(application.productCategory)}`}>
                          {application.productCategory}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₩{application.monthlyAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.commissionRate}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₩{application.commissionAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                        {application.points.toLocaleString()}P
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {getStatusLabel(application.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.appliedAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={application.adminNote}>
                          {application.adminNote || '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
          <button className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-50 text-blue-600 transition-colors">
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
          <button 
            onClick={() => window.location.href = '/profile'}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
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

export default ApplicationHistoryPage;




