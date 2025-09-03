'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  partnerStatus: string;
  lastLoginAt: string | null;
  loginCount: number;
  createdAt: string;
  points: number;
  bankName: string;
  bankAccount: string;
  totalPoints?: number;
};

const PartnersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allSelected = useMemo(() => rows.length > 0 && rows.every(r => selected[r.id]), [rows, selected]);
  const selectedIds = useMemo(() => rows.filter(r => selected[r.id]).map(r => r.id), [rows, selected]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('q', searchTerm);
      if (status) params.set('status', status);
              if (role) params.set('role', role);
    params.set('role', 'MEMBER');
    params.set('partnerStatus', 'APPROVED'); // 승인된 파트너만 조회

      console.log('Fetching partner users with params:', params.toString());
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      console.log('API response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response text:', errorText);
        throw new Error(`API 오류 (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      console.log('API response data:', data);
      
      if (!data || !data.items) {
        console.error('Invalid data structure:', data);
        throw new Error('데이터 구조가 올바르지 않습니다.');
      }
      
      // 각 사용자의 포인트 데이터 가져오기
      const usersWithPoints = await Promise.all(
        data.items.map(async (user: UserRow) => {
          try {
            const pointsRes = await fetch(`/api/admin/users/${user.id}/points`);
            if (pointsRes.ok) {
              const pointsData = await pointsRes.json();
              return { ...user, totalPoints: pointsData.totalPoints };
            }
          } catch (error) {
            console.error(`포인트 데이터 로드 실패 (${user.id}):`, error);
          }
          return { ...user, totalPoints: 0 };
        })
      );
      
      setRows(usersWithPoints);
      setTotal(data.total);
    } catch (e: unknown) {
      console.error('Error fetching users:', e);
              setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, status, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);



  const roleLabel = (r: string) => {
    switch (r) {
      case 'GENERAL': return '예비파트너';
      case 'MEMBER': return '파트너';
      case 'ADMIN': return '관리자';
      default: return r;
    }
  };

  const partnerStatusLabel = (s: string) => {
    switch (s) {
      case 'NOT_APPLIED': return '미신청';
      case 'PARTNER_APPLIED': return '파트너신청';
      case 'APPROVED': return '승인완료';
      default: return s;
    }
  };

  const exportExcel = async () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (role) params.set('role', role);
    if (selectedIds.length > 0) params.set('ids', selectedIds.join(','));
    params.set('role', 'MEMBER');
    params.set('partnerStatus', 'APPROVED');

    const res = await fetch(`/api/admin/exports/users?${params.toString()}`);
    if (!res.ok) {
      const j = await res.json();
      alert(j.error || '엑셀 내보내기에 실패했습니다.');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partner-users.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 회원을 선택하세요.');
      return;
    }
    if (!confirm(`${selectedIds.length}명을 삭제하시겠습니까?`)) return;
    const res = await fetch('/api/admin/users/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });
    const j = await res.json();
    if (!res.ok) {
      alert(j.error || '삭제 실패');
      return;
    }
    alert(`삭제됨: ${j.deleted}`);
    setSelected({});
    fetchUsers();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">🤝 파트너회원</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">승인된 파트너 회원들을 관리하세요.</p>
      </div>

      {/* 회원 목록 테이블 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">파트너회원 목록</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="회원명 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                  aria-label="상태 필터"
                  title="상태 필터"
                >
                                       <option key="all-status" value="">전체 상태</option>
                                  <option key="partners-ACTIVE" value="ACTIVE">가입완료</option>
                <option key="partners-PENDING" value="PENDING">대기중</option>
                <option key="partners-SUSPENDED" value="SUSPENDED">정지중</option>
                <option key="partners-DELETED" value="DELETED">삭제</option>
                </select>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                  aria-label="역할 필터"
                  title="역할 필터"
                >
                                       <option key="all-role" value="">전체 역할</option>
                                  <option key="partners-GENERAL" value="GENERAL">예비파트너</option>
                <option key="partners-MEMBER" value="MEMBER">파트너</option>
                <option key="partners-ADMIN" value="ADMIN">관리자</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => { setPage(1); fetchUsers(); }}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                >
                  검색
                </button>
                <button
                  onClick={bulkDelete}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
                >
                  삭제하기
                </button>
                <button
                  onClick={exportExcel}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm"
                >
                  {selectedIds.length > 0 ? '선택 다운로드' : '엑셀 다운로드'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 회원 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" aria-label="전체 선택" title="전체 선택" checked={allSelected} onChange={(e)=>{
                    const checked = e.target.checked;
                    const map: Record<string, boolean> = {};
                    rows.forEach(r => map[r.id] = checked);
                    setSelected(map);
                  }} />
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일주소</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결정포인트</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">은행명</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계좌번호</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">파트너상태</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td className="p-3 sm:p-6" colSpan={9}>불러오는 중...</td></tr>
              ) : error ? (
                <tr><td className="p-3 sm:p-6 text-red-600 text-xs sm:text-sm" colSpan={9}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-3 sm:p-6 text-xs sm:text-sm" colSpan={9}>데이터가 없습니다.</td></tr>
              ) : (
                rows.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                      <input type="checkbox" aria-label="선택" checked={!!selected[member.id]} onChange={(e)=>{
                        const checked = e.target.checked;
                        setSelected((prev)=>({ ...prev, [member.id]: checked }));
                      }} />
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{member.name}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{member.phone}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{member.email}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{new Date(member.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{member.totalPoints?.toLocaleString() || '0'}원</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{member.bankName || '-'}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{member.bankAccount || '-'}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{roleLabel(member.role)}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.partnerStatus === 'NOT_APPLIED' ? 'bg-gray-100 text-gray-800' :
                        member.partnerStatus === 'PARTNER_APPLIED' ? 'bg-yellow-100 text-yellow-800' :
                        member.partnerStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {partnerStatusLabel(member.partnerStatus)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <button
                        onClick={() => window.open(`/admin/members/${member.id}/edit`, '_blank', 'width=720,height=720,scrollbars=yes,resizable=yes')}
                        className="px-2 sm:px-3 py-1 border rounded hover:bg-gray-50 text-xs sm:text-sm"
                        aria-label="수정"
                        title="수정"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">총 {total.toLocaleString()}명</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2 sm:px-3 py-1 rounded border disabled:opacity-50 text-xs sm:text-sm"
            >
              이전
            </button>
            <span className="text-xs sm:text-sm">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2 sm:px-3 py-1 rounded border disabled:opacity-50 text-xs sm:text-sm"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;
