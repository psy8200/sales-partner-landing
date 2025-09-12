'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getLevelIcon } from '@/lib/levelIcons';
import { BottomTab } from '../(member)/member/_components/BottomTab';

const BenefitsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('benefits');

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
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    partnerStatus: string;
    points: number;
    level: number;
    currentLevel: number;
    bankName: string;
    bankAccount: string;
    accountHolder: string;
    settlementCycle: string;
    createdAt: string;
    status: string;
    isActive: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const stageRewards = [
    {
      stage: 4,
      people: "4(27명)",
      icon: "🎫",
             title: "상품권 50만원 지급",
      description: "10만원 상품권 5장 지급함",
      image: "롯데/신세계/현대 상품권 10만원권 5장",
      color: "from-teal-400 to-cyan-500"
    },
    {
      stage: 5,
      people: "5(81명)",
      icon: "🎫",
      title: "상품권 200만원 지급",
      description: "10만원 상품권 20장 지급함",
      image: "롯데/신세계/현대 상품권 10만원권 20장",
      color: "from-green-400 to-emerald-500"
    },
    {
      stage: 6,
      people: "6(243명)",
      icon: "💰",
      title: "상품권 500만원 지급",
      description: "50만원 상품권 10장 지급함",
      image: "롯데/신세계/현대 상품권 50만원권 10장",
      color: "from-yellow-400 to-orange-500"
    },
    {
      stage: 7,
      people: "7(729명)",
      icon: "✈️",
      title: "최고급동남아 3박4일 여행권 2인권 + 여행경비 500만원",
      description: "발리/몰디브/태국/등 원하는 여행지로 선택가능함",
      image: "왕복 비즈니스석으로 편한여행",
      color: "from-blue-400 to-cyan-500"
    },
    {
      stage: 8,
      people: "8(2,187명)",
      icon: "🛳️",
      title: "비즈니스석 + 유럽크루즈 2인 + 여행경비 1,000만원",
      description: "지중해 / 북유렵 / 카리브해 / 동남아4인 선택가능함",
      image: "리무진 공항 픽업서비스제공",
      color: "from-purple-400 to-pink-500"
    },
    {
      stage: 9,
      people: "9(6,561명)",
      icon: "🚗",
      title: "고급세단 벤츠 또는 동급 + 주유상품권 500만원추가지급",
      description: "(BMW5시리즈,제네시스G80, 아우디A6등 선택가능)",
      image: "주유상품권 5만원권 100장추가지급",
      color: "from-gray-400 to-gray-600"
    },
    {
      stage: 10,
      people: "10(19,683명)",
      icon: "🏎️",
      title: "최고급세단 벤츠 S-Class 또는 동급 + 전용기사제공",
      description: "S-클래스, BMW 7시리즈, 제네시스 G90 동급 선택",
      image: "회사에서 전용기사를 제공해드립니다.",
      color: "from-indigo-400 to-purple-500"
    },
    {
      stage: "LEGEND",
      people: "LEGEND(59,049명)",
      icon: "🏆",
      title: "드림카 + 전용기사 + 법인카드 + 부회장급 임원대우",
      description: "드림카 선택 벤틀리 / 마이바흐 / 마세라티 / 람보르기니 / 포르쉐 등 선택가능",
      image: "1년 2회 해외여행제공 및 경비지원",
      color: "from-red-400 to-pink-500"
    }
  ];

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 현재 사용자의 다음 단계 보너스 찾기
  const getCurrentUserBonus = () => {
    if (!user) return null;
    
    const currentLevel = user.currentLevel || 0;
    const nextLevel = Math.min(currentLevel + 1, 10);
    
    // 4단계 미만이면 4단계 보너스 표시
    if (currentLevel < 4) {
      return stageRewards.find(reward => reward.stage === 4);
    }
    
    // 현재 등급이 10단계 이상이면 LEGEND 보너스 표시
    if (currentLevel >= 10) {
      return stageRewards.find(reward => reward.stage === "LEGEND");
    }
    
    // 다음 단계 보너스 반환
    return stageRewards.find(reward => reward.stage === nextLevel);
  };

  // 나머지 보너스들 (현재 사용자 보너스 제외)
  const getOtherBonuses = () => {
    const currentBonus = getCurrentUserBonus();
    if (!currentBonus) return stageRewards;
    
    return stageRewards.filter(reward => reward.stage !== currentBonus.stage);
  };

  const currentUserBonus = getCurrentUserBonus();
  const otherBonuses = getOtherBonuses();

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-[color:var(--muted)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-20 pt-4">
             {/* 헤더 */}
       <header className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-slate-200/40">
                   <div className="h-20 px-4 flex items-center justify-center pt-2">
            <div className="text-center">
                           <h1 className="text-2xl font-bold text-black mb-1 tracking-wide">
                {user?.name || '회원'}님의 성공을 축하하는
              </h1>
             <div className="flex items-center justify-center space-x-2">
               <span className="text-2xl">🎁</span>
               <h2 className="text-lg font-bold text-teal-700 tracking-wider">
                 특별 혜택 보너스
               </h2>
               <span className="text-2xl">🎁</span>
             </div>
           </div>
         </div>
                               </header>

                              <main className="px-4 py-6 space-y-6">
                   {/* 현재 사용자의 다음 단계 보너스 */}
          {currentUserBonus && (
            <section>
                                                           <div className="mb-3 text-center">
                                   <h3 className="text-lg font-bold text-[color:var(--text)] mb-2">
                     🎯 내가 이번에 받을 보너스
                   </h3>
                </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-[var(--radius-card)] p-4 shadow-lg"
              >
                <div className="flex items-start space-x-3">
                                     <div className="flex-shrink-0 text-center">
                     <div className="text-3xl mb-2">{currentUserBonus.icon}</div>
                     <div className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full text-center">
                       {currentUserBonus.people.split('(')[1].replace(')', '')}명이상
                     </div>
                   </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                                             <h4 className="font-bold text-[color:var(--text)] text-base">
                         {currentUserBonus.stage === 'LEGEND' ? 'LEGEND' : `LV.${currentUserBonus.stage}`} {currentUserBonus.title}
                       </h4>
                    </div>
                    <p className="text-sm text-[color:var(--muted)] mb-2 leading-relaxed">
                      {currentUserBonus.description}
                    </p>
                    <div className="text-xs text-[color:var(--muted)] italic">
                      📸 {currentUserBonus.image}
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          )}

                            {/* 단계별 승급 조건 */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-[var(--radius-card)] p-4 text-white text-center">
                                    <h3 className="text-lg font-bold mb-2">🎯 승급 세부 요건</h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
             {stageRewards.map((reward, index) => (
                               <div key={`reward-info-${index}-${reward.stage}`} className="bg-white/20 rounded-lg p-2">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-lg">{getLevelIcon(reward.stage as number | 'LEGEND' | 'SP')}</span>
                    <span className="font-bold text-sm">{reward.stage === 'LEGEND' ? 'LEGEND' : `LV.${reward.stage}`}</span>
                  </div>
                                     <div className="text-xs opacity-90">총파트너수 ({reward.people.split('(')[1].replace(')', '')})</div>
                </div>
             ))}
           </div>
         </section>

                                   {/* 추가 혜택 안내 */}
          <section className="flex justify-center space-x-4">
            <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] p-3 text-center flex-1 max-w-[120px]">
              <div className="text-lg mb-1">⚡</div>
              <h4 className="font-semibold text-[color:var(--text)] text-xs">즉시 지급</h4>
            </div>
            
            <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] p-3 text-center flex-1 max-w-[120px]">
              <div className="text-lg mb-1">🎁</div>
              <h4 className="font-semibold text-[color:var(--text)] text-xs">실물 혜택</h4>
            </div>
            
            <div className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] p-3 text-center flex-1 max-w-[120px]">
              <div className="text-lg mb-1">🏆</div>
              <h4 className="font-semibold text-[color:var(--text)] text-xs">단계별 증가</h4>
            </div>
          </section>

                     {/* 나머지 보너스들 */}
           <section>
                          <div className="mb-3">
                <h3 className="text-lg font-bold text-[color:var(--text)] mb-2">
                  📋 전체 단계별 보너스 목록
                </h3>
              </div>
                         <div className="grid grid-cols-1 gap-3">
              {otherBonuses.map((reward, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[color:var(--card)] border border-slate-200/40 rounded-[var(--radius-card)] p-4 shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                                         <div className="flex-shrink-0 text-center">
                       <div className="text-2xl mb-1">{reward.icon}</div>
                       <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-center">
                         {reward.people.split('(')[1].replace(')', '')}명이상
                       </div>
                     </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                                                 <h4 className="font-semibold text-[color:var(--text)] text-sm">
                           {reward.stage === 'LEGEND' ? 'LEGEND' : `LV.${reward.stage}`} {reward.title}
                         </h4>
                      </div>
                      <p className="text-sm text-[color:var(--muted)] mb-2 leading-relaxed">
                        {reward.description}
                      </p>
                      <div className="text-xs text-[color:var(--muted)] italic">
                        📸 {reward.image}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
                                           </section>

                                                 

                                </main>

        {/* 하단 탭 - PWA 전용 기능 유지 */}
      <BottomTab
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default BenefitsPage; 