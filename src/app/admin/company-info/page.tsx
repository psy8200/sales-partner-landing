'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

export default function CompanyInfoPage() {
  const [, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalInfo, setOriginalInfo] = useState({
    companyName: '',
    businessNumber: '',
    representative: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    referralCodeDefault: ''
  });

  const [formData, setFormData] = useState({
    companyName: '',
    businessNumber: '',
    representative: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    referralCodeDefault: ''
  });

  // 페이지 로드 시 현재 회사정보 가져오기 (백그라운드에서)
  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const response = await fetch('/api/admin/company-info');
        const data = await response.json();
        
        if (data.success && data.companyInfo) {
          setCompanyInfo(data.companyInfo);
          setFormData({
            companyName: data.companyInfo.companyName || '',
            businessNumber: data.companyInfo.businessNumber || '',
            representative: data.companyInfo.representative || '',
            address: data.companyInfo.address || '',
            phone: data.companyInfo.phone || '',
            email: data.companyInfo.email || '',
            website: data.companyInfo.website || '',
            description: data.companyInfo.description || '',
            referralCodeDefault: data.companyInfo.referralCodeDefault || ''
          });
        } else {
          // 데이터가 없을 때는 빈 폼으로 설정
          setFormData({
            companyName: '',
            businessNumber: '',
            representative: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            description: '',
            referralCodeDefault: ''
          });
        }
      } catch (error) {
        console.error('회사정보 로드 오류:', error);
        // 오류 시에도 빈 폼으로 설정
        setFormData({
          companyName: '',
          businessNumber: '',
          representative: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          description: '',
          referralCodeDefault: ''
        });
      }
    };

    // 백그라운드에서 회사정보 로드
    loadCompanyInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 수정 모드 시작
  const startEditing = () => {
    setIsEditing(true);
    setOriginalInfo({ ...formData });
  };

  // 수정 취소
  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({ ...originalInfo });
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || '회사정보가 성공적으로 저장되었습니다!');
        
        // 저장된 데이터를 즉시 반영 (새로고침 없이)
        const savedData = {
          id: data.companyInfo.id,
          companyName: data.companyInfo.companyName,
          businessNumber: data.companyInfo.businessNumber,
          representative: data.companyInfo.representative,
          address: data.companyInfo.address,
          phone: data.companyInfo.phone,
          email: data.companyInfo.email,
          website: data.companyInfo.website,
          description: data.companyInfo.description,
          referralCodeDefault: data.companyInfo.referralCodeDefault,
          isActive: data.companyInfo.isActive,
          createdAt: data.companyInfo.createdAt,
          updatedAt: data.companyInfo.updatedAt
        };
        
        setCompanyInfo(savedData);
        setOriginalInfo({ ...formData });
        
        // 편집 모드는 유지하여 사용자가 저장된 값을 확인하고 추가 수정할 수 있도록 함
        // setIsEditing(false); // 이 줄을 제거하여 편집 모드 유지
      } else {
        setMessage(data.message || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      setMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">회사정보 관리</h1>
            <p className="text-gray-600">
              랜딩페이지 Footer에 표시될 회사정보를 관리합니다. 로고는 고정 파일로 설정되어 있습니다.
            </p>
          </div>

          {/* 메시지 */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                message.includes('성공') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* 폼 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수정하기
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('companyForm')?.dispatchEvent(new Event('submit', { bubbles: true }))}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {saving ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              )}
            </div>

            <form id="companyForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명 *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  placeholder="회사명을 입력하세요"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  title="회사명 입력 필드"
                  aria-label="회사명"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최고관리자 *
                </label>
                <input
                  type="text"
                  name="representative"
                  value={formData.representative}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  placeholder="최고관리자명을 입력하세요"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록번호 *
                </label>
                <input
                  type="text"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  placeholder="000-00-00000"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  placeholder="02-0000-0000"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  placeholder="info@company.com"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://company.com"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기본 추천인코드
                </label>
                <input
                  type="text"
                  name="referralCodeDefault"
                  value={formData.referralCodeDefault || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="기본 추천인코드를 입력하세요"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  회원가입 시 추천인코드를 입력하지 않으면 이 값이 자동으로 사용됩니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사주소 *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  placeholder="서울특별시 강남구 테헤란로 123"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>


              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사설명
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={!isEditing}
                  placeholder="회사에 대한 간단한 설명을 입력하세요."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </form>

            {/* 저장 버튼 - 편집 모드에서만 표시 */}
            {isEditing && (
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-6 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  편집 종료
                </button>
                <button
                  type="submit"
                  form="companyForm"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '저장 중...' : '저장하기'}
                </button>
              </div>
            )}
          </div>

          {/* 정보 안내 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 정보 안내</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 회사정보는 랜딩페이지 Footer에 표시됩니다.</li>
              <li>• 로고는 고정 파일로 설정되어 있습니다.</li>
              <li>• 수정된 정보는 즉시 랜딩페이지에 반영됩니다.</li>
              <li>• 저장 후에도 편집 모드가 유지되어 저장된 값을 확인하고 추가 수정할 수 있습니다.</li>
              <li>• "편집 종료" 버튼을 클릭하면 읽기 전용 모드로 전환됩니다.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
