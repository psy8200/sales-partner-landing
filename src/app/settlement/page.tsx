'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomTab } from '../(member)/member/_components/BottomTab';

const SettlementPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settlement');

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
        router.push('/more');
        break;
      default:
        console.log('알 수 없는 탭:', tabId);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] pb-20 pt-4">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200/40">
        <div className="h-20 px-4 flex items-center justify-center pt-2">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-1 tracking-wide">
              정산 관리
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">💰</span>
              <h2 className="text-lg font-bold text-blue-700 tracking-wider">
                수익 정산
              </h2>
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* 준비 중 메시지 */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-6">🚧</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              정산 기능 준비 중
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              더 나은 서비스를 위해 정산 기능을 준비하고 있습니다.<br />
              곧 만나보실 수 있습니다!
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <span className="text-lg">⏰</span>
                <span className="text-sm font-medium">
                  개발 예정 기능
                </span>
              </div>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• 수익 정산 내역 조회</li>
                <li>• 정산 신청 및 관리</li>
                <li>• 정산 내역 다운로드</li>
                <li>• 정산 일정 안내</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 탭 - 웹 전용 기능 유지 */}
      <BottomTab
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default SettlementPage;
