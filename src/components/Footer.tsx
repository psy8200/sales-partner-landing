'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLoginModal from './AdminLoginModal';

interface CompanyInfo {
  id: string;
  companyName: string;
  businessNumber: string;
  representative: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  referralCodeDefault?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Footer = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const response = await fetch('/api/admin/company-info');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.companyInfo) {
            setCompanyInfo(data.companyInfo);
          }
        } else {
          console.log('회사정보 API 응답 오류:', response.status);
          // 기본값 설정
          setCompanyInfo({
            companyName: '세일즈 파트너',
            businessNumber: '123-45-67890',
            representative: '대표이사',
            address: '서울특별시 강남구 테헤란로 123',
            phone: '02-1234-5678',
            email: 'info@salespartner.com',
            website: 'https://salespartner.com',
            description: '최고의 세일즈 파트너 서비스를 제공합니다.',
            referralCodeDefault: 'SP2024',
            isActive: true
          });
        }
      } catch (error) {
        console.error('회사정보 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyInfo();
  }, []);

  // 로고 렌더링 함수
  const renderLogo = (_logoUrl?: string) => {
    // 사용자가 업로드한 sp.png 파일을 직접 사용
    return (
      <div className="mr-4">
        <Image
          src="/sp.png"
          alt="회사로고"
          width={64}
          height={64}
          className="object-contain rounded-lg"
        />
      </div>
    );
  };

  // 로딩 중일 때 기본 정보 표시
  if (loading) {
    return (
      <>
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 회사 정보 */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                {renderLogo()}
                <div>
                  <h3 className="text-lg font-bold text-white">주식회사 세일즈파트너스</h3>
                  <p className="text-sm text-gray-400 mt-1">평생 연금을 만들어보세요. 행복한 노후보장 ~!!</p>
                </div>
              </div>
            </div>

            {/* 연락처 정보 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">연락처</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <span className="mr-2">📞</span>
                  <span>1600-5360</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✉️</span>
                  <span>psy777@naver.com</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🌐</span>
                  <span>https://salespartner.com</span>
                </div>
              </div>
            </div>

            {/* 회사 정보 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">회사 정보</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>
                  <span className="font-medium">최고관리자:</span> 박수용
                </div>
                <div>
                  <span className="font-medium">사업자등록번호:</span> 367-87-02260
                </div>
                <div className="text-xs">
                  <span className="font-medium">주소:</span> 서울특별시 금천구 디지털로9길 68 대륭포스트타워5차 232호
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 관리자 로그인 링크 */}
        <div className="border-t border-gray-800 pt-4 mt-6">
          <div className="text-center">
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors underline"
            >
              관리자로그인
            </button>
          </div>
        </div>
      </footer>
      
      {/* 관리자 로그인 모달 */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
    </>
  );
  }

  // 회사정보가 없을 때 기본 정보 표시
  if (!companyInfo) {
    return (
      <>
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 회사 정보 */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                {renderLogo()}
                <div>
                  <h3 className="text-lg font-bold text-white">주식회사 세일즈파트너스</h3>
                  <p className="text-sm text-gray-400 mt-1">평생 연금을 만들어보세요. 행복한 노후보장 ~!!</p>
                </div>
              </div>
            </div>

            {/* 연락처 정보 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">연락처</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <span className="mr-2">📞</span>
                  <span>1600-5360</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✉️</span>
                  <span>psy777@naver.com</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🌐</span>
                  <span>https://salespartner.com</span>
                </div>
              </div>
            </div>

            {/* 회사 정보 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">회사 정보</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>
                  <span className="font-medium">최고관리자:</span> 박수용
                </div>
                <div>
                  <span className="font-medium">사업자등록번호:</span> 367-87-02260
                </div>
                <div className="text-xs">
                  <span className="font-medium">주소:</span> 서울특별시 금천구 디지털로9길 68 대륭포스트타워5차 232호
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 관리자 로그인 링크 */}
        <div className="border-t border-gray-800 pt-4 mt-6">
          <div className="text-center">
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors underline"
            >
              관리자로그인
            </button>
          </div>
        </div>
      </footer>
      
      {/* 관리자 로그인 모달 */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
    </>
  );
  }

  return (
    <>
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              {renderLogo()}
              <div>
                <h3 className="text-lg font-bold text-white">{companyInfo.companyName}</h3>
                {companyInfo.description && (
                  <p className="text-sm text-gray-400 mt-1">{companyInfo.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">연락처</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                <a href={`tel:${companyInfo.phone}`} className="hover:text-white transition-colors">
                  {companyInfo.phone}
                </a>
              </div>
              <div className="flex items-center">
                <span className="mr-2">✉️</span>
                <a href={`mailto:${companyInfo.email}`} className="hover:text-white transition-colors">
                  {companyInfo.email}
                </a>
              </div>
              {companyInfo.website && (
                <div className="flex items-center">
                  <span className="mr-2">🌐</span>
                  <a 
                    href={companyInfo.website} 
                    className="hover:text-white transition-colors"
                  >
                    웹사이트
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 회사 정보 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">회사 정보</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div>
                <span className="font-medium">최고관리자:</span> {companyInfo.representative}
              </div>
              <div>
                <span className="font-medium">사업자등록번호:</span> {companyInfo.businessNumber}
              </div>
              <div className="text-xs">
                <span className="font-medium">주소:</span> {companyInfo.address}
              </div>
            </div>
          </div>
        </div>
        
        {/* 관리자 로그인 링크 */}
        <div className="border-t border-gray-800 pt-4 mt-6">
          <div className="text-center">
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors underline"
            >
              관리자로그인
            </button>
          </div>
        </div>
      </div>
      </footer>
      
      {/* 관리자 로그인 모달 */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
    </>
  );
};

export default Footer;
