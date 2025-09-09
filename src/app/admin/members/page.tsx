'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { User } from '@/types';
import { safeJsonParse } from '@/lib/safeJson';



type Question = {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  answer: string;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
  answeredAt?: string;
};

 

// 안전한 숫자 포맷팅 함수
const safeNumberFormat = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return value.toLocaleString();
};

// 안전한 날짜 포맷팅 함수
const safeDateFormat = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString();
  } catch {
    return '-';
  }
};

const MembersPage = () => {
  const pathname = usePathname();
  const { user, isSuperAdmin, canCreateAdmin, canDeleteAdmin } = useAdminAuth();
  
  
  const mode: 'ALL' | 'GENERAL' | 'MEMBER' = pathname.endsWith('/general')
    ? 'GENERAL'
    : pathname.endsWith('/partners')
    ? 'MEMBER'
    : 'ALL';
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [referralCodeFilter, setReferralCodeFilter] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<{
    referralCodes: Array<{value: string, label: string}>;
  }>({
    referralCodes: []
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<{ total: number; general: number; partner: number; partnerRate: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Record<string, boolean>>({});
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionPageSize, setQuestionPageSize] = useState(20);
  
  // 프로필변경요청 관련 상태
  const [profileChangeRequests, setProfileChangeRequests] = useState<any[]>([]);
  const [selectedProfileRequests, setSelectedProfileRequests] = useState<Record<string, boolean>>({});
  const [profileRequestSearch, setProfileRequestSearch] = useState('');
  const [profileRequestPageSize, setProfileRequestPageSize] = useState(20);
  

  const allSelected = useMemo(() => rows.length > 0 && rows.every(r => selected[r.id]), [rows, selected]);
  const selectedIds = useMemo(() => rows.filter(r => selected[r.id]).map(r => r.id), [rows, selected]);

  // 필터 옵션 가져오기
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/admin/users/filter-options');
      const data = await response.json();
      if (response.ok) {
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('필터 옵션 로드 오류:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('q', searchTerm);
      if (status) params.set('status', status);
      if (role) params.set('role', role);
      if (referralCodeFilter) params.set('referralCodeFilter', referralCodeFilter);
      if (mode === 'GENERAL') params.set('role', 'GENERAL');
      if (mode === 'MEMBER') params.set('role', 'MEMBER');
      if (mode === 'ADMIN') params.set('role', 'ADMIN');

      console.log('Fetching users with mode:', mode, 'params:', params.toString());
      console.log('Current pathname:', pathname);
      console.log('Pathname includes /partners:', pathname.includes('/partners'));

      // 회원 전용 API 사용
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      console.log('API response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response text:', errorText);
        throw new Error(`API 오류 (${res.status}): ${errorText}`);
      }
      
      const jsonResult = await safeJsonParse(res);
      console.log('API response:', jsonResult);
      
      // API가 직접 items와 total을 반환하므로 success 체크 제거
      const data = jsonResult as unknown as { items: User[]; total: number };
      console.log('API response data:', data);
      
      // null 체크 추가
      if (!data || !data.items) {
        console.error('Invalid data structure:', data);
        throw new Error('데이터 구조가 올바르지 않습니다.');
      }
      
      setRows(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      console.error('Error fetching users:', e);
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/users/stats');
      const data = await res.json();
      if (res.ok && data) {
        setStats({
          total: data.total || 0,
          general: data.generalUsers || 0,
          partner: data.activePartners || 0,
          partnerRate: data.activePartners > 0 ? Math.round((data.activePartners / data.total) * 100) : 0
        });
      } else {
        console.error('Stats API error:', data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions...');
      const params = new URLSearchParams();
      if (questionSearch) params.set('q', questionSearch);
      if (questionPageSize) params.set('limit', String(questionPageSize));
      
      const url = `/api/admin/questions?${params.toString()}`;
      console.log('Fetching from URL:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log('Questions API response:', data);
      console.log('Response status:', res.status);
      
      if (res.ok && data) {
        console.log('Setting questions:', data.questions);
        setQuestions(data.questions || []);
      } else {
        console.error('Questions API error:', data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // 프로필변경요청 목록 가져오기
  const fetchProfileChangeRequests = async () => {
    try {
      console.log('Fetching profile change requests...');
      const params = new URLSearchParams();
      if (profileRequestSearch) params.set('q', profileRequestSearch);
      if (profileRequestPageSize) params.set('limit', String(profileRequestPageSize));
      
      const url = `/api/profile-change-requests?${params.toString()}`;
      console.log('Fetching from URL:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log('Profile change requests API response:', data);
      
      if (res.ok && data.success && data.requests) {
        console.log('Setting profile change requests:', data.requests);
        setProfileChangeRequests(data.requests);
      } else {
        console.error('Profile change requests API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching profile change requests:', error);
    }
  };

  // 프로필변경요청 수정완료 처리
  const handleCompleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/profile-change-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('프로필변경요청이 수정완료로 변경되었습니다.');
        // 목록 새로고침
        fetchProfileChangeRequests();
      } else {
        alert(data.error || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('요청 완료 처리 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    // mode가 변경되면 페이지를 1로 리셋
    if (page !== 1) {
      setPage(1);
      return;
    }
    console.log('Loading data for mode:', mode);
    
    // 함수를 inline으로 정의하여 의존성 문제 해결
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (searchTerm) params.set('q', searchTerm);
        if (mode === 'GENERAL') params.set('role', 'GENERAL');
        if (mode === 'MEMBER') params.set('role', 'MEMBER');
        if (mode === 'ADMIN') params.set('role', 'ADMIN');

        console.log('Fetching users with mode:', mode, 'params:', params.toString());

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API error response text:', errorText);
          throw new Error(`API 오류 (${res.status}): ${errorText}`);
        }
        
        const data = await res.json();
        console.log('API response data:', data);
        
        // 회원 데이터 처리
        if (!data || !data.items) {
          console.error('Invalid data structure:', data);
          throw new Error('데이터 구조가 올바르지 않습니다.');
        }
        setRows(data.items);
        setTotal(data.total);
      } catch (e: unknown) {
        console.error('Error fetching users:', e);
        setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    if (mode === 'ALL') {
      // fetchStats 호출
      fetch('/api/admin/users/stats')
        .then(res => res.json())
        .then(data => {
          if (data) {
            setStats({
              total: data.total || 0,
              general: data.general || 0,
              partner: data.partner || 0,
              partnerRate: data.partnerRate || 0,
            });
          }
        })
        .catch(error => {
          console.error('Error fetching stats:', error);
        });

      // fetchQuestions 호출
      const questionParams = new URLSearchParams();
      if (questionSearch) questionParams.set('q', questionSearch);
      if (questionPageSize) questionParams.set('limit', String(questionPageSize));
      
      fetch(`/api/admin/questions?${questionParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.questions) {
            setQuestions(data.questions || []);
          }
        })
        .catch(error => {
          console.error('Error fetching questions:', error);
        });

      // fetchProfileChangeRequests 호출
      const profileRequestParams = new URLSearchParams();
      if (profileRequestSearch) profileRequestParams.set('q', profileRequestSearch);
      if (profileRequestPageSize) profileRequestParams.set('limit', String(profileRequestPageSize));
      
      fetch(`/api/profile-change-requests?${profileRequestParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.requests) {
            setProfileChangeRequests(data.requests || []);
          }
        })
        .catch(error => {
          console.error('Error fetching profile change requests:', error);
        });
    }
  }, [page, limit, mode, searchTerm, status, role, questionSearch, questionPageSize, profileRequestSearch, profileRequestPageSize]);

  // 필터 옵션 로드
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const statusLabel = (s: string) => {
    switch (s) {
      case 'ACTIVE': return '가입완료';
      case 'PENDING': return '대기중';
      case 'SUSPENDED': return '정지중';
      case 'DELETED': return '삭제';
      default: return s;
    }
  };

  const roleLabel = (r: string, referralCode?: string) => {
    // 최고관리자 구분 (referralCode가 'SUPER_ADMIN'인 경우)
    if (r === 'ADMIN' && referralCode === 'SUPER_ADMIN') {
      return '최고관리자';
    }
    
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
    a.download = 'users.xlsx';
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
    
    try {
      const res = await fetch('/api/admin/users/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const j = await res.json();
      if (!res.ok) {
        alert(j.error || '삭제 실패');
        return;
      }
      alert(`삭제됨: ${j.deleted}명`);
      setSelected({});
      fetchUsers();
      if (mode === 'ALL') {
        fetchStats();
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAnswerQuestion = async (questionId: string, answer: string) => {
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '답변 등록에 실패했습니다.');
      }

      alert('답변이 등록되었습니다.');
      fetchQuestions();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '알 수 없는 오류');
    }
  };

  

  

  

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {mode === 'ALL' ? '📊 회원관리' : mode === 'GENERAL' ? '👤 일반회원(예비파트너)' : mode === 'MEMBER' ? '🤝 파트너회원' : '🛡️ 관리자'}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">세일즈 파트너 회원들을 관리하세요.</p>
      </div>

      {/* 통계 박스 4개 - 회원관리 메인 페이지에서만 표시 */}
      {mode === 'ALL' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg p-3 sm:p-4 lg:p-5 border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-500">총 회원수</div>
            <div className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">{safeNumberFormat(stats?.total)}</div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-3 sm:p-4 lg:p-5 border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-500">일반회원</div>
            <div className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-700">{safeNumberFormat(stats?.general)}</div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-3 sm:p-4 lg:p-5 border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-500">파트너회원수</div>
            <div className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-700">{safeNumberFormat(stats?.partner)}</div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-3 sm:p-4 lg:p-5 border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-500">파트너회원전환율</div>
            <div className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-purple-700">{stats ? `${stats.partnerRate}%` : '-'}</div>
          </div>
        </div>
      )}



            {/* 질문하기/건의사항 게시판 - 회원관리 메인 페이지에서만 표시 */}
      {mode === 'ALL' && (
        <>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>디버깅 정보:</strong> 모드: {mode}, 문의 수: {questions.length}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">질문하기 / 건의사항</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={questionPageSize}
                    onChange={(e) => { setQuestionPageSize(Number(e.target.value)); fetchQuestions(); }}
                    className="px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    aria-label="표시 행 수"
                    title="표시 행 수"
                  >
                                    <option key="members-10" value={10}>10줄</option>
                <option key="members-20" value={20}>20줄</option>
                <option key="members-30" value={30}>30줄</option>
                  </select>
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchQuestions(); }}
                    placeholder="질문/내용/작성자 검색..."
                    className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                  />
                  <button
                    onClick={() => fetchQuestions()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                  >
                    검색
                  </button>
                  <button
                    onClick={async () => {
                      const ids = Object.entries(selectedQuestion).filter(([,v])=>v).map(([id])=>id);
                      if (ids.length === 0) { alert('삭제할 항목을 선택하세요.'); return; }
                      if (!confirm(`${ids.length}건을 삭제하시겠습니까?`)) return;
                      const res = await fetch('/api/admin/questions/bulk', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids }),
                      });
                      const j = await res.json();
                      if (!res.ok) { alert(j.error || '삭제 실패'); return; }
                      alert(`삭제됨: ${j.deleted}`);
                      setSelectedQuestion({});
                      fetchQuestions();
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        aria-label="전체 선택"
                        title="전체 선택"
                        checked={questions.length>0 && questions.every(q=>selectedQuestion[q.id])}
                        onChange={(e)=>{
                          const checked = e.target.checked;
                          const map: Record<string, boolean> = {};
                          questions.forEach(q=> map[q.id] = checked);
                          setSelectedQuestion(map);
                        }}
                      />
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">작성자</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">제목</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">질문내용</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">답변내용</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">작성일</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">답변</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                        질문이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    questions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <input
                            type="checkbox"
                            aria-label="선택"
                            checked={!!selectedQuestion[question.id]}
                            onChange={(e)=>{
                              const checked = e.target.checked;
                              setSelectedQuestion(prev=>({ ...prev, [question.id]: checked }));
                            }}
                          />
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {question.userName}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {question.title}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                          {question.content}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                          {question.answer ? (
                            <span className="truncate">{question.answer}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            question.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {question.status === 'PENDING' ? '답변대기' : '답변완료'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {new Date(question.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          {question.status === 'PENDING' ? (
                            <button
                              onClick={() => {
                                const answer = prompt('답변을 입력하세요:');
                                if (answer) {
                                  handleAnswerQuestion(question.id, answer);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              답변하기
                            </button>
                          ) : (
                            <span className="text-green-600">답변완료</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 프로필변경요청리스트 - 회원관리 메인 페이지에서만 표시 */}
      {mode === 'ALL' && (
        <>
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">프로필변경요청리스트</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={profileRequestPageSize}
                      onChange={(e) => { setProfileRequestPageSize(Number(e.target.value)); fetchProfileChangeRequests(); }}
                      className="px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      aria-label="표시 행 수"
                      title="표시 행 수"
                    >
                      <option value={10}>10줄</option>
                      <option value={20}>20줄</option>
                      <option value={30}>30줄</option>
                    </select>
                    <input
                      type="text"
                      placeholder="이름/연락처/요청내용 검색..."
                      value={profileRequestSearch}
                      onChange={(e) => setProfileRequestSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') fetchProfileChangeRequests(); }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    />
                    <button
                      onClick={() => fetchProfileChangeRequests()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                    >
                      검색
                    </button>
                    <button
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm"
                    >
                      삭제하기
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        aria-label="전체 선택"
                        title="전체 선택"
                      />
                    </th>
                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-24">
                      이름
                    </th>
                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-32">
                      연락처
                    </th>
                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider min-w-0 flex-1">
                      요청내용
                    </th>
                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-24">
                      상태값
                    </th>
                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-24">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profileChangeRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                        프로필변경요청이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    profileChangeRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProfileRequests[request.id] || false}
                            onChange={(e) => {
                              setSelectedProfileRequests(prev => ({
                                ...prev,
                                [request.id]: e.target.checked
                              }));
                            }}
                            aria-label={`${request.userName} 선택`}
                            title={`${request.userName} 선택`}
                          />
                        </td>
                        <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {request.userName}
                        </td>
                        <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {request.userPhone}
                        </td>
                        <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={request.content}>
                            {request.content}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'PENDING' ? '요청중' :
                             request.status === 'PROCESSING' ? '처리중' :
                             request.status === 'COMPLETED' ? '수정완료' : '거부'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {request.status === 'COMPLETED' ? (
                            <span className="text-green-600 text-xs">처리완료</span>
                          ) : (
                            <button
                              onClick={() => handleCompleteRequest(request.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              수정완료
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      

             {/* 회원 목록 테이블 - 모든 하위 페이지에서 표시 */}
       {mode !== 'ALL' && (
         <div className="bg-white shadow rounded-lg">
           <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
             <div className="flex flex-col gap-3">
               <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                 {mode === 'GENERAL' ? '일반회원 목록' : mode === 'MEMBER' ? '파트너회원 목록' : '관리자 목록'}
               </h2>
               <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                 {/* 검색바와 검색버튼 그룹 */}
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                   <input
                     type="text"
                     placeholder="회원명 또는 이메일로 검색..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full sm:w-80 px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                   />
                   <button
                     onClick={() => { setPage(1); fetchUsers(); }}
                     className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                   >
                     검색
                   </button>
                 </div>
                 
                 {/* 다운드롭바들 */}
                 <select
                   value={referralCodeFilter}
                   onChange={(e) => {
                     setReferralCodeFilter(e.target.value);
                     setPage(1);
                     fetchUsers();
                   }}
                   aria-label="추천인 코드 필터"
                   className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-auto"
                 >
                   <option value="">추천인코드 전체</option>
                   {filterOptions.referralCodes.map((option) => (
                     <option key={option.value} value={option.value}>
                       {option.label}
                     </option>
                   ))}
                 </select>
                 
                 {/* 삭제버튼 */}
                 <button
                   onClick={bulkDelete}
                   className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
                   title="선택된 회원 삭제"
                 >
                   삭제하기
                 </button>
               </div>
             </div>
           </div>

           {/* 회원 테이블 */}
           <div className="overflow-x-auto">
             <table className="w-full divide-y divide-gray-200">
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
                   <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">추천인코드</th>
                   <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                   {pathname.includes('/partners') && (
                     <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결정포인트</th>
                   )}
                   <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접속여부</th>
                   <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                   <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {loading ? (
                   <tr><td className="p-3 sm:p-6" colSpan={pathname.includes('/partners') ? 8 : 7}>불러오는 중...</td></tr>
                 ) : error ? (
                   <tr><td className="p-3 sm:p-6 text-red-600 text-xs sm:text-sm" colSpan={pathname.includes('/partners') ? 8 : 7}>{error}</td></tr>
                 ) : rows.length === 0 ? (
                   <tr><td className="p-3 sm:p-6 text-xs sm:text-sm" colSpan={pathname.includes('/partners') ? 8 : 7}>데이터가 없습니다.</td></tr>
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
                       <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                         {member.referralCode || '-'}
                       </td>
                       <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{safeDateFormat(member.createdAt)}</td>
                       {pathname.includes('/partners') && (
                         <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{safeNumberFormat(member.points)}P</td>
                       )}
                       <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           member.isOnline 
                             ? 'bg-green-100 text-green-800' // 접속중: 초록색
                             : 'bg-gray-100 text-gray-800'   // 대기중: 회색
                         }`}>
                           {member.isOnline ? '접속중' : '대기중'}
                         </span>
                         {member.lastLoginAt && (
                           <div className="text-xs text-gray-500 mt-1">
                             {new Date(member.lastLoginAt).toLocaleString('ko-KR')}
                           </div>
                         )}
                       </td>
                       <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           member.role === 'ADMIN' && member.referralCode === 'SUPER_ADMIN'
                             ? 'bg-red-100 text-red-800' // 최고관리자: 빨간색
                             : member.role === 'ADMIN' 
                             ? 'bg-purple-100 text-purple-800' // 일반관리자: 보라색
                             : member.role === 'MEMBER' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                         }`}>
                           {roleLabel(member.role, member.referralCode)}
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
             <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">총 {safeNumberFormat(total)}명</div>
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
       )}

    </div>
  );
};

export default MembersPage;
