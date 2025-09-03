'use client';

import React, { useEffect, useState } from 'react';

const MemberEditPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const getUserId = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
    };
    getUserId();
  }, [params]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    points: 0,
    referralCode: '', // 기본추천코드 (회사정보관리에서 가져옴)
    bankName: '',
    accountHolder: '',
    bankAccount: ''
  });

  const [defaultReferralCode, setDefaultReferralCode] = useState(''); // 기본추천코드

  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    totalContracts: 0,
    categoryPoints: []
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return; // userId가 없으면 실행하지 않음
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 사용자 정보 요청 시작:', { userId, url: `/api/admin/users/${userId}` });
        
        const res = await fetch(`/api/admin/users/${userId}`);
        console.log('📡 API 응답 상태:', { status: res.status, ok: res.ok });
        
        const data = await res.json();
        console.log('📊 API 응답 데이터:', data);
        console.log('🔍 데이터 필드 확인:', {
          name: data.name,
          email: data.email,
          phone: data.phone,
          referralCode: data.referralCode
        });
        if (!res.ok) {
          const errorMessage = data.error || '사용자 정보를 불러오지 못했습니다.';
          const errorDetails = data.details ? ` (${data.details})` : '';
          throw new Error(`${errorMessage}${errorDetails}`);
        }
        
        const newFormData = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          points: data.points ?? 0,
          referralCode: data.referralCode || '', // API에서 받은 추천인코드만 사용
          bankName: data.bankName || '',
          accountHolder: data.accountHolder || '',
          bankAccount: data.bankAccount || ''
        };
        
        console.log('🔄 formData 설정:', newFormData);
        setFormData(newFormData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // 기본추천코드 로드 (사용자의 추천인코드가 없을 때만 사용)
  useEffect(() => {
    const loadDefaultReferralCode = async () => {
      try {
        const res = await fetch('/api/admin/company-info');
        const data = await res.json();
        
        if (data.success && data.data && data.data.referralCodeDefault) {
          setDefaultReferralCode(data.data.referralCodeDefault);
        }
      } catch (error) {
        console.error('기본추천코드 로드 실패:', error);
      }
    };

    loadDefaultReferralCode();
  }, []);

  // 포인트 데이터 가져오기
  useEffect(() => {
    const fetchPoints = async () => {
      if (!userId) return;
      
      try {
        const res = await fetch(`/api/admin/users/${userId}/points`);
        if (res.ok) {
          const data = await res.json();
          setPointsData(data);
        }
      } catch (error) {
        console.error('포인트 데이터 로드 실패:', error);
      }
    };

    fetchPoints();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '저장에 실패했습니다.');
      }
      
      alert('저장되었습니다.');
      if (window.opener && !window.opener.closed) {
        try { window.opener.location.reload(); } catch {}
      }
      window.close();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handlePartnerApproval = async () => {
    if (!confirm('이 사용자를 파트너로 승인하시겠습니까?')) return;
    
    try {
      const approvalData = {
        ...formData,
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      };
      
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '파트너 승인 처리에 실패했습니다.');
      }
      
      alert('파트너 승인 처리가 완료되었습니다.');
      setFormData(approvalData);
      if (window.opener && !window.opener.closed) {
        try { window.opener.location.reload(); } catch {}
      }
      window.close();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  if (!userId) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">사용자 ID를 불러오는 중...</p>
      </div>
    </div>
  );
  
  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-600 mb-2">오류가 발생했습니다</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• 사용자 ID: {userId}</p>
          <p>• 페이지 새로고침을 시도해보세요</p>
          <p>• 문제가 지속되면 관리자에게 문의하세요</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-6">회원정보수정</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-label="이름 입력"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-label="연락처 입력"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-label="이메일 입력"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              추천인코드 
              <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                🔒 보안필드
              </span>
            </label>
            <input
              type="text"
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
              placeholder={defaultReferralCode ? `기본값: ${defaultReferralCode}` : "추천인코드를 입력하세요"}
              aria-label="추천인코드 입력"
            />

          </div>

          {/* 은행 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">은행명</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="은행명을 입력하세요"
                aria-label="은행명 입력"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예금주명을 입력하세요"
                aria-label="예금주 입력"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="계좌번호를 입력하세요"
                aria-label="계좌번호 입력"
              />
            </div>
          </div>

          {/* 포인트 정보 - 모든 회원에게 표시 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">포인트 정보</label>
            <div className="bg-gray-50 p-4 rounded-md relative">
              {/* 파트너 승인 상태 표시 */}
              <div className="absolute top-2 right-2 text-right">
                <div className="space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    pointsData.totalPoints >= 50000 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {pointsData.totalPoints >= 50000 ? '파트너승인' : '파트너승인대기'}
                  </span>
                  <div className="text-xs text-gray-500">
                    50,000P 이상 = 승인
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <span className="font-semibold text-lg">
                  포인트 합계: {pointsData.totalPoints.toLocaleString()}원 (총 {pointsData.totalContracts}건)
                </span>
              </div>
              
              {pointsData.categoryPoints.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">카테고리별 포인트:</div>
                  <div className="space-y-2">
                                            {pointsData.categoryPoints.map((category: {category: string, points: number, count: number}, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              category.category === 'INSURANCE' ? 'bg-blue-100 text-blue-800' :
                              category.category === 'RENTAL' ? 'bg-yellow-100 text-yellow-800' :
                              category.category === 'RENTAL_MALL' ? 'bg-yellow-100 text-yellow-800' :
                              category.category === 'FUNERAL' ? 'bg-purple-100 text-purple-800' :
                              category.category === 'INTERNET_TV' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.category === 'INSURANCE' ? '보험' :
                               category.category === 'RENTAL' ? '렌탈몰' :
                               category.category === 'RENTAL_MALL' ? '렌탈몰' :
                               category.category === 'FUNERAL' ? '상조' :
                               category.category === 'INTERNET_TV' ? '인터넷TV' : category.category}
                            </span>
                            <span className="font-medium">
                              {category.points.toLocaleString()}원 ({category.count}건)
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
              )}
              
              {pointsData.totalContracts === 0 && (
                <div className="text-gray-500 text-sm">계약 정보가 없습니다.</div>
              )}
            </div>
          </div>



          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
            {pointsData.totalPoints >= 50000 && (
              <button
                type="button"
                onClick={handlePartnerApproval}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                파트너 승인처리
              </button>
            )}
            <button
              type="button"
              onClick={() => window.close()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberEditPage;
