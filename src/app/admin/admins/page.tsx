'use client';

import React, { useEffect, useState } from 'react';
import AdminCreateForm from '@/components/AdminCreateForm';
import { AdminEditModal } from '@/components/AdminEditModal';

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  joinDate: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  isOnline: boolean;
  lastActivityAt?: string;
  createdAt: string;
}

const AdminsPage = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState<Record<string, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string>('');

  // 관리자 목록 조회
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/admins');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '관리자 목록을 불러올 수 없습니다.');
      }
      
      setAdmins(data.admins || []);
    } catch (err) {
      console.error('관리자 목록 조회 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // 전체 선택/해제
  const allSelected = admins.length > 0 && admins.every(admin => selectedAdmins[admin.id]);
  const selectedIds = admins.filter(admin => selectedAdmins[admin.id]).map(admin => admin.id);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedAdmins({});
    } else {
      const newSelected: Record<string, boolean> = {};
      admins.forEach(admin => {
        newSelected[admin.id] = true;
      });
      setSelectedAdmins(newSelected);
    }
  };

  const handleSelectAdmin = (adminId: string) => {
    setSelectedAdmins(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  // 관리자 삭제
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 관리자를 선택해주세요.');
      return;
    }

    // 선택된 관리자 정보 확인
    const selectedAdmins = admins.filter(admin => selectedIds.includes(admin.id));

    if (!confirm(`선택된 ${selectedIds.length}명의 관리자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/admins/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminIds: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '관리자 삭제에 실패했습니다.');
      }

      alert('선택된 관리자가 삭제되었습니다.');
      setSelectedAdmins({});
      fetchAdmins();
    } catch (err) {
      console.error('관리자 삭제 오류:', err);
      alert(err instanceof Error ? err.message : '관리자 삭제 중 오류가 발생했습니다.');
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return '-';
    }
  };

  // 역할 표시
  const getRoleLabel = (role: string) => {
    return role === 'SUPER_ADMIN' ? '최고관리자' : '관리자';
  };

  // 상태 표시
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '활성';
      case 'INACTIVE': return '비활성';
      case 'SUSPENDED': return '정지';
      default: return status;
    }
  };

  // 관리자 수정 모달 열기
  const handleEditAdmin = (adminId: string) => {
    setEditingAdminId(adminId);
    setShowEditModal(true);
  };

  // 관리자 수정 모달 닫기
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingAdminId('');
  };

  // 관리자 수정 성공 시
  const handleEditSuccess = () => {
    fetchAdmins(); // 목록 새로고침
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">관리자 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">관리자</h1>
        </div>
        <p className="text-gray-600">시스템 관리자를 관리하세요.</p>
      </div>

      {/* 관리자 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">관리자 목록</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                삭제하기
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                관리자생성
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일주소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    입사일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    접속여부
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAdmins[admin.id] || false}
                        onChange={() => handleSelectAdmin(admin.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admin.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.isOnline 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {admin.isOnline ? '접속중' : '대기중'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.role === 'SUPER_ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getRoleLabel(admin.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(admin.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleEditAdmin(admin.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {admins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              등록된 관리자가 없습니다.
            </div>
          )}

          {/* 하단 정보 */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <div>총 {admins.length}명</div>
          </div>
        </div>
      </div>

      {/* 관리자 생성 폼 */}
      {showCreateForm && (
        <AdminCreateForm
          onSuccess={() => {
            fetchAdmins();
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* 관리자 수정 모달 */}
      {showEditModal && (
        <AdminEditModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          adminId={editingAdminId}
        />
      )}
    </div>
  );
};

export default AdminsPage;
