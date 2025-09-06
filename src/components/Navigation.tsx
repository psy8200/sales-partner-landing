'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CompanyInfo {
  id: string;
  companyName: string;
  companyLogo: string;
  bottomLogo?: string;
}

const Navigation = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const response = await fetch('/api/admin/company-info');
        const data = await response.json();
        
        if (data.success && data.companyInfo) {
          setCompanyInfo(data.companyInfo);
        }
      } catch (error) {
        console.error('회사정보 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyInfo();
  }, []);

  const handleLogin = () => {
    window.open('/login', '_blank', 'width=480,height=720,scrollbars=yes,resizable=yes');
  };

  // 로고 렌더링 함수
  const renderLogo = () => {
    // 사용자가 업로드한 logo.png 파일을 직접 사용
    return (
      <Image 
        src="/logo.png" 
        alt={`${companyInfo?.companyName || '세일즈 파트너'} Logo`} 
        width={200} 
        height={50} 
        priority
        className="h-10 w-auto sm:h-12 md:h-14 lg:h-16 xl:h-18 object-contain"
      />
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 회사 로고 */}
          <Link href="/" className="flex items-center">
            {renderLogo()}
          </Link>
          
          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-300 shadow-sm"
          >
            로그인
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 