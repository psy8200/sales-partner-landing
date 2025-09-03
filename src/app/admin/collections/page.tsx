'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { 
  FileText, 
  CreditCard, 
  DollarSign, 
  Shield,
  ChevronRight
} from 'lucide-react';

const sidebarItems = [
  {
    id: 'all-contracts',
    label: '전체계약',
    icon: FileText,
    href: '/admin/collections/all-contracts',
    description: '모든 계약 현황 조회'
  },
  {
    id: 'collection-contracts',
    label: '수금관리계약',
    icon: CreditCard,
    href: '/admin/collections/collection-contracts',
    description: '확정된 계약 수금 관리'
  },
  {
    id: 'lump-sum-contracts',
    label: '일시납계약',
    icon: DollarSign,
    href: '/admin/collections/lump-sum-contracts',
    description: '일시납 계약 관리'
  },
  {
    id: 'verification',
    label: '수금검증하기',
    icon: Shield,
    href: '/admin/collections/verification',
    description: '수금 데이터 검증'
  }
];

export default function CollectionsPage() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* 사이드바 */}
        <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className={`font-bold text-gray-900 ${isSidebarOpen ? 'text-lg' : 'text-sm'}`}>
                💰 수금관리
              </h1>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isSidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
                title={isSidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
              >
                <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  {isSidebarOpen && (
                    <div className="ml-3 flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  수금관리 시스템
                </h2>
                <p className="text-gray-600 mb-6">
                  계약 확정부터 수금 완료까지 전체 프로세스를 관리합니다.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center mb-2">
                          <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 mr-2" />
                          <span className="font-medium text-gray-900 group-hover:text-blue-600">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

