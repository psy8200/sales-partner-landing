'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import MemberSearchModal from '@/components/MemberSearchModal';

interface PartnerApplicationItem {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  availableTime: string;
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
  availableTime?: string; // 상담가능시간
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
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);

  const allSelected = useMemo(() => rows.length > 0 && rows.every(r => selected[r.id]), [rows, selected]);
  const selectedIds = useMemo(() => rows.filter(r => selected[r.id]).map(r => r.id), [rows, selected]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('q', searchTerm);
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/consultation/consultations?${params.toString()}`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || '요청 실패');
      }
      const j = await res.json();
      const mapped: RequestRow[] = (j.items || []).map((it: any) => ({
        id: it.id,
        customerName: it.customerName,
        phone: it.phone,
        area: it.category || '-', // category를 area로 매핑
        availableTime: it.scheduledDate ? new Date(it.scheduledDate).toLocaleString('ko-KR') : '-',
        additionalNote: it.description || '-',
        status: it.status || 'PENDING',
        manager: it.assignedTo,
        assignedAt: it.assignedAt,
        createdAt: it.createdAt,
      }));
      setRows(mapped);
      setTotal(j.total || 0);
    } catch (e: unknown) {
              setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await fetch('/api/admin/managers');
      if (!res.ok) {
        throw new Error('담당자 목록을 불러오는데 실패했습니다.');
      }
      const data = await res.json();
      if (data.success && data.data) {
        setManagers(data.data);
      }
    } catch (e: unknown) {
      console.error('담당자 목록 조회 오류:', e);
    }
  };

  // 회원 선택 핸들러
  const handleMemberSelect = (member: any) => {
    setSearchTerm(member.name);
    setIsMemberSearchOpen(false);
  };

  useEffect(() => {
    fetchRequests();
    fetchManagers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[2560px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        <div className="space-y-2">
          {/* 헤더 섹션 */}
          <div className="border-b border-gray-200 pb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-blue-600 text-lg sm:text-xl md:text-2xl">📋</span>
              <span className="break-words">상담이력관리</span>
            </h1>
          </div>

          {/* 메인 컨테이너 */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* 검색 및 필터 섹션 */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="space-y-3 sm:space-y-4">
                {/* 검색 입력 */}
                <div className="flex flex-col xl:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="고객명/연락처/상품명 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm md:text-base transition-all duration-200"
                    />
                  </div>
                  
                  {/* 필터 및 버튼 그룹 */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-0 flex-1 sm:flex-none"
                        aria-label="상태 필터"
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
                        className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-0 flex-1 sm:flex-none"
                        aria-label="표시 행 수"
                      >
                        <option value={10}>10줄</option>
                        <option value={20}>20줄</option>
                        <option value={30}>30줄</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => { setPage(1); fetchRequests(); }}
                        className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap"
                      >
                        🔍 검색
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const params = new URLSearchParams();
                            if (selectedIds.length > 0) params.set('ids', selectedIds.join(','));
                            const res = await fetch(`/api/admin/consultation/consultations/export?${params.toString()}`);
                            if (!res.ok) { const t = await res.text(); throw new Error(t || '다운로드 실패'); }
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = selectedIds.length > 0 ? 'consultation-history-selected.xlsx' : 'consultation-history.xlsx';
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 테이블 섹션 */}
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 min-w-[1000px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input 
                        type="checkbox" 
                        aria-label="전체 선택" 
                        checked={allSelected} 
                        onChange={(e)=>{
                          const checked = e.target.checked; 
                          const map: Record<string, boolean> = {}; 
                          rows.forEach(r => map[r.id] = checked); 
                          setSelected(map);
                        }}
                        className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      고객명
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      연락처
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 hidden sm:table-cell">
                      지역
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 hidden lg:table-cell">
                      상담가능시간
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 hidden xl:table-cell">
                      메모
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      상태
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      담당자
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      배정여부
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 hidden md:table-cell">
                      배정일
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      상담여부
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={13} className="px-2 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-xs text-gray-600">불러오는 중...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={13} className="px-2 py-4 text-center text-red-600">
                        <div className="flex items-center justify-center">
                          <span className="text-red-500 text-sm">⚠️</span>
                          <span className="ml-2 text-xs">{error}</span>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-2 py-4 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-lg mb-1">📭</span>
                          <span className="text-xs">데이터가 없습니다.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-2 py-2 whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            aria-label="선택" 
                            checked={!!selected[r.id]} 
                            onChange={(e)=>{ 
                              const checked = e.target.checked; 
                              setSelected((prev)=>({ ...prev, [r.id]: checked })); 
                            }}
                            className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          <div className="truncate" title={r.customerName}>
                            {r.customerName}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                          <div className="truncate" title={r.phone}>
                            {r.phone}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 hidden sm:table-cell">
                          <div className="truncate" title={r.area}>
                            {r.area}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 hidden lg:table-cell">
                          <div className="truncate" title={r.availableTime || '-'}>
                            {r.availableTime || '-'}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-900 hidden xl:table-cell">
                          {r.additionalNote ? (
                            <div 
                              className="max-w-[180px] truncate cursor-pointer hover:text-blue-600" 
                              title={r.additionalNote}
                              onClick={() => {
                                if (r.additionalNote && r.additionalNote.length > 50) {
                                  alert(`메모 내용:\n\n${r.additionalNote}`);
                                }
                              }}
                            >
                              {r.additionalNote.length > 50 ? `${r.additionalNote.substring(0, 50)}...` : r.additionalNote}
                            </div>
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
                                setRows(prev=>prev.map(x=>x.id===r.id?{...x, manager:v}:x));
                              }}
                              className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-0"
                              aria-label="담당자 선택"
                              title="담당자를 선택하세요"
                            >
                              <option value="">담당자 선택</option>
                              {managers.map((manager) => (
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
                              className="px-1 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              disabled={!r.manager || r.manager.trim() === ''}
                              onClick={()=>{
                                const v = r.manager || '';
                                if (!v || v.trim() === '') {
                                  alert('담당자를 선택해주세요.');
                                  return;
                                }
                                
                                if (!confirm(`담당자 "${v}"로 배정하시겠습니까?\n\n고객: ${r.customerName}\n연락처: ${r.phone}`)) {
                                  return;
                                }

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
                                  setRows(prev=>prev.map(x=>x.id===r.id?{
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
                            className="px-1 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs whitespace-nowrap"
                            onClick={()=>{
                              fetch(`/api/admin/contracts/requests/${r.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'complete' }),
                              }).then(async (res)=>{
                                if (!res.ok) { 
                                  const errorData = await res.json();
                                  throw new Error(errorData.error || '상담완료 처리에 실패했습니다.');
                                }
                                const u = await res.json();
                                setRows(prev=>prev.map(x=>x.id===r.id?{
                                  ...x, 
                                  status: u.backendStatus,
                                  manager: u.manager // 담당자 정보도 업데이트
                                }:x));
                                alert(`✅ 상담완료 처리되었습니다!\n\n담당자: ${u.manager}`);
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
                            className="px-1 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs whitespace-nowrap"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // 되돌리기 기능: 해당 상담을 /consultation/requests 페이지로 이동
                              alert('이 상담을 상담신청관리 페이지로 되돌리시겠습니까?\n\n고객: ' + r.customerName + '\n연락처: ' + r.phone + '\n\n⚠️ 이 작업은 되돌릴 수 없습니다.');
                              
                              // 상담이력에서 상담신청으로 되돌리는 API 호출
                              fetch(`/api/admin/consultation/move-to-requests`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ consultationId: r.id }),
                              }).then(async (res)=>{
                                if (!res.ok) { 
                                  const errorData = await res.json();
                                  throw new Error(errorData.error || '되돌리기 처리에 실패했습니다.'); 
                                }
                                const result = await res.json();
                                
                                // 성공 시 해당 행을 테이블에서 제거
                                setRows(prev=>prev.filter(x=>x.id!==r.id));
                                setTotal(prev=>prev-1);
                                
                                alert('✅ 되돌리기 완료!\n\n' + result.message + '\n\n상담신청관리 페이지에서 확인하실 수 있습니다.');
                                
                                // 상담신청관리 페이지로 이동
                                window.location.href = '/admin/consultation/requests';
                              }).catch(e=>{
                                console.error('되돌리기 오류:', e);
                                alert(`되돌리기 실패: ${e.message}`);
                              });
                            }}
                            style={{
                              zIndex: 9999,
                              position: 'relative',
                              pointerEvents: 'auto',
                              cursor: 'pointer'
                            }}
                          >
                            되돌리기
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 섹션 */}
            <div className="bg-white px-3 py-2 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  disabled={page <= 1} 
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <button 
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                  disabled={page >= totalPages} 
                  className="ml-3 relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-700">
                    총 <span className="font-medium">{total.toLocaleString()}</span>건
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button 
                      onClick={() => setPage((p) => Math.max(1, p - 1))} 
                      disabled={page <= 1} 
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">이전</span>
                      ←
                    </button>
                    <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-700">
                      {page} / {totalPages}
                    </span>
                    <button 
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                      disabled={page >= totalPages} 
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">다음</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}