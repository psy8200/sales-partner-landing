'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  partnerStatus: string;
  address?: string;
  referralCode?: string;  // 추천인코드 필드 추가
}

const PartnerApplyPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    availableDate: '',
    availableTime: '',
    additionalNote: '',
    area: '',
    referralCode: ''
  });

  useEffect(() => {
    // 로그인된 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          console.log('사용자 정보:', userData.user); // 디버깅용
          setUser(userData.user);
          // 사용자 정보가 있으면 기본값으로 설정
          if (userData?.user?.address) {
            setFormData(prev => ({ ...prev, area: userData.user.address }));
          }
          
          // 추천인코드 설정 (회원가입시 입력값 우선, 없으면 기본값)
          if (!userData?.user?.referralCode) {
            // 추천인코드 설정 (회원가입시 입력값 우선, 없으면 기본값)
            try {
              const savedReferralCode = localStorage.getItem('companyReferralCode');
              if (savedReferralCode) {
                setUser(prev => prev ? { ...prev, referralCode: savedReferralCode } : null);
              }
            } catch (error) {
              console.error('기본추천인코드 로드 실패:', error);
            }
          }
        } else {
          console.error('사용자 정보 가져오기 실패:', response.status, response.statusText);
          setError('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        setError('사용자 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (!formData.availableDate) {
      alert('상담가능 날짜를 선택해주세요.');
      return;
    }
    
    if (!formData.availableTime) {
      alert('상담가능 시간을 선택해주세요.');
      return;
    }
    
    // 선택한 날짜가 오늘 이후인지 확인
    const selectedDate = new Date(formData.availableDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('상담가능 날짜는 오늘 이후로 선택해주세요.');
      return;
    }
    
    // 선택한 날짜가 30일 이후인지 확인
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    if (selectedDate > thirtyDaysLater) {
      alert('상담가능 날짜는 30일 이내로 선택해주세요.');
      return;
    }
    
    // 최종 확인
    const confirmSubmit = confirm(`파트너신청을 진행하시겠습니까?\n\n상담일: ${formData.availableDate}\n상담시간: ${formData.availableTime}`);
    if (!confirmSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/partner/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableDate: formData.availableDate,
          availableTime: formData.availableTime,
          additionalNote: formData.additionalNote,
          area: formData.area
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 성공 메시지를 더 친근하게 표시
        const successMessage = `🎉 ${user?.name}님의 파트너신청이 완료되었습니다!
        
관리자 상담 후 승인 처리됩니다.
1-2일 내에 연락드리겠습니다.`;
        
        alert(successMessage);
        
        // 부모 창 새로고침 후 창 닫기
        if (window.opener && !window.opener.closed) {
          window.opener.location.reload();
        }
        window.close();
      } else {
        console.error('파트너신청 실패:', result.error);
        alert(result.error || '파트너신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('파트너신청 오류:', error);
      alert('파트너신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 네트워크 오류인 경우 재시도 안내
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('네트워크 연결을 확인하고 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                로그인하기
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // 이미 파트너신청을 한 경우
  if (user.partnerStatus !== 'NOT_APPLIED') {
    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'PARTNER_APPLIED':
          return {
            title: '신청 완료',
            message: '파트너신청이 완료되었습니다. 관리자 상담 후 승인 처리됩니다.',
            icon: '📋'
          };
        case 'APPROVED':
          return {
            title: '승인 완료',
            message: '파트너 승인이 완료되었습니다. 파트너 회원으로 전환되었습니다.',
            icon: '✅'
          };
        default:
          return {
            title: '처리 중',
            message: '파트너신청이 처리 중입니다. 잠시만 기다려주세요.',
            icon: '⏳'
          };
      }
    };

    const statusInfo = getStatusMessage(user.partnerStatus);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">{statusInfo.icon}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{statusInfo.title}</h1>
          <p className="text-gray-600 mb-6">
            {statusInfo.message}
          </p>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            창 닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md min-h-[600px] flex flex-col"
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🤝 파트너신청</h1>
          <p className="text-gray-600 text-sm mb-2">
            {user.name}님의 상담가능 일정을 알려주세요
          </p>
          <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            💡 파트너가 되시면 매월 안정적인 수익을 창출하실 수 있습니다
          </div>
        </div>

        {/* 파트너신청 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          {/* 상담가능 날짜 */}
          <div>
            <label htmlFor="availableDate" className="block text-sm font-medium text-gray-700 mb-2">
              상담가능 날짜 *
            </label>
            <input
              id="availableDate"
              name="availableDate"
              type="date"
              value={formData.availableDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 30일 후까지
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">오늘부터 30일 이내로 선택해주세요</p>
          </div>

          {/* 지역 입력 */}
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
              지역
            </label>
            <input
              id="area"
              name="area"
              type="text"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="예: 서울특별시 강남구"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">주소가 등록된 경우 자동으로 입력됩니다.</p>
          </div>

          {/* 상담가능 시간 */}
          <div>
            <label htmlFor="availableTime" className="block text-sm font-medium text-gray-700 mb-2">
              상담가능 시간 *
            </label>
            <select
              id="availableTime"
              name="availableTime"
              value={formData.availableTime}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option key="default-time" value="">시간을 선택하세요</option>
              <option key="09:00-10:00" value="09:00-10:00">09:00-10:00</option>
              <option key="10:00-11:00" value="10:00-11:00">10:00-11:00</option>
              <option key="11:00-12:00" value="11:00-12:00">11:00-12:00</option>
              <option key="13:00-14:00" value="13:00-14:00">13:00-14:00</option>
              <option key="14:00-15:00" value="14:00-15:00">14:00-15:00</option>
              <option key="15:00-16:00" value="15:00-16:00">15:00-16:00</option>
              <option key="16:00-17:00" value="16:00-17:00">16:00-17:00</option>
              <option key="17:00-18:00" value="17:00-18:00">17:00-18:00</option>
              <option key="18:00-19:00" value="18:00-19:00">18:00-19:00</option>
              <option key="19:00-20:00" value="19:00-20:00">19:00-20:00</option>
            </select>
          </div>

          {/* 추천인코드 표시 */}
          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
              추천인코드
            </label>
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
              {user?.referralCode || 'SP001'}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              💡 회원가입 시 입력한 추천인코드입니다. 입력하지 않은 경우 기본값이 표시됩니다.
            </p>
          </div>

          {/* 추가 메모 */}
          <div className="flex-1">
            <label htmlFor="additionalNote" className="block text-sm font-medium text-gray-700 mb-2">
              추가 메모 (선택)
            </label>
            <textarea
              id="additionalNote"
              name="additionalNote"
              value={formData.additionalNote}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="보험상담 / 렌탈,상조상담 / 즉시가입신청 / 고객님의 기타 요구사항이 있으시면 입력해주세요"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.additionalNote.length}/500자
            </p>
          </div>

          {/* 신청 버튼 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                신청 중...
              </div>
            ) : (
              '🎯 파트너신청 완료하기'
            )}
          </button>
        </form>

        {/* 안내 메시지 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 신청 안내</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 신청 후 관리자 상담을 통해 파트너 승인됩니다</li>
            <li>• 상담 일정은 입력하신 시간을 우선 고려합니다</li>
            <li>• 승인 완료 시 파트너 회원으로 자동 변경됩니다</li>
            <li>• 신청 후 1-2일 내에 연락드립니다</li>
          </ul>
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => window.close()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                window.close();
              }
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            tabIndex={0}
          >
            취소하고 창 닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PartnerApplyPage;

