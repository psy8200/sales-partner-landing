'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomTab } from '../(member)/member/_components/BottomTab';
import { ChevronRight, Users } from 'lucide-react';

// 애니메이션 스타일
const bounceInStyle = `
  @keyframes bounce-in {
    0% {
      transform: scale(0.3) rotate(-10deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.05) rotate(5deg);
      opacity: 0.8;
    }
    70% {
      transform: scale(0.95) rotate(-2deg);
      opacity: 0.9;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.6s ease-out;
  }
`;

const PartnerPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('partner');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // 내 정보 상태
  const [myInfo, setMyInfo] = useState<any>(null);
  const [myInfoLoading, setMyInfoLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  
  // N차 회원 리스트 상태 (동적 배열)
  const [levelStates, setLevelStates] = useState<Array<{
    show: boolean;
    data: any[];
    loading: boolean;
  }>>([]);

  // 초대링크 생성 및 복사 함수
  const handleInviteLink = async () => {
    try {
      // 내코드 (전화번호 뒤 8자리) 추출
      const myCode = userInfo?.customerPhone?.slice(-8) || '11111234';
      
      // 초대링크 생성 (PWA용 회원가입 페이지)
      const url = `${window.location.origin}/pwa-signup?ref=${myCode}`;
      
      // 클립보드에 복사
      await navigator.clipboard.writeText(url);
      
      // 모달에 URL 저장하고 표시
      setInviteUrl(url);
      setShowInviteModal(true);
      
      console.log('초대링크 복사 완료:', url);
    } catch (error) {
      console.error('초대링크 복사 실패:', error);
      alert('초대링크 복사에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 모달 닫기 함수
  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteUrl('');
  };

  // N차 회원 리스트 토글 함수
  const handleLevelToggle = async (level: number) => {
    if (!userInfo) return;

    const currentState = levelStates[level - 1];
    if (!currentState) return;

    if (!currentState.show) {
      // 아코디언 열기
      setLevelStates(prev => prev.map((state, index) => 
        index === level - 1 ? { ...state, loading: true } : state
      ));
      
      try {
        console.log(`🔍 ${level}차 회원 리스트 조회 시작`);
        
        let referralCodes: string[] = [];
        
        if (level === 1) {
          // 1차: 현재 사용자의 내코드로 조회
          const myCode = userInfo.customerPhone?.slice(-8) || '01011111234';
          referralCodes = [myCode];
        } else {
          // 2차 이상: 이전 레벨 회원들의 내코드 추출
          const prevLevelData = levelStates[level - 2]?.data || [];
          referralCodes = prevLevelData.map(member => 
            member.customerPhone.slice(-8)
          );
        }
        
        console.log(`📋 ${level}차 조회용 내코드들:`, referralCodes);
        
        // 각 내코드의 추천인들을 조회
        const allLevelData = [];
        for (const code of referralCodes) {
          const response = await fetch(`/api/mypage/first-level-referrals?userPhone=${code.padStart(11, '010')}`);
          const result = await response.json();
          
          if (result.success && result.data.length > 0) {
            const formattedData = result.data.map((item: any) => ({
              customerPhone: item.phone,
              finalPoints: item.points
            }));
            allLevelData.push(...formattedData);
          }
        }
        
        console.log(`✅ ${level}차 추천인들:`, allLevelData);
        
        // 상태 업데이트
        setLevelStates(prev => prev.map((state, index) => 
          index === level - 1 
            ? { ...state, data: allLevelData, show: true, loading: false }
            : state
        ));
        
        // 다음 레벨이 없으면 새로 추가
        if (level === levelStates.length) {
          setLevelStates(prev => [...prev, {
            show: false,
            data: [],
            loading: false
          }]);
        }
        
      } catch (error) {
        console.error(`${level}차 추천인 데이터 로드 오류:`, error);
        setLevelStates(prev => prev.map((state, index) => 
          index === level - 1 
            ? { ...state, data: [], show: true, loading: false }
            : state
        ));
      }
    } else {
      // 아코디언 닫기
      setLevelStates(prev => prev.map((state, index) => 
        index === level - 1 
          ? { ...state, show: false, data: [] }
          : state
      ));
    }
  };

  // 레벨 상태 초기화
  const initializeLevelStates = () => {
    setLevelStates([{
      show: false,
      data: [],
      loading: false
    }]);
  };

  // 내 정보 로드 함수 (모든 레벨의 총인원 계산)
  const loadMyInfo = async () => {
    if (!userInfo?.customerPhone) {
      console.log('userInfo 또는 customerPhone이 없음:', userInfo);
      return;
    }
    
    console.log('내 정보 로드 시작:', userInfo.customerPhone);
    setMyInfoLoading(true);
    
    try {
      // 1차 추천인 조회
      const response = await fetch(`/api/mypage/first-level-referrals?userPhone=${userInfo.customerPhone}`);
      const result = await response.json();
      
      if (result.success) {
        let totalMembers = result.data.length; // 1차 회원 수
        let totalPoints = result.data.reduce((sum: number, member: any) => sum + (member.points || 0), 0); // 1차 포인트 합계
        
        console.log('1차 회원 수:', totalMembers, '1차 포인트 합계:', totalPoints);
        
        // 2차 이상의 모든 레벨 회원 수 계산
        const allLevelMembers = await calculateAllLevelMembers(result.data);
        totalMembers += allLevelMembers.count;
        totalPoints += allLevelMembers.points;
        
        console.log('전체 회원 수:', totalMembers, '전체 포인트 합계:', totalPoints);
        
        setMyInfo({
          customerName: userInfo.customerName,
          myCode: userInfo.customerPhone?.slice(-8) || '',
          totalMembers: totalMembers,
          totalPoints: totalPoints
        });
      } else {
        console.error('내 정보 로드 실패:', result.error);
        setMyInfo({
          customerName: userInfo.customerName,
          myCode: userInfo.customerPhone?.slice(-8) || '',
          totalMembers: 0,
          totalPoints: 0
        });
      }
    } catch (error) {
      console.error('내 정보 로드 오류:', error);
      setMyInfo({
        customerName: userInfo.customerName,
        myCode: userInfo.customerPhone?.slice(-8) || '',
        totalMembers: 0,
        totalPoints: 0
      });
    } finally {
      setMyInfoLoading(false);
      console.log('내 정보 로딩 완료');
    }
  };

  // 모든 레벨의 회원 수를 재귀적으로 계산하는 함수
  const calculateAllLevelMembers = async (currentLevelMembers: any[]): Promise<{count: number, points: number}> => {
    if (currentLevelMembers.length === 0) {
      return { count: 0, points: 0 };
    }

    let totalCount = 0;
    let totalPoints = 0;

    // 현재 레벨의 각 회원에 대해 다음 레벨 조회
    for (const member of currentLevelMembers) {
      try {
        const memberCode = member.phone.slice(-8);
        const response = await fetch(`/api/mypage/first-level-referrals?userPhone=${memberCode.padStart(11, '010')}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          totalCount += result.data.length;
          totalPoints += result.data.reduce((sum: number, item: any) => sum + (item.points || 0), 0);
          
          // 재귀적으로 다음 레벨도 계산
          const nextLevelResult = await calculateAllLevelMembers(result.data);
          totalCount += nextLevelResult.count;
          totalPoints += nextLevelResult.points;
        }
      } catch (error) {
        console.error('레벨 계산 오류:', error);
      }
    }

    return { count: totalCount, points: totalPoints };
  };

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // 실제 로그인한 사용자 정보 가져오기 (다른 페이지와 동일한 방식)
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          // userData.user에서 사용자 정보 추출
          const user = userData.user;
          if (user) {
            setUserInfo({
              customerName: user.name,
              customerPhone: user.phone,
              referralCode: user.phone?.slice(-8) || '',
              finalPoints: user.finalPoints || 0,
              status: user.status
            });
            // 레벨 상태 초기화
            initializeLevelStates();
          } else {
            setUserInfo(null);
          }
        } else {
          console.error('사용자 정보 로드 실패: 로그인이 필요합니다');
          setUserInfo(null);
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  // userInfo가 로드되면 내 정보도 로드
  useEffect(() => {
    if (userInfo) {
      loadMyInfo();
    }
  }, [userInfo]);

  // 하단 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    console.log('📱 PWA 하단 탭 변경:', tabId);
    setActiveTab(tabId);
    
    // PWA 환경에서 부모 창에 탭 변경 알림
    if (window.parent !== window) {
      window.parent.postMessage({ 
        type: 'PWA_TAB_CHANGE', 
        tabId: tabId 
      }, '*');
    }

    // 실제 페이지 이동 로직
    switch (tabId) {
      case 'home':
        router.push('/member');
        break;
      case 'benefits':
        router.push('/benefits');
        break;
      case 'settlement':
        router.push('/settlement');
        break;
      case 'partner':
        router.push('/partner');
        break;
      case 'more':
        router.push('/profile');
        break;
      default:
        console.log('알 수 없는 탭:', tabId);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: bounceInStyle }} />
      <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-20 pt-4">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-slate-200/40">
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-black tracking-wide">
              내정보
            </h1>
            <button 
              onClick={handleInviteLink}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              초대링크보내기
            </button>
          </div>
          
          {/* 회원 정보 박스 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">사용자 정보 로딩 중...</span>
              </div>
            ) : !userInfo ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-lg font-medium">로그인이 필요합니다</p>
                  <p className="text-sm">파트너 정보를 보려면 로그인해주세요.</p>
                </div>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  로그인하기
                </button>
              </div>
            ) : myInfoLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">내 정보 로딩 중...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 첫 번째 줄: 이름 + 내코드 */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-500">회원이름:</span>
                    <span className="ml-2 font-medium">{myInfo?.customerName || userInfo?.customerName || '정보 없음'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">내코드:</span>
                    <span className="ml-2 font-medium">{myInfo?.myCode || userInfo?.customerPhone?.slice(-8) || '정보 없음'}</span>
                  </div>
                </div>
                
                {/* 두 번째 줄: 총인원 + 합산포인트 */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-500">총인원:</span>
                    <span className="ml-2 font-medium text-orange-600">{myInfo?.totalMembers || 0}명</span>
                  </div>
                  <div>
                    <span className="text-gray-500">합산포인트:</span>
                    <span className="ml-2 font-medium text-orange-600">{myInfo?.totalPoints?.toLocaleString() || 0}P</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* N차 회원 리스트 - 동적 렌더링 */}
        {userInfo && levelStates.map((levelState, index) => {
          const level = index + 1;
          const shouldShow = level === 1 || (level > 1 && levelStates[level - 2]?.data.length > 0);
          
          if (!shouldShow) return null;
          
          // 색상 매핑
          const colors = [
            { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'focus:ring-blue-500', badge: 'bg-blue-500' }, // 1차
            { bg: 'bg-green-600', hover: 'hover:bg-green-700', ring: 'focus:ring-green-500', badge: 'bg-green-500' }, // 2차
            { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', ring: 'focus:ring-purple-500', badge: 'bg-purple-500' }, // 3차
            { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', ring: 'focus:ring-orange-500', badge: 'bg-orange-500' }, // 4차
            { bg: 'bg-red-600', hover: 'hover:bg-red-700', ring: 'focus:ring-red-500', badge: 'bg-red-500' }, // 5차
            { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', ring: 'focus:ring-indigo-500', badge: 'bg-indigo-500' }, // 6차
            { bg: 'bg-pink-600', hover: 'hover:bg-pink-700', ring: 'focus:ring-pink-500', badge: 'bg-pink-500' }, // 7차
            { bg: 'bg-teal-600', hover: 'hover:bg-teal-700', ring: 'focus:ring-teal-500', badge: 'bg-teal-500' }, // 8차
          ];
          
          const colorSet = colors[index] || colors[0]; // 기본값은 1차 색상
          
          return (
            <div key={level} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-3 border-b border-gray-200">
                <button 
                  onClick={() => handleLevelToggle(level)}
                  disabled={levelState.loading}
                  className={`w-full flex items-center justify-between p-3 border ${colorSet.bg} rounded-lg text-base font-medium text-white ${colorSet.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorSet.ring} transition-colors disabled:opacity-50`}
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {level}차 회원 리스트
                    {levelState.data.length > 0 && (
                      <span className={`ml-2 px-2 py-1 ${colorSet.badge} text-white text-xs rounded-full`}>
                        {levelState.data.length}명
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {levelState.loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <ChevronRight className={`h-4 w-4 transition-transform ${levelState.show ? 'rotate-90' : ''}`} />
                  </div>
                </button>
              </div>
              
              {levelState.show && (
                <div className="p-3">
                  {levelState.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                              연락처
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                              결정포인트
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {levelState.data.map((member, memberIndex) => (
                            <tr key={memberIndex} className="hover:bg-gray-50 transition-colors">
                              <td className="px-2 py-2 text-xs text-gray-900 border-b border-gray-100">
                                {member.customerPhone}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-900 border-b border-gray-100">
                                {member.finalPoints?.toLocaleString() || 0}P
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{level}차 추천인이 없습니다</h3>
                      <p className="text-xs text-gray-500">
                        {level === 1 
                          ? '이 회원의 1차 추천인 정보가 없습니다.'
                          : `${level - 1}차 추천인들의 추천인 정보가 없습니다.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* 하단 탭 - 웹 전용 기능 유지 */}
      <BottomTab
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 초대링크 모달 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-bounce-in">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 p-6 text-center relative">
              <div className="absolute top-2 right-2">
                <button
                  onClick={closeInviteModal}
                  className="text-white hover:text-gray-200 transition-colors"
                  title="모달 닫기"
                  aria-label="모달 닫기"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-6xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">초대링크 생성 완료!</h2>
              <p className="text-pink-100 text-sm">친구들을 초대해보세요!</p>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🔗</span>
                  <span className="text-sm font-medium text-gray-600">초대링크</span>
                </div>
                <div className="bg-white rounded-xl p-3 border-2 border-dashed border-purple-200">
                  <p className="text-sm text-gray-700 break-all font-mono">
                    {inviteUrl}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">✅</span>
                  <span className="text-green-700 font-medium">클립보드에 복사 완료!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  지인들에게 링크를 공유할 수 있어요.
                </p>
              </div>

              {/* 버튼들 */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigator.share && navigator.share({
                      title: '세일즈 파트너 초대',
                      text: '세일즈 파트너에 가입하고 평생연금을 만들어보세요!',
                      url: inviteUrl
                    }).catch(() => {
                      // 공유 실패 시 클립보드 복사
                      navigator.clipboard.writeText(inviteUrl);
                    });
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  📱 친구들에게 공유하기
                </button>
                
                <button
                  onClick={closeInviteModal}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default PartnerPage;
