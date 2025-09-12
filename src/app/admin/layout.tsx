'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import Link from 'next/link';
// import Image from 'next/image'; // 미사용 import 제거
import { usePathname } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import { useAdminAuth } from '@/hooks/useAdminAuth';
// import NotificationBell from '@/components/NotificationBell';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [allItemProducts, setAllItemProducts] = useState<{name: string, href: string, icon: string}[]>([]);
  const pathname = usePathname();
  const { user, loading } = useAdminAuth();

  // 상단 메뉴 항목들 (권한에 따라 필터링)
  const allMenuItems = [
    { name: '개발가이드', href: '/admin/dev-guide', icon: '📘', requiredRole: null },
    { name: '회원관리', href: '/admin/members', icon: '👥', requiredRole: null },
    { name: '관리자관리', href: '/admin/admins', icon: '🛡️', requiredRole: 'SUPER_ADMIN' },
    { name: '상담/계약관리', href: '/admin/contracts', icon: '📝', requiredRole: null },
    { name: '수금관리', href: '/admin/collections/all-contracts', icon: '💳', requiredRole: null },
    { name: '정산관리', href: '/admin/settlements', icon: '💼', requiredRole: null },
    { name: '아이템관리', href: '/admin/items', icon: '🧩', requiredRole: null },
    { name: '백업관리', href: '/admin/backup', icon: '💾', requiredRole: null },
  ];

  // 권한에 따라 메뉴 필터링
  const mainMenu = allMenuItems.filter(item => {
    if (!item.requiredRole) return true; // 권한 제한 없는 메뉴
    if (!user) return false; // 사용자 정보가 없으면 숨김
    return user.role === item.requiredRole; // 권한이 일치하는 경우만 표시
  });

  // 로그아웃 함수
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    // 랜딩페이지로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // 새 상품 추가 함수 (서버 기반)
  const handleAddNewItem = async () => {
    if (!newItemTitle.trim()) {
      alert('상품 제목을 입력해주세요.');
      return;
    }

    try {
      // 상품명을 URL 안전한 영어 형태로 변환
      const koreanToEnglish: { [key: string]: string } = {
        '보험': 'insurance', '상담': 'consultation', '신청': 'application',
        '렌탈': 'rental', '상품': 'product', '인터넷': 'internet',
        'TV': 'tv', '결합': 'combo', '상조': 'funeral',
        '몰': 'mall', '분양': 'sale', '즉시': 'instant',
        '파트너': 'partner', '가입': 'join', '쇼핑': 'shopping',
        '구매': 'purchase', '신청': 'apply'
      };
      
      let safeItemName = newItemTitle.trim();
      
      // 한글을 영어로 변환
      Object.keys(koreanToEnglish).forEach(korean => {
        safeItemName = safeItemName.replace(new RegExp(korean, 'g'), koreanToEnglish[korean]);
      });
      
      // 특수문자 제거하고 소문자로 변환
      safeItemName = safeItemName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      // 서버에 새 아이템 추가
      const response = await fetch('/api/admin/sidebar-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItemTitle.trim(),
          href: `/admin/items/${safeItemName}`,
          icon: '🆕',
          isCustom: true,
          order: allItemProducts.length + 1
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '서버 저장에 실패했습니다.');
      }

      // 서버에서 업데이트된 데이터 다시 로드
      await loadSidebarItems();
      
      setNewItemTitle('');
      setShowAddItemForm(false);
      
      alert('새 상품 페이지가 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('새 상품 추가 오류:', error);
      alert(error instanceof Error ? error.message : '새 상품 추가 중 오류가 발생했습니다.');
    }
  };


  // 서버에서 모든 상품 로드 함수
  const loadSidebarItems = async () => {
    try {
      const response = await fetch('/api/admin/sidebar-items');
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // 서버 데이터를 order 순으로 정렬
        const sortedItems = result.data
          .sort((a: any, b: any) => a.order - b.order)
          .map((item: any) => ({
            name: item.name,
            href: item.href,
            icon: item.icon,
            id: item.id,
            isCustom: item.isCustom
          }));
        setAllItemProducts(sortedItems);
      } else {
        // 서버에 데이터가 없으면 빈 배열
        setAllItemProducts([]);
      }
    } catch (error) {
      console.error('사이드바 아이템 로드 오류:', error);
      setAllItemProducts([]);
    }
  };

  // 컴포넌트 마운트 시 서버에서 모든 상품 로드
  useEffect(() => {
    loadSidebarItems();
  }, []);

  // 새 창으로부터 메시지 수신하여 사이드바 업데이트
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ALL_ITEMS_UPDATED') {
        // 제목 수정 페이지에서 전달받은 모든 상품들로 업데이트
        setAllItemProducts(event.data.items);
        
        // localStorage에 통합된 상품 목록 저장
        localStorage.setItem('allItemProducts', JSON.stringify(event.data.items));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 사이드바 메뉴 항목들 (개발가이드 예시)
  const sideMenus: Record<string, { name: string; href: string; icon?: string }[]> = {
    '개발가이드': [
      { name: '가이드 보기', href: '/admin/dev-guide' },
      { name: '개발세부내용', href: '/admin/dev-guide/details' },
      { name: '회사정보관리', href: '/admin/company-info', icon: '🏢' },
      { name: '승급아이콘설정', href: '/admin/dev-guide/level-icons', icon: '🏆' },
      { name: '회원페이지app설정', href: '/admin/dev-guide/member-app', icon: '📱' },
    ],
    '회원관리': [
      { name: '회원관리', href: '/admin/members', icon: '📊' },
      { name: '일반회원', href: '/admin/members/general', icon: '👤' },
      { name: '파트너회원', href: '/admin/members/partners', icon: '🤝' },
    ],
    '관리자관리': [
      { name: '관리자목록', href: '/admin/admins', icon: '👥' },
      { name: '접속로그', href: '/admin/admins/logs', icon: '📋' },
      { name: '담당자관리', href: '/admin/admins/managers', icon: '👨‍💼' },
    ],
    '상담/계약관리': [
      { name: '상담신청관리', href: '/admin/contracts/requests', icon: '📥' },
      { name: '계약입력관리', href: '/admin/contracts/entries', icon: '✍️' },
    ],
    '수금관리': [
      { name: '전체계약', href: '/admin/collections/all-contracts' },
      { name: '수금관리계약', href: '/admin/collections/collection-contracts' },
      { name: '수금완료된계약', href: '/admin/collections/completed-contracts' },
      { name: '일시납계약', href: '/admin/collections/lump-sum-contracts' },
      { name: '수금검증하기', href: '/admin/collections/verification' },
    ],
    '정산관리': [
      { name: '정산 내역', href: '/admin/settlements' },
      { name: '정산리스트', href: '/admin/settlements/list' },
      { name: '파트너추천리스트', href: '/admin/settlements/partner-referrals' },
      { name: '수당수수료계산', href: '/admin/settlements/commission-calculator' },
      { name: '승급회원관리', href: '/admin/settlements/promotion-management' },
      { name: '승급회원지급완료리스트', href: '/admin/settlements/payment-history' },
      { name: '출금요청리스트', href: '/admin/settlements/withdrawal-requests' },
      { name: '정산완료리스트', href: '/admin/settlements/completed' },
      { name: '파트너트리정보', href: '/admin/settlements/partner-tree' },
    ],
    '아이템관리': [
      { name: '아이템관리홈', href: '/admin/items', icon: '🧩' },
    ],
    '백업관리': [
      { name: '백업관리', href: '/admin/backup', icon: '💾' },
    ],
  };

  function getSidebarItems() {
    // 수금관리 관련 경로인지 확인
    if (pathname?.startsWith('/admin/collections')) {
      return sideMenus['수금관리'] || [];
    }
    
    // 정산관리 관련 경로인지 확인
    if (pathname?.startsWith('/admin/settlements')) {
      return sideMenus['정산관리'] || [];
    }
    
    // 백업관리 관련 경로인지 확인
    if (pathname?.startsWith('/admin/backup')) {
      return sideMenus['백업관리'] || [];
    }
    
    const activeMain = mainMenu.find(m => pathname?.startsWith(m.href));
    const key = activeMain ? activeMain.name : '개발가이드';
    const base = sideMenus[key] || [];
    
    // 아이템관리인 경우 서버에서 로드한 상품들 반환
    if (key === '아이템관리') {
      // allItemProducts에서 "아이템관리홈"을 제외하고 합치기 (중복 방지)
      const filteredProducts = allItemProducts.filter(item => item.name !== '아이템관리홈');
      return [...base, ...filteredProducts];
    }
    
    return base;
  }

  const sidebarItems = getSidebarItems();

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* 상단 메뉴바 */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 lg:h-18">
            <div className="flex items-center">
              {/* 회사 로고 - 클릭 시 어드민 홈으로 이동 */}
              <Link href="/admin" className="flex items-center" aria-label="어드민 홈으로 이동">
                <span className="text-xl font-bold text-blue-600">🏢 세일즈 파트너 어드민</span>
              </Link>
            </div>

            {/* 상단 메뉴 - 데스크톱 */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {mainMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 xl:px-3 py-1.5 xl:py-2 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1 xl:mr-2">{item.icon}</span>
                  <span className="hidden xl:inline">{item.name}</span>
                  <span className="xl:hidden">{item.name.slice(0, 2)}</span>
                </Link>
              ))}
              
              {/* 알림벨 제거 */}
              
              {/* 사용자 정보 */}
              {user && (
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-xs xl:text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="px-2 xl:px-3 py-1.5 xl:py-2 rounded-md text-xs xl:text-sm font-medium transition-colors text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 whitespace-nowrap"
                title="로그아웃"
              >
                <span className="mr-1 xl:mr-2">🚪</span>
                <span className="hidden xl:inline">로그아웃</span>
                <span className="xl:hidden">로그</span>
              </button>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-1"
                aria-label="메뉴 열기/닫기"
                title="메뉴 열기/닫기"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {sidebarOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {mainMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              {/* 모바일 로그아웃 버튼 */}
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
                title="로그아웃"
              >
                <span className="mr-2">🚪</span>
                로그아웃
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 메인 레이아웃 */}
      <div className="flex">
        {/* 좌측 사이드바 - 데스크톱 */}
        <div className="hidden lg:flex lg:w-56 xl:w-64 2xl:w-72 lg:flex-col lg:flex-shrink-0">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
              <nav className="mt-4 flex-1 px-2 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2 xl:mr-3">{item.icon}</span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                ))}
                
                {/* 새 상품 추가 폼 */}
                {pathname?.startsWith('/admin/items') && (
                  <div className="mt-4 p-2 border-t border-gray-200 space-y-2">
                    {!showAddItemForm ? (
                      <button
                        onClick={() => setShowAddItemForm(true)}
                        className="w-full flex items-center px-2 py-2 text-xs xl:text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <span className="mr-2 xl:mr-3">➕</span>
                        <span className="truncate">+상품추가하기</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          placeholder="상품 제목을 입력하세요"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={handleAddNewItem}
                            className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            추가하기
                          </button>
                          <button
                            onClick={() => {
                              setShowAddItemForm(false);
                              setNewItemTitle('');
                            }}
                            className="flex-1 px-2 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* 사이드바 제목 수정 버튼 */}
                    <button
                      onClick={() => {
                        const editUrl = `/admin/items/edit-titles?items=${encodeURIComponent(JSON.stringify(allItemProducts))}`;
                        window.open(editUrl, 'editTitles', 'width=600,height=500,scrollbars=yes,resizable=yes');
                      }}
                      className="w-full flex items-center px-2 py-2 text-xs xl:text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                    >
                      <span className="mr-2 xl:mr-3">✏️</span>
                      <span className="truncate">사이드바제목수정</span>
                    </button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* 모바일 사이드바 오버레이 */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1">
            <div className="py-2 sm:py-3 md:py-4 lg:py-6">
              <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;
