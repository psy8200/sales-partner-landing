'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Upload,
  Archive,
  Database,
  Filter,
  Calendar,
  User,
  Phone,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';

// 백업 데이터 타입 정의
interface WithdrawalBackup {
  id: string;
  backupDate: string;
  backupType: 'MANUAL' | 'AUTO' | 'EXTERNAL';
  totalRecords: number;
  backupSize: number;
  backupPath?: string;
  backupStatus: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  backupDescription?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface WithdrawalBackupItem {
  id: string;
  backupId: string;
  originalId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  finalPoints: number;
  withdrawablePoints: number;
  totalAmount: number;
  requestInfo: string;
  settlementMonth: string;
  bankName: string;
  accountNumber: string;
  idCardFile?: string;
  status: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
  requestedAt?: string;
  paidAt?: string;
  memo?: string;
  originalCreatedAt: string;
  originalUpdatedAt: string;
  backupCreatedAt: string;
}

/**
 * 출금요청 백업정보 페이지
 * 대용량 데이터 관리 및 영구 저장 시스템
 */
export default function WithdrawalBackupInfoPage() {
  const [backups, setBackups] = useState<WithdrawalBackup[]>([]);
  const [backupItems, setBackupItems] = useState<WithdrawalBackupItem[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<WithdrawalBackup | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);

  // 백업 목록 조회
  const fetchBackups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/withdrawal-backup');
      if (response.ok) {
        const result = await response.json();
        setBackups(result.data?.backups || []);
      }
    } catch (error) {
      console.error('백업 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 백업 상세 데이터 조회
  const fetchBackupItems = useCallback(async (backupId: string, page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/withdrawal-backup/${backupId}/items?page=${page}&limit=${itemsPerPage}&search=${searchTerm}&status=${statusFilter}&date=${dateFilter}`);
      if (response.ok) {
        const result = await response.json();
        setBackupItems(result.data?.items || []);
        setTotalItems(result.data?.total || 0);
      }
    } catch (error) {
      console.error('백업 상세 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilter, itemsPerPage]);

  // 수동 백업 생성
  const handleCreateBackup = async () => {
    if (!confirm('현재 출금요청 데이터를 백업하시겠습니까?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/withdrawal-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupType: 'MANUAL',
          backupDescription: '수동 백업 생성'
        })
      });

      if (response.ok) {
        alert('백업이 성공적으로 생성되었습니다.');
        await fetchBackups();
      } else {
        alert('백업 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('백업 생성 오류:', error);
      alert('백업 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 백업 삭제
  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('이 백업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/withdrawal-backup/${backupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('백업이 삭제되었습니다.');
        await fetchBackups();
        if (selectedBackup?.id === backupId) {
          setSelectedBackup(null);
          setBackupItems([]);
        }
      } else {
        alert('백업 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('백업 삭제 오류:', error);
      alert('백업 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 외부 저장장치로 백업
  const handleExternalBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/withdrawal-backup/${backupId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `출금요청백업_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('외부 백업 완료');
        alert('외부 저장장치로 백업이 완료되었습니다.');
      } else {
        alert('외부 백업에 실패했습니다.');
      }
    } catch (error) {
      console.error('외부 백업 오류:', error);
      alert('외부 백업 중 오류가 발생했습니다.');
    }
  };

  // 백업 선택
  const handleSelectBackup = (backup: WithdrawalBackup) => {
    setSelectedBackup(backup);
    setCurrentPage(1);
    fetchBackupItems(backup.id, 1);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (selectedBackup) {
      fetchBackupItems(selectedBackup.id, page);
    }
  };

  // 검색 및 필터 적용
  const handleSearch = () => {
    if (selectedBackup) {
      setCurrentPage(1);
      fetchBackupItems(selectedBackup.id, 1);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            신청됨
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            처리중
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            완료
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            거절됨
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // 백업 타입 배지
  const getBackupTypeBadge = (type: string) => {
    switch (type) {
      case 'MANUAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Archive className="h-3 w-3 mr-1" />
            수동
          </span>
        );
      case 'AUTO':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Database className="h-3 w-3 mr-1" />
            자동
          </span>
        );
      case 'EXTERNAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Upload className="h-3 w-3 mr-1" />
            외부
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {type}
          </span>
        );
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  출금요청 백업정보
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  출금신청 데이터의 백업 및 복원을 관리하는 페이지입니다.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateBackup}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  수동 백업 생성
                </button>
                <button
                  onClick={fetchBackups}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  새로고침
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 백업 목록 */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                백업 목록 ({backups.length})
              </h2>
              
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    onClick={() => handleSelectBackup(backup)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedBackup?.id === backup.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getBackupTypeBadge(backup.backupType)}
                        <span className="text-sm text-gray-500">
                          {formatDate(backup.backupDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExternalBackup(backup.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="외부 백업"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBackup(backup.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>레코드: {backup.totalRecords.toLocaleString()}건</div>
                      <div>크기: {formatFileSize(backup.backupSize)}</div>
                      {backup.backupDescription && (
                        <div className="text-gray-500 mt-1">
                          {backup.backupDescription}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 백업 상세 데이터 */}
          <div className="lg:col-span-2">
            {selectedBackup ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                {/* 검색 및 필터 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="회원명, 연락처, 정산월로 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="상태 필터를 선택하세요"
                      >
                        <option value="ALL">전체 상태</option>
                        <option value="REQUESTED">신청됨</option>
                        <option value="PROCESSING">처리중</option>
                        <option value="PAID">완료</option>
                        <option value="REJECTED">거절됨</option>
                      </select>
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="날짜 필터를 선택하세요"
                      />
                      <button
                        onClick={handleSearch}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        검색
                      </button>
                    </div>
                  </div>
                </div>

                {/* 데이터 테이블 */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          회원정보
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          출금정보
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          처리내역
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          백업일시
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {backupItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.userName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.userPhone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">
                                {formatAmount(item.totalAmount)}P
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.settlementMonth}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              {item.processedBy && (
                                <div className="text-sm text-gray-900">
                                  {item.processedBy}
                                </div>
                              )}
                              {item.processedAt && (
                                <div className="text-sm text-gray-500">
                                  {formatDate(item.processedAt)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.backupCreatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        총 {totalItems.toLocaleString()}건 중 {((currentPage - 1) * itemsPerPage + 1).toLocaleString()}-
                        {Math.min(currentPage * itemsPerPage, totalItems).toLocaleString()}건 표시
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          이전
                        </button>
                        <span className="px-3 py-1 text-sm">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
              >
                <div className="text-center">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Database className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    백업 데이터 선택
                  </h3>
                  <p className="text-gray-500">
                    왼쪽에서 백업을 선택하면 상세 데이터를 확인할 수 있습니다.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}