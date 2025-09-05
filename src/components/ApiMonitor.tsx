'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Zap
} from 'lucide-react';

interface ApiRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  responseTime: number;
  timestamp: string;
  size: number;
  error?: string;
}

interface ApiStats {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  last24Hours: number;
}

export const ApiMonitor: React.FC = () => {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        fetchApiRequests();
        fetchApiStats();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const fetchApiRequests = async () => {
    try {
      const response = await fetch('/api/expo/api-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('API 요청 로그 가져오기 실패:', error);
    }
  };

  const fetchApiStats = async () => {
    try {
      const response = await fetch('/api/expo/api-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('API 통계 가져오기 실패:', error);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) {
      return 'text-green-600 bg-green-50';
    } else if (status >= 400 && status < 500) {
      return 'text-yellow-600 bg-yellow-50';
    } else if (status >= 500) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status >= 400) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-100 text-blue-700';
      case 'POST':
        return 'bg-green-100 text-green-700';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'success') return request.status >= 200 && request.status < 300;
    if (filter === 'error') return request.status >= 400;
    return true;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">🌐 API 연동 모니터링</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              isMonitoring 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <Activity className="w-4 h-4 mr-1 inline" />
            {isMonitoring ? '모니터링 중' : '일시정지'}
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
            <div className="text-sm text-blue-600">총 요청</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
            <div className="text-sm text-green-600">성공률</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageResponseTime}ms</div>
            <div className="text-sm text-yellow-600">평균 응답시간</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
            <div className="text-sm text-red-600">오류</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.last24Hours}</div>
            <div className="text-sm text-purple-600">24시간 내</div>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="flex space-x-2 mb-4">
        {[
          { id: 'all', label: '전체', count: requests.length },
          { id: 'success', label: '성공', count: requests.filter(r => r.status >= 200 && r.status < 300).length },
          { id: 'error', label: '오류', count: requests.filter(r => r.status >= 400).length }
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFilter(id as any)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* 요청 로그 */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredRequests.length > 0 ? (
          filteredRequests.slice(0, 50).map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(request.status)}
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded font-mono ${getMethodColor(request.method)}`}>
                    {request.method}
                  </span>
                  <span className="font-medium text-gray-900">{request.url}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{request.responseTime}ms</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{(request.size / 1024).toFixed(1)}KB</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
                <div className="text-xs text-gray-500">
                  {new Date(request.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-8 h-8 mx-auto mb-2" />
            <p>API 요청 로그가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 실시간 상태 */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>실시간 모니터링 활성</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>WebSocket 연결됨</span>
        </div>
      </div>
    </div>
  );
};
