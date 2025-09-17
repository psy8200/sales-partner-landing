'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import MemberSearchModal from '@/components/MemberSearchModal';

interface PartnerApplicationItem {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  referrer: string; // 추천인코드 추가
  availableTime: string;
  consultationType?: string; // 상담종류
  additionalNote: string;
  backendStatus: string;
  manager?: string;
  assignedAt?: string;
  createdAt: string;
}

interface Manager {
  id: string;
  department: string;
  name: string;
  joinDate: string;
  isActive: boolean;
}

type RequestRow = {
  id: string;
  customerName: string;
  phone: string;
  area: string; // 지역
  referrer: string; // 추천인코드 추가
  availableTime?: string; // 상담가능시간
  consultationType?: string; // 상담종류
  additionalNote?: string; // 파트너신청 메모
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  manager?: string; // 담당자
  assignedAt?: string; // 배정일
  createdAt: string;
};

export default function ContractRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [total, setTotal] = useState(0);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<string>('');

  // 페이지 제목 설정
  const [pageTitle, setPageTitle] = useState('상담신청관리');

  // 페이지 제목 가져오기
  useEffect(() => {
    const fetchPageTitle = async () => {
      try {
        const response = await fetch('/api/admin/sidebar-items/%2Fadmin%2Fconsultation%2Frequests');
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setPageTitle(data.title);
          }
        }
      } catch (error) {
        console.error('페이지 제목 가져오기 실패:', error);
      }
    };

    fetchPageTitle();
  }, []);

  // 담당자 목록 가져오기
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch('/api/admin/managers');
        if (response.ok) {
          const data = await response.json();
          setManagers(data.data || data.managers || []);
        }
      } catch (error) {
        console.error('담당자 목록 가져오기 실패:', error);
      }
    };

    fetchManagers();
  }, []);

  // 데이터 가져오기
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/admin/contracts/requests?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      
      // API 응답에서 items 배열을 requests로 사용 (API는 items를 반환하지만 프론트엔드는 requests를 기대)
      const requests = data.items || data.requests || [];
      
      // 데이터 매핑
      const mapped: RequestRow[] = requests.map((r: PartnerApplicationItem) => ({
        id: r.id,
        customerName: r.customerName,
        phone: r.phone,
        area: r.area,
        referrer: r.referrer,
        availableTime: r.availableTime,
        consultationType: r.consultationType,
        additionalNote: r.additionalNote,
        status: r.backendStatus as 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED',
        manager: r.manager,
        assignedAt: r.assignedAt,
        createdAt: r.createdAt,
      }));

      setRows(mapped);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, status]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // 체크박스 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(rows.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 검색 입력 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="이름, 전화번호, 지역으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="상태 필터를 선택하세요"
              >
                <option value="">전체 상태</option>
                <option value="PENDING">상담신청</option>
                <option value="ASSIGNED">배정완료</option>
                <option value="COMPLETED">상담완료</option>
                <option value="CANCELLED">대기중</option>
              </select>

              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="표시할 항목 수를 선택하세요"
              >
                <option value={10}>10줄</option>
                <option value={20}>20줄</option>
                <option value={30}>30줄</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation();
                  setPage(1); 
                  fetchRequests(); 
                }}
                className="relative cursor-pointer select-none [z-index:9999] [pointer-events:auto] [touch-action:manipulation] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap"
              >
                🔍 검색
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    const params = new URLSearchParams();
                    if (selectedIds.length > 0) params.set('ids', selectedIds.join(','));
                    const res = await fetch(`/api/admin/contracts/requests/export?${params.toString()}`);
                    if (!res.ok) { const t = await res.text(); throw new Error(t || '다운로드 실패'); }
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `consultation-requests-${new Date().toISOString().split('T')[0]}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (e: unknown) {
                    alert(e instanceof Error ? e.message : '알 수 없는 오류');
                  }
                }}
                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap"
              >
                📥 <span className="hidden sm:inline">{selectedIds.length > 0 ? '선택 다운로드' : '다운로드'}</span>
                <span className="sm:hidden">다운로드</span>
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // 완료된 상담만 필터링 (backendStatus가 COMPLETED인 것들)
                  const completedIds = rows
                    .filter(r => r.status === 'COMPLETED' || r.status === 'DONE')
                    .map(r => r.id);
                  
                  if (completedIds.length === 0) {
                    alert('상담완료된 항목이 없습니다.\n상담완료된 항목을 선택해주세요.');
                    return;
                  }

                  alert(`선택된 ${completedIds.length}개의 완료된 상담을 상담이력으로 이동합니다.\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`);

                  try {
                    const response = await fetch('/api/admin/consultation/move-to-history', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ selectedIds: completedIds })
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || '이동 처리에 실패했습니다.');
                    }

                    const result = await response.json();
                    alert(`✅ 상담이력 이동 완료!\n\n${result.message}`);
                    
                    // 페이지 새로고침
                    fetchRequests();
                    
                  } catch (error) {
                    console.error('상담이력 이동 오류:', error);
                    alert(`이동 실패: ${error.message}`);
                  }
                }}
                className="relative cursor-pointer [z-index:9999] [pointer-events:auto] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap"
              >
                💾 <span className="hidden sm:inline">저장하기</span>
                <span className="sm:hidden">저장</span>
              </button>
            </div>
          </div>
        </div>

        {/* 테이블 섹션 */}
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === rows.length && rows.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    title="전체 선택"
                  />
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">추천인코드</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상담가능시간</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상담종류</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메모</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배정여부</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">배정일</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상담여부</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배정변경</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={13} className="px-2 py-4 text-center text-sm text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={13} className="px-2 py-4 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-2 py-4 text-center text-sm text-gray-500">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={(e) => handleSelectRow(r.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        title={`${r.name} 선택`}
                      />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {r.customerName}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {r.phone}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <div className="max-w-[120px] truncate" title={r.area}>
                        {r.area}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {r.referrer}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {r.availableTime}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        r.consultationType === '포인트추가' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.consultationType || '파트너신청'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900">
                      {r.additionalNote ? (
                        <button
                          onClick={() => {
                            setSelectedMemo(r.additionalNote);
                            setShowMemoModal(true);
                          }}
                          className="max-w-[300px] text-left cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
                          title="클릭하여 전체 메모 보기"
                        >
                          <div className="truncate text-blue-600 hover:text-blue-800">
                            {r.additionalNote.length > 60 ? `${r.additionalNote.substring(0, 60)}...` : r.additionalNote}
                          </div>
                        </button>
                      ) : '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                        (r.status as any) === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        (r.status as any) === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        (r.status as any) === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(r.status as any) === 'PENDING' ? '상담신청' : 
                         (r.status as any) === 'ASSIGNED' ? '배정완료' : 
                         (r.status as any) === 'COMPLETED' ? '상담완료' : 
                         (r.status as any) === 'CANCELLED' ? '대기중' : r.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {(r.status as any) === 'PENDING' ? (
                        <select
                          value={r.manager || ''}
                          onChange={(e)=>{
                            const v = e.target.value;
                            setRows(prev=>(prev || []).map(x=>x.id===r.id?{...x, manager:v}:x));
                          }}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-0"
                          aria-label="담당자 선택"
                          title="담당자를 선택하세요"
                        >
                          <option value="">담당자 선택</option>
                          {(managers || []).map((manager) => (
                            <option key={manager.id} value={manager.name}>
                              {manager.name} ({manager.department})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs font-medium text-gray-900 truncate block" title={r.manager || '-'}>
                          {r.manager || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      {(r.status as any) === 'PENDING' ? (
                        <button
                          className="relative cursor-pointer select-none [z-index:9999] [pointer-events:auto] [touch-action:manipulation] px-1 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          disabled={!r.manager || r.manager.trim() === ''}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const v = r.manager || '';
                            if (!v || v.trim() === '') {
                              alert('담당자를 선택해주세요.');
                              return;
                            }
                            
                            alert(`담당자 "${v}"로 배정하시겠습니까?\n\n고객: ${r.customerName}\n연락처: ${r.phone}`);

                            fetch(`/api/admin/contracts/requests/${r.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'assign', manager: v }),
                            }).then(async (res)=>{
                              if (!res.ok) { 
                                const t = await res.text(); 
                                throw new Error(t || '배정 처리에 실패했습니다.'); 
                              }
                              const u = await res.json();
                              setRows(prev=>(prev || []).map(x=>x.id===r.id?{
                                ...x, 
                                status: u.backendStatus, 
                                assignedAt: u.assignedAt, 
                                manager: u.manager
                              }:x));
                              alert(`✅ 배정 완료!\n\n담당자: ${u.manager}\n배정일: ${new Date(u.assignedAt).toLocaleDateString('ko-KR')}`);
                            }).catch(e=>{
                              console.error('배정 오류:', e);
                              alert(`배정 실패: ${e.message}`);
                            });
                          }}
                        >
                          배정완료
                        </button>
                      ) : (
                        <span className="text-green-700 text-xs font-medium">
                          완료
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 hidden md:table-cell">
                      {r.assignedAt ? new Date(r.assignedAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      <button
                        className="relative cursor-pointer select-none [z-index:9999] [pointer-events:auto] [touch-action:manipulation] px-1 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs whitespace-nowrap"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          fetch(`/api/admin/contracts/requests/${r.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'complete' }),
                          }).then(async (res)=>{
                            if (!res.ok) { 
                              const t = await res.text(); 
                              throw new Error(t || '상담완료 처리에 실패했습니다.'); 
                            }
                            const u = await res.json();
                            setRows(prev=>(prev || []).map(x=>x.id===r.id?{
                              ...x, 
                              status: u.backendStatus
                            }:x));
                            alert('✅ 상담완료 처리되었습니다!');
                          }).catch(e=>{
                            console.error('상담완료 오류:', e);
                            alert(`상담완료 실패: ${e.message}`);
                          });
                        }}
                      >
                        상담완료
                      </button>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      <button
                        className="relative cursor-pointer select-none [z-index:9999] [pointer-events:auto] [touch-action:manipulation] px-1 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs whitespace-nowrap"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // 배정변경 기능: 담당자를 다시 선택할 수 있도록 상태를 PENDING으로 되돌리기
                          alert('담당자 배정을 변경하시겠습니까?\n\n현재 담당자: ' + (r.manager || '미배정') + '\n\n변경 후 다시 담당자를 선택할 수 있습니다.');
                          
                          fetch(`/api/admin/contracts/requests/${r.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'reassign' }),
                          }).then(async (res)=>{
                            if (!res.ok) { 
                              const t = await res.text(); 
                              throw new Error(t || '배정변경 처리에 실패했습니다.'); 
                            }
                            const u = await res.json();
                            setRows(prev=>(prev || []).map(x=>x.id===r.id?{
                              ...x, 
                              status: u.backendStatus || 'PENDING',
                              manager: '', // 담당자 초기화
                              assignedAt: null // 배정일 초기화
                            }:x));
                            alert('✅ 배정변경 완료!\n\n이제 다시 담당자를 선택할 수 있습니다.');
                          }).catch(e=>{
                            console.error('배정변경 오류:', e);
                            alert(`배정변경 실패: ${e.message}`);
                          });
                        }}
                      >
                        배정변경
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            총 {total}개 중 {((page - 1) * limit) + 1}-{Math.min(page * limit, total)}개 표시
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page <= 1} 
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="text-sm text-gray-700">
              {page} / {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))} 
              disabled={page >= Math.ceil(total / limit)} 
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* 회원 검색 모달 */}
      {showMemberSearch && (
        <MemberSearchModal
          isOpen={showMemberSearch}
          onClose={() => setShowMemberSearch(false)}
          onSelect={(member) => {
            setSearchTerm(member.name);
            setShowMemberSearch(false);
          }}
        />
      )}

      {/* 메모 상세보기 모달 */}
      {showMemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMemoModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 mx-4 max-w-2xl w-full shadow-2xl transform animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">📝 신청 상세 내용</h3>
              <button
                onClick={() => setShowMemoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="모달 닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {selectedMemo}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowMemoModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
