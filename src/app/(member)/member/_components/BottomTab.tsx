'use client';

import { Home, Gift, Calculator, Users, Menu } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface BottomTabProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const tabs: TabItem[] = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'benefits', label: '혜택', icon: Gift },
  { id: 'settlement', label: '정산', icon: Calculator },
  { id: 'partner', label: '파트너', icon: Users },
  { id: 'more', label: '프로필', icon: Menu },
];

export function BottomTab({ activeTab = 'home', onTabChange }: BottomTabProps) {
  const handleTabClick = (tabId: string) => {
    console.log('🔘 하단 탭 클릭:', tabId);
    
    // PWA 환경에서 부모 창에 탭 변경 알림
    if (window.parent !== window) {
      window.parent.postMessage({ 
        type: 'PWA_TAB_CHANGE', 
        tabId: tabId 
      }, '*');
    }
    
    // 로컬 탭 변경 (웹과 PWA 모두에서 사용)
    onTabChange?.(tabId);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/40 pb-safe shadow-lg"
      style={{ 
        zIndex: 99999,
        pointerEvents: 'auto',
        touchAction: 'manipulation'
      }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          
          return (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabClick(tab.id);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabClick(tab.id);
              }}
              className="flex flex-col items-center justify-center py-2 px-3 min-h-[44px] min-w-[44px] rounded-lg transition-all duration-200 hover:bg-gray-50 active:scale-95"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                zIndex: 100000
              }}
            >
              <Icon
                className={`w-5 h-5 mb-1 transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
