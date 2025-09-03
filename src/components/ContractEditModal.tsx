'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import MemberSearchModal from './MemberSearchModal';
// import { Contract, ItemSetting } from '@/types'; // 미사용 import 제거


interface ContractFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  insuredName: string;
  insuredPhone: string;
  itemCategory: string;
  companyName: string;
  itemName: string;
  contractAmount: string;
  expectedRate: string;
  pointRate: string;
  decisionPoints: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  payoutRate: string;
  finalPoints: string;
  installationDate: string;
  dynamicFields: Record<string, string>;
}

interface ContractEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Record<string, unknown>; // Contract 타입에 dynamicFields가 없어서 Record 사용
  onUpdate: () => void;
}

const itemCategories = [
  { value: 'INSURANCE', label: '보험상품신청' },
  { value: 'RENTAL', label: '렌탈상품신청' },
  { value: 'INTERNET_TV', label: '인터넷+TV 결합상품신청' },
  { value: 'FUNERAL', label: '상조결합상품신청' },
  { value: 'CUSTOM', label: '렌탈몰분양' },
];

export default function ContractEditModal({ isOpen, onClose, contract, onUpdate }: ContractEditModalProps) {
  const [formData, setFormData] = useState<ContractFormData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    insuredName: '', // 피보험자 정보는 별도 필드로 관리 필요
    insuredPhone: '', // 피보험자 정보는 별도 필드로 관리 필요
    itemCategory: '',
    companyName: '',
    itemName: '',
    contractAmount: '',
    expectedRate: '',
    pointRate: '',
    decisionPoints: '',
    contractDate: '',
    startDate: '',
    endDate: '',
    payoutRate: '',
    finalPoints: '',
    installationDate: '',
    dynamicFields: {},
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
  const [companies, setCompanies] = useState<Array<{id: string, provider: string}>>([]);
  const [products, setProducts] = useState<Array<{id: string, productName: string, expectedRate: string, pointRate: string}>>([]);

  // 카테고리 변경 시 회사명 로드
  const handleCategoryChange = useCallback(async (category: string) => {
    setFormData(prev => ({ ...prev, itemCategory: category, companyName: '', itemName: '', expectedRate: '', pointRate: '' }));
    setProducts([]);
    
    if (category) {
      try {
        const response = await fetch(`/api/admin/items/settings?category=${category}`);
        if (response.ok) {
          const data = await response.json();
          const uniqueCompanies = data.items.reduce((acc: Array<{id: string, provider: string}>, item: Record<string, unknown>) => {
            if (!acc.find(company => company.provider === (item.provider as string))) {
              acc.push({ id: item.id as string, provider: item.provider as string });
            }
            return acc;
          }, []);
          setCompanies(uniqueCompanies);
        }
      } catch (error) {
        console.error('회사명 로드 오류:', error);
      }
    } else {
      setCompanies([]);
    }
  }, []);

  // 회사명 변경 시 상품명 로드
  const handleCompanyChange = useCallback(async (companyName: string) => {
    setFormData(prev => ({ ...prev, companyName, itemName: '', expectedRate: '', pointRate: '' }));
    
    if (companyName && formData.itemCategory) {
      try {
        const response = await fetch(`/api/admin/items/settings?category=${formData.itemCategory}`);
        if (response.ok) {
          const data = await response.json();
          const companyProducts = data.items
            .filter((item: Record<string, unknown>) => (item.provider as string) === companyName)
            .map((item: Record<string, unknown>) => ({
              id: item.id as string,
              productName: item.productName as string,
              expectedRate: item.expectedRate as string,
              pointRate: item.pointRate as string
            }));
          setProducts(companyProducts);
        }
      } catch (error) {
        console.error('상품명 로드 오류:', error);
      }
    } else {
      setProducts([]);
    }
  }, [formData.itemCategory]);

  // 계약 데이터 로드
  useEffect(() => {
    if (contract && isOpen) {
      const dynamicFields = contract.dynamicFields ? JSON.parse(contract.dynamicFields as string) : {};
      
      setFormData({
        customerName: (contract.customerName as string) || '',
        customerPhone: (contract.customerPhone as string) || '',
        customerAddress: (contract.customerAddress as string) || '',
        insuredName: '', // 피보험자 정보는 별도 필드로 관리 필요
        insuredPhone: '', // 피보험자 정보는 별도 필드로 관리 필요
        itemCategory: (contract.itemCategory as string) || '',
        companyName: (contract.companyName as string) || '',
        itemName: (contract.itemName as string) || '',
        contractAmount: (contract.contractAmount as number)?.toString() || '',
        expectedRate: (contract.expectedRate as number)?.toString() || '',
        pointRate: (contract.pointRate as number)?.toString() || '',
        decisionPoints: (() => {
          const finalPoints = contract.finalPoints as number;
          const payoutRate = contract.payoutRate as number;
          if (!finalPoints || !payoutRate || payoutRate === 0) return '';
          try {
            return Math.round(finalPoints / (payoutRate / 100)).toString();
          } catch (error) {
            console.error('결정포인트 계산 오류:', error);
            return '';
          }
        })(),
        contractDate: (() => {
          if (!contract.contractDate) return '';
          try {
            const date = new Date(contract.contractDate as string);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
          } catch (error) {
            console.error('계약일 파싱 오류:', error);
            return '';
          }
        })(),
        startDate: (contract.startDate as string) || '',
        endDate: (contract.endDate as string) || '',
        payoutRate: (contract.payoutRate as number)?.toString() || '',
        finalPoints: (contract.finalPoints as number)?.toString() || '',
        installationDate: contract.installationDate ? new Date(contract.installationDate as string).toISOString().split('T')[0] : '',
        dynamicFields: {
          policyNumber: dynamicFields.policyNumber || '',
          productDetail: dynamicFields.productDetail || '',
          installationAddress: dynamicFields.installationAddress || '',
        },
      });

      // 회사명과 상품명 로드
      if (contract.itemCategory) {
        handleCategoryChange(contract.itemCategory as string);
      }
      if (contract.companyName && contract.itemCategory) {
        handleCompanyChange(contract.companyName as string);
      }
    }
  }, [contract, isOpen, handleCategoryChange, handleCompanyChange]);

  // 필수 필드 검증 함수
  const isFormValid = () => {
    const requiredFields = [
      formData.customerName,
      formData.customerPhone,
      formData.customerAddress,
      formData.itemCategory,
      formData.companyName,
      formData.itemName,
      formData.contractAmount,
      formData.contractDate,
      formData.startDate,
      formData.payoutRate,
      formData.finalPoints
    ];
    
    return requiredFields.every(field => field && field.trim() !== '');
  };

  // 숫자 포맷팅 함수 (3자리마다 쉼표)
  const formatNumber = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 숫자 포맷팅 해제 함수
  const unformatNumber = (value: string): string => {
    return value.replace(/,/g, '');
  };

  // 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      
      // 계약금액이 변경되면 결정포인트 자동 계산 (아이템관리와 동일한 수식)
      if (name === 'contractAmount') {
        const cleanValue = unformatNumber(value);
        const contractAmount = parseFloat(cleanValue) || 0;
        const expectedRate = parseFloat(prev.expectedRate) || 0;
        const pointRate = parseFloat(prev.pointRate) || 0;
        
        if (contractAmount > 0 && expectedRate > 0 && pointRate > 0) {
          const monthlyAmount = Math.round(contractAmount * (expectedRate / 24 / 100));
          const calculatedPoints = Math.round(monthlyAmount * (pointRate / 100));
          newFormData.decisionPoints = calculatedPoints.toString();
          
          const payoutRate = parseFloat(prev.payoutRate) || 100;
          const finalPoints = Math.round(calculatedPoints * (payoutRate / 100));
          newFormData.finalPoints = finalPoints.toString();
        } else {
          newFormData.decisionPoints = '';
          newFormData.finalPoints = '';
        }
      }
      
      // 결정지급율이 변경되면 최종결정포인트 재계산
      if (name === 'payoutRate') {
        const decisionPoints = parseFloat(prev.decisionPoints) || 0;
        const payoutRate = parseFloat(value) || 100;
        
        if (decisionPoints > 0) {
          const finalPoints = Math.round(decisionPoints * (payoutRate / 100));
          newFormData.finalPoints = finalPoints.toString();
        } else {
          newFormData.finalPoints = '';
        }
      }
      
      return newFormData;
    });
  };

  // 동적 필드 처리
  const handleDynamicFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: { ...prev.dynamicFields, [fieldName]: value }
    }));
  };

  // 회원 선택 처리
  const handleMemberSelect = (member: { name: string; phone: string; address?: string }) => {
    setFormData(prev => ({
      ...prev,
      customerName: member.name,
      customerPhone: member.phone,
      customerAddress: member.address || '',
    }));
    setIsMemberSearchOpen(false);
  };

  // 수정 완료 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/contracts/entries/${contract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '계약 수정 중 오류가 발생했습니다.');
      }

              // const result = await response.json(); // 미사용 변수 제거
      alert('계약이 성공적으로 수정되었습니다.');
      onUpdate(); // 부모 컴포넌트의 목록 새로고침
      onClose(); // 모달 닫기
    } catch (err) {
      console.error('수정 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          {/* 모달 컨테이너 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
          >
            {/* 헤더 */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">계약 수정</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="모달 닫기"
                  title="모달 닫기"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* 폼 내용 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">계약 수정 오류</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 고객 정보 */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  고객 정보
                </h3>
                
                <div className="grid grid-cols-12 gap-4">
                  {/* 고객명 */}
                  <div className="col-span-12 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      고객명 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="고객명"
                        required
                        readOnly
                        title="고객명 입력 필드"
                        aria-label="고객명"
                      />
                      <button
                        type="button"
                        onClick={() => setIsMemberSearchOpen(true)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        title="회원 검색"
                        aria-label="회원 검색 버튼"
                      >
                        <Search className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">🔍 회원 검색</p>
                  </div>

                  {/* 연락처 */}
                  <div className="col-span-12 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="연락처"
                      required
                      title="고객 연락처 입력 필드"
                      aria-label="고객 연락처"
                    />
                  </div>

                  {/* 주소 */}
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      주소 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="고객 주소를 입력하세요"
                      required
                      title="고객 주소 입력 필드"
                      aria-label="고객 주소"
                    />
                  </div>

                  {/* 피보험자명 */}
                  <div className="col-span-12 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      피보험자명
                    </label>
                    <input
                      type="text"
                      name="insuredName"
                      value={formData.insuredName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="피보험자명"
                      title="피보험자명 입력 필드"
                      aria-label="피보험자명"
                    />
                  </div>

                  {/* 피보험자연락처 */}
                  <div className="col-span-12 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      피보험자연락처
                    </label>
                    <input
                      type="tel"
                      name="insuredPhone"
                      value={formData.insuredPhone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="피보험자 연락처"
                      title="피보험자 연락처 입력 필드"
                      aria-label="피보험자 연락처"
                    />
                  </div>
                </div>
              </div>

              {/* 계약 기본 정보 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="text-md font-semibold text-gray-900">
                    계약 기본 정보
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">결정포인트</span>
                    <input
                      type="text"
                      name="decisionPoints"
                      value={formatNumber(formData.decisionPoints || '')}
                      onChange={handleInputChange}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      placeholder="자동계산"
                      readOnly
                    />
                  </div>
                </div>
                
                {/* 1줄: 상품 카테고리 / 회사명 / 상품명 / 계약금액 / 예상지급율 / 포인트전환율 */}
                <div className="grid grid-cols-12 gap-4">
                  {/* 상품 카테고리 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품 카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="itemCategory"
                      value={formData.itemCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-label="상품 카테고리 선택"
                      title="상품 카테고리를 선택하세요"
                    >
                      <option key="default-category" value="">카테고리를 선택하세요</option>
                                                             {itemCategories.map((category, idx) => (
                  <option key={`modal-category-${idx}-${category.value || 'default'}`} value={category.value}>
                    {category.label}
                  </option>
                ))}
                    </select>
                  </div>

                  {/* 회사명 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      회사명 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!formData.itemCategory}
                      aria-label="회사명 선택"
                      title="회사명을 선택하세요"
                    >
                      <option key="default-company" value="">{formData.itemCategory ? '회사명을 선택하세요' : '카테고리를 먼저 선택하세요'}</option>
                                                             {companies.map((company, idx) => (
                  <option key={`modal-company-${idx}-${company.provider || 'default'}`} value={company.provider}>
                    {company.provider}
                  </option>
                ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">아이템관리의 설정된 회사명이 동기화됩니다.</p>
                  </div>

                  {/* 상품명 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="itemName"
                      value={formData.itemName}
                      onChange={(e) => {
                        const selectedProduct = products.find(p => p.productName === e.target.value);
                        setFormData(prev => {
                          const newFormData = {
                            ...prev,
                            itemName: e.target.value,
                            expectedRate: selectedProduct?.expectedRate || '',
                            pointRate: selectedProduct?.pointRate || ''
                          };
                          
                          // 상품명 선택 시 결정포인트 재계산
                          const cleanContractAmount = unformatNumber(prev.contractAmount);
                          const contractAmount = parseFloat(cleanContractAmount) || 0;
                          const expectedRate = parseFloat(selectedProduct?.expectedRate || '0') || 0;
                          const pointRate = parseFloat(selectedProduct?.pointRate || '0') || 0;
                          
                          if (contractAmount > 0 && expectedRate > 0 && pointRate > 0) {
                            const monthlyAmount = Math.round(contractAmount * (expectedRate / 24 / 100));
                            const calculatedPoints = Math.round(monthlyAmount * (pointRate / 100));
                            newFormData.decisionPoints = calculatedPoints.toString();
                            
                            const payoutRate = parseFloat(prev.payoutRate) || 100;
                            const finalPoints = Math.round(calculatedPoints * (payoutRate / 100));
                            newFormData.finalPoints = finalPoints.toString();
                          } else {
                            newFormData.decisionPoints = '';
                            newFormData.finalPoints = '';
                          }
                         
                          return newFormData;
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!formData.companyName}
                      aria-label="상품명 선택"
                      title="상품명을 선택하세요"
                    >
                      <option key="default-product" value="">{formData.companyName ? '상품명을 선택하세요' : '회사명을 먼저 선택하세요'}</option>
                                                             {products.map((product, idx) => (
                  <option key={`modal-product-${idx}-${product.productName || 'default'}`} value={product.productName}>
                    {product.productName}
                  </option>
                ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">아이템관리의 설정된 상품명이 동기화됩니다.</p>
                  </div>

                  {/* 계약금액 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      계약금액 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="contractAmount"
                        value={formatNumber(formData.contractAmount)}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="계약금액을 입력하세요"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">원</span>
                    </div>
                  </div>

                  {/* 예상지급율 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      예상지급율 (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="expectedRate"
                      value={formData.expectedRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="자동 입력"
                      readOnly
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">아이템 선택 시 자동 입력</p>
                  </div>

                  {/* 포인트전환율 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      포인트전환율 (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pointRate"
                      value={formData.pointRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="자동 입력"
                      readOnly
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">아이템 선택 시 자동 입력</p>
                  </div>
                </div>

                {/* 2줄: 계약일 / 납입기간 / 종료일 / 결정지급율 / 결정포인트 / 설치완료일 */}
                <div className="grid grid-cols-12 gap-4">
                  {/* 계약일 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      계약일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="contractDate"
                      value={formData.contractDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-label="계약일 선택"
                      title="계약일을 선택하세요"
                    />
                  </div>

                  {/* 납입기간 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      납입기간 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-label="납입기간 선택"
                      title="납입기간을 선택하세요"
                    >
                                             <option key="modal-default-startDate" value="">납입기간을 선택하세요</option>
                                       <option key="modal-startDate-일시납" value="일시납">일시납</option>
                <option key="modal-startDate-1년납" value="1년납">1년납</option>
                <option key="modal-startDate-2년납" value="2년납">2년납</option>
                <option key="modal-startDate-3년납" value="3년납">3년납</option>
                <option key="modal-startDate-4년납" value="4년납">4년납</option>
                <option key="modal-startDate-5년납" value="5년납">5년납</option>
                <option key="modal-startDate-6년납" value="6년납">6년납</option>
                <option key="modal-startDate-7년납" value="7년납">7년납</option>
                <option key="modal-startDate-10년납" value="10년납">10년납</option>
                <option key="modal-startDate-15년납" value="15년납">15년납</option>
                <option key="modal-startDate-20년납" value="20년납">20년납</option>
                <option key="modal-startDate-30년납" value="30년납">30년납</option>
                <option key="modal-startDate-종신" value="종신">종신</option>
                    </select>
                  </div>

                  {/* 종료일 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      종료일
                    </label>
                    <select
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="종료일 선택"
                      title="종료일을 선택하세요"
                    >
                                             <option key="modal-default-endDate" value="">종료일을 선택하세요</option>
                       <option key="modal-납입기간과동일" value="납입기간과동일">납입기간과동일</option>
                       <option key="modal-5년만기" value="5년만기">5년만기</option>
                       <option key="modal-7년만기" value="7년만기">7년만기</option>
                       <option key="modal-10년만기" value="10년만기">10년만기</option>
                       <option key="modal-15년만기" value="15년만기">15년만기</option>
                       <option key="modal-20년만기" value="20년만기">20년만기</option>
                       <option key="modal-30년만기" value="30년만기">30년만기</option>
                       <option key="modal-80세만기" value="80세만기">80세만기</option>
                       <option key="modal-90세만기" value="90세만기">90세만기</option>
                       <option key="modal-100세만기" value="100세만기">100세만기</option>
                       <option key="modal-110세만기" value="110세만기">110세만기</option>
                       <option key="modal-종신-endDate" value="종신">종신</option>
                    </select>
                  </div>

                  {/* 결정지급율 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      결정지급율 (%) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="payoutRate"
                      value={formData.payoutRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-label="결정지급율 선택"
                      title="지급율을 선택하세요"
                    >
                                             <option key="modal-default-payoutRate" value="">지급율을 선택하세요</option>
                                       <option key="modal-payoutRate-100" value="100">100%</option>
                <option key="modal-payoutRate-90" value="90">90%</option>
                <option key="modal-payoutRate-80" value="80">80%</option>
                <option key="modal-payoutRate-70" value="70">70%</option>
                <option key="modal-payoutRate-60" value="60">60%</option>
                <option key="modal-payoutRate-50" value="50">50%</option>
                <option key="modal-payoutRate-40" value="40">40%</option>
                <option key="modal-payoutRate-30" value="30">30%</option>
                <option key="modal-payoutRate-20" value="20">20%</option>
                <option key="modal-payoutRate-10" value="10">10%</option>
                    </select>
                  </div>

                  {/* 최종결정포인트 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      최종결정포인트 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="finalPoints"
                      value={formatNumber(formData.finalPoints || '')}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      placeholder="자동계산"
                      readOnly
                      required
                    />
                  </div>

                  {/* 설치완료일 */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설치완료일
                    </label>
                    <input
                      type="date"
                      name="installationDate"
                      value={formData.installationDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="설치완료일 선택"
                      title="설치완료일을 선택하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 상세정보 입력하기 */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  상세정보 입력하기
                </h3>
                
                {/* 1줄: 증권번호(25%) / 상품의세부정보(25%) / 설치상세주소(35%) / 수정완료하기버튼(15%) */}
                <div className="grid grid-cols-12 gap-4">
                  {/* 증권번호 - 25% (3/12) */}
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">증권번호</label>
                    <input
                      type="text"
                      value={formData.dynamicFields['policyNumber'] || ''}
                      onChange={(e)=>handleDynamicFieldChange('policyNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="증권번호를 입력하세요"
                    />
                  </div>
                  
                  {/* 상품의세부정보 - 25% (3/12) */}
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">상품의세부정보</label>
                    <textarea
                      value={formData.dynamicFields['productDetail'] || ''}
                      onChange={(e)=>handleDynamicFieldChange('productDetail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={1}
                      placeholder="상품의 세부 정보를 입력하세요"
                    />
                  </div>
                 
                  {/* 설치상세주소 - 35% (4/12) */}
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">설치상세주소</label>
                    <input
                      type="text"
                      value={formData.dynamicFields['installationAddress'] || ''}
                      onChange={(e)=>handleDynamicFieldChange('installationAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="설치할 상세주소를 입력하세요"
                    />
                  </div>
                  
                  {/* 수정완료하기 버튼 - 15% (2/12) */}
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">버튼</label>
                    <button
                      type="submit"
                      disabled={submitting || !isFormValid()}
                      className={`w-full px-6 py-2 rounded-lg font-medium transition-colors ${
                        submitting || !isFormValid() 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      title={!isFormValid() ? '모든 필수 필드를 입력해주세요' : '수정 완료하기'}
                    >
                      {submitting ? '수정 중...' : '수정완료하기'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* 회원 검색 모달 */}
      <MemberSearchModal
        isOpen={isMemberSearchOpen}
        onClose={() => setIsMemberSearchOpen(false)}
        onSelect={handleMemberSelect}
      />
    </AnimatePresence>
  );
}
