'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Manager {
  id: string;
  department: string;
  name: string;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ManagersPage() {
  const { user, loading } = useAdminAuth();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  
  // 입력 폼 상태
  const [formData, setFormData] = useState({
    department: '',
    name: '',
    joinDate: ''
  });

  // 폼 로딩 상태
  const [formLoading, setFormLoading] = useState(false);

  // 담당자 목록 불러오기
  const loadManagers = async () => {
    try {
      setLoadingManagers(true);
      const response = await fetch('/api/admin/managers');
      const result = await response.json();
      
      if (result.success) {
        setManagers(result.data);
      } else {
        console.error('담당자 목록 로드 실패:', result.error);
        alert('담당자 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('담당자 목록 로드 오류:', error);
      alert('담당자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingManagers(false);
    }
  };

  // 컴포넌트 마운트 시 담당자 목록 로드
  useEffect(() => {
    if (user) {
      loadManagers();
    }
  }, [user]);

  // 폼 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      department: '',
      name: '',
      joinDate: ''
    });
    setEditingManager(null);
  };

  // 담당자 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.department.trim() || !formData.name.trim() || !formData.joinDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('담당자가 성공적으로 생성되었습니다!');
        resetForm();
        loadManagers(); // 목록 새로고침
      } else {
        alert(`담당자 생성 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('담당자 생성 오류:', error);
      alert('담당자 생성 중 오류가 발생했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  // 담당자 수정
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingManager || !formData.department.trim() || !formData.name.trim() || !formData.joinDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch('/api/admin/managers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingManager.id,
          ...formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('담당자가 성공적으로 수정되었습니다!');
        resetForm();
        loadManagers(); // 목록 새로고침
      } else {
        alert(`담당자 수정 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('담당자 수정 오류:', error);
      alert('담당자 수정 중 오류가 발생했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  // 담당자 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 담당자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/managers?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('담당자가 성공적으로 삭제되었습니다!');
        loadManagers(); // 목록 새로고침
      } else {
        alert(`담당자 삭제 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('담당자 삭제 오류:', error);
      alert('담당자 삭제 중 오류가 발생했습니다.');
    }
  };

  // 선택된 담당자들 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedManagers.length === 0) {
      alert('삭제할 담당자를 선택해주세요.');
      return;
    }

    if (!confirm(`선택된 ${selectedManagers.length}명의 담당자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const deletePromises = selectedManagers.map(id => 
        fetch(`/api/admin/managers?id=${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      alert('선택된 담당자들이 성공적으로 삭제되었습니다!');
      setSelectedManagers([]);
      loadManagers(); // 목록 새로고침
    } catch (error) {
      console.error('일괄 삭제 오류:', error);
      alert('담당자 삭제 중 오류가 발생했습니다.');
    }
  };

  // 수정 모드 시작
  const startEdit = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      department: manager.department,
      name: manager.name,
      joinDate: manager.joinDate.split('T')[0] // YYYY-MM-DD 형식으로 변환
    });
  };

  // 선택 체크박스 핸들러
  const handleSelectManager = (id: string) => {
    setSelectedManagers(prev => 
      prev.includes(id) 
        ? prev.filter(managerId => managerId !== id)
        : [...prev, id]
    );
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedManagers.length === managers.length) {
      setSelectedManagers([]);
    } else {
      setSelectedManagers(managers.map(manager => manager.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">로그인이 필요합니다.</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">담당자관리</h1>
        <p className="text-gray-600">담당자 정보를 관리할 수 있습니다.</p>
      </div>

      {/* 입력 폼 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingManager ? '담당자 수정' : '새 담당자 추가'}
        </h2>
        
        <form onSubmit={editingManager ? handleUpdate : handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                담당자소속 *
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 영업팀, 고객지원팀"
                required
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                담당자(이름) *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="담당자 이름"
                required
              />
            </div>
            
            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
                가입일 *
              </label>
              <input
                type="date"
                id="joinDate"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {formLoading ? '처리 중...' : (editingManager ? '수정하기' : '생성하기')}
            </button>
            
            {editingManager && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 담당자 목록 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">담당자 목록</h2>
            {selectedManagers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                선택 삭제 ({selectedManagers.length})
              </button>
            )}
          </div>
        </div>
        
        {loadingManagers ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">담당자 목록을 불러오는 중...</div>
          </div>
        ) : managers.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">등록된 담당자가 없습니다.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedManagers.length === managers.length && managers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label="전체 선택"
                      title="모든 담당자를 선택/해제합니다"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    소속
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    담당자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedManagers.includes(manager.id)}
                        onChange={() => handleSelectManager(manager.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`${manager.name} 담당자 선택`}
                        title={`${manager.name} 담당자를 선택/해제합니다`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {manager.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {manager.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(manager.joinDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(manager.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => startEdit(manager)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(manager.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

