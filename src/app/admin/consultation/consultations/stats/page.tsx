'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, User, TrendingUp, BarChart3, PieChart, Download } from 'lucide-react';

// 상담이력 데이터 타입 정의
interface ConsultationData {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  availableTime: string;
  additionalNote: string;
  status: string;
  manager: string;
  assignedAt: string;
  createdAt: string;
}

// 통계 데이터 타입 정의
interface ConsultationStats {
  totalConsultations: number;
  completedConsultations: number;
  pendingConsultations: number;
  totalManagers: number;
  monthlyStats: MonthlyStats[];
  managerStats: ManagerStats[];
  areaStats: AreaStats[];
}

interface MonthlyStats {
  month: string;
  total: number;
  completed: number;
  completionRate: number;
}

interface ManagerStats {
  managerName: string;
  totalConsultations: number;
  completedConsultations: number;
  completionRate: number;
  bonusAmount: number;
}

interface AreaStats {
  area: string;
  count: number;
  percentage: number;
}

export default function ConsultationStatsPage() {
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // month, quarter, year
  const [selectedManager, setSelectedManager] = useState('all');

  // 통계 데이터 로드
  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 상담이력 데이터 가져오기
      const response = await fetch('/api/admin/consultation/consultations');
      if (!response.ok) {
        throw new Error('상담이력 데이터를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      const consultations: ConsultationData[] = data.items || [];
      
      // 통계 계산
      const totalConsultations = consultations.length;
      const completedConsultations = consultations.filter(c => c.status === 'COMPLETED').length;
      const pendingConsultations = totalConsultations - completedConsultations;
      
      // 월별 통계 계산
      const monthlyStats = calculateMonthlyStats(consultations);
      
      // 담당자별 통계 계산
      const managerStats = calculateManagerStats(consultations);
      
      // 지역별 통계 계산
      const areaStats = calculateAreaStats(consultations);
      
      const calculatedStats: ConsultationStats = {
        totalConsultations,
        completedConsultations,
        pendingConsultations,
        monthlyStats,
        managerStats,
        areaStats
      };
      
      setStats(calculatedStats);
      
    } catch (err) {
      setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('통계 데이터 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 월별 통계 계산
  const calculateMonthlyStats = (consultations: ConsultationData[]): MonthlyStats[] => {
    const monthlyData: { [key: string]: { total: number; completed: number } } = {};
    
    consultations.forEach(consultation => {
      const date = new Date(consultation.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, completed: 0 };
      }
      
      monthlyData[monthKey].total++;
      if (consultation.status === 'COMPLETED') {
        monthlyData[monthKey].completed++;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        total: data.total,
        completed: data.completed,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // 담당자별 통계 계산
  const calculateManagerStats = (consultations: ConsultationData[]): ManagerStats[] => {
    const managerData: { [key: string]: { total: number; completed: number } } = {};
    
    consultations.forEach(consultation => {
      const manager = consultation.manager || '미배정';
      
      if (!managerData[manager]) {
        managerData[manager] = { total: 0, completed: 0 };
      }
      
      managerData[manager].total++;
      if (consultation.status === 'COMPLETED') {
        managerData[manager].completed++;
      }
    });
    
    return Object.entries(managerData)
      .map(([managerName, data]) => ({
        managerName,
        totalConsultations: data.total,
        completedConsultations: data.completed,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        bonusAmount: data.completed * 10000 // 완료 건수당 10,000원
      }))
      .sort((a, b) => b.completedConsultations - a.completedConsultations);
  };

  // 지역별 통계 계산
  const calculateAreaStats = (consultations: ConsultationData[]): AreaStats[] => {
    const areaData: { [key: string]: number } = {};
    const total = consultations.length;
    
    consultations.forEach(consultation => {
      const area = consultation.area || '미지정';
      areaData[area] = (areaData[area] || 0) + 1;
    });
    
    return Object.entries(areaData)
      .map(([area, count]) => ({
        area,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  // 엑셀 다운로드
  const handleDownloadExcel = async () => {
    try {
      const response = await fetch('/api/admin/consultation/consultations/export');
      if (!response.ok) {
        throw new Error('엑셀 다운로드에 실패했습니다.');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consultation-stats-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadStats();
  }, [selectedPeriod, selectedManager]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">통계 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadStats}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">통계 데이터가 없습니다.</p>
      </div>
    );
  }

  const completionRate = stats.totalConsultations > 0 
    ? ((stats.completedConsultations / stats.totalConsultations) * 100).toFixed(1)
    : '0';

  const totalBonusAmount = stats.managerStats.reduce((sum, manager) => sum + manager.bonusAmount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">상담 통계</h1>
            <p className="text-gray-600">상담이력 데이터를 기반으로 한 통계 정보입니다.</p>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="month">월별</option>
              <option value="quarter">분기별</option>
              <option value="year">연별</option>
            </select>
            
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 담당자</option>
              {stats.managerStats.map(manager => (
                <option key={manager.managerName} value={manager.managerName}>
                  {manager.managerName}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Download className="w-4 h-4" />
              엑셀 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 상담 건수</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalConsultations.toLocaleString()}</p>
              <p className="text-sm text-gray-500">완료: {stats.completedConsultations}건</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">완료율</p>
              <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
              <p className="text-sm text-gray-500">진행중: {stats.pendingConsultations}건</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">담당자 수</p>
              <p className="text-3xl font-bold text-gray-900">{stats.managerStats.length}</p>
              <p className="text-sm text-gray-500">활성 담당자</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <PieChart className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 보너스</p>
              <p className="text-3xl font-bold text-gray-900">
                {(totalBonusAmount / 10000).toFixed(0)}만원
              </p>
              <p className="text-sm text-gray-500">
                평균: {stats.managerStats.length > 0 ? (totalBonusAmount / stats.managerStats.length / 10000).toFixed(1) : 0}만원
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 월별 통계 차트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 상담 현황</h3>
          <div className="space-y-4">
            {stats.monthlyStats.length > 0 ? (
              stats.monthlyStats.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{month.month}</span>
                      <span className="text-gray-500">
                        {month.completed}/{month.total}건 ({month.completionRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${month.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">월별 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 지역별 통계 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">지역별 현황</h3>
          <div className="space-y-3">
            {stats.areaStats.length > 0 ? (
              stats.areaStats.map((area) => (
                <div key={area.area} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{area.area}</span>
                      <span className="text-gray-500">{area.count}건 ({area.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${area.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">지역별 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 담당자별 실적 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">담당자별 상담 실적</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  담당자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 상담
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  완료
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  완료율
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보너스 예상
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.managerStats.length > 0 ? (
                stats.managerStats.map((manager) => (
                  <tr key={manager.managerName} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {manager.managerName}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {manager.totalConsultations}건
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {manager.completedConsultations}건
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${manager.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {manager.completionRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {manager.bonusAmount.toLocaleString()}원
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    담당자별 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 보너스 지급 안내 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">보너스 지급 기준</h4>
            <p className="mt-1 text-sm text-blue-700">
              완료된 상담 1건당 10,000원의 보너스가 지급됩니다. 
              월별로 집계하여 다음 달 급여와 함께 지급됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}