'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import MemberSearchModal from '@/components/MemberSearchModal';
import { Contract, ItemSetting } from '@/types';

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

const itemCategories = [
  { value: 'INSURANCE', label: '보험' },
  { value: 'RENTAL', label: '렌탈' },
  { value: 'INTERNET_TV', label: '인터넷/방송' },
  { value: 'FUNERAL', label: '상조' },
  { value: 'RENTAL_MALL', label: '렌탈몰' },
];

export default function ContractEntriesPage() {
  // 기본 상태
  const [formData, setFormData] = useState<ContractFormData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    insuredName: '',
    insuredPhone: '',
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

  // UI 상태
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
  const [companies, setCompanies] = useState<Array<{id: string, provider: string}>>([]);
  const [products, setProducts] = useState<Array<{id: string, productName: string, expectedRate: string, pointRate: string}>>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);

  // 계약 목록 상태
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());

  // 필터 상태
  const [customerFilter, setCustomerFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirming, setConfirming] = useState(false);

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

  // 필터링된 계약 목록
  const filteredContracts = contracts.filter(contract => {
    const matchesCustomer = !customerFilter || contract.customerName.includes(customerFilter);
    const matchesCategory = !categoryFilter || contract.itemCategory === categoryFilter;
    return matchesCustomer && matchesCategory;
  });

  // 고유한 고객명 목록
  const uniqueCustomers = Array.from(new Set(contracts.map(contract => contract.customerName))).sort();

  // 선택박스 관련 함수들
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContracts(new Set(filteredContracts.map(contract => contract.id)));
    } else {
      setSelectedContracts(new Set());
    }
  };

  const handleSelectContract = (contractId: string, checked: boolean) => {
    const newSelected = new Set(selectedContracts);
    if (checked) {
      newSelected.add(contractId);
    } else {
      newSelected.delete(contractId);
    }
    setSelectedContracts(newSelected);
  };

  const isAllSelected = filteredContracts.length > 0 && selectedContracts.size === filteredContracts.length;
  const isIndeterminate = selectedContracts.size > 0 && selectedContracts.size < filteredContracts.length;

  // 계약확정 함수
  const handleConfirmContracts = async () => {
    if (selectedContracts.size === 0) {
      alert('확정할 계약을 선택해주세요.');
      return;
    }

    if (!confirm(`${selectedContracts.size}개의 계약을 확정하시겠습니까?`)) {
      return;
    }

    try {
      setConfirming(true);
      const response = await fetch('/api/admin/contracts/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractIds: Array.from(selectedContracts)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '계약 확정에 실패했습니다.');
      }

      const result = await response.json();
      alert(result.message);
      
      // 계약 목록 새로고침
      loadContracts(currentPage);
      setSelectedContracts(new Set());
    } catch (error) {
      console.error('계약 확정 오류:', error);
      alert(error instanceof Error ? error.message : '계약 확정 중 오류가 발생했습니다.');
    } finally {
      setConfirming(false);
    }
  };

  // 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      
      // 계약금액이 변경되면 결정포인트 자동 계산
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
  const handleMemberSelect = (member: { name: string; phone: string; address: string }) => {
    console.log('✅ 회원 선택됨:', member);
    setFormData(prev => ({
      ...prev,
      customerName: member.name,
      customerPhone: member.phone,
      customerAddress: member.address || '',
    }));
    console.log('📝 폼 데이터 업데이트 완료');
    setIsMemberSearchOpen(false);
  };

  // 카테고리 변경 시 회사명 로드
  const handleCategoryChange = async (category: string) => {
    setFormData(prev => ({ ...prev, itemCategory: category, companyName: '', itemName: '', expectedRate: '', pointRate: '' }));
    setProducts([]);
    
    if (category) {
      try {
        const response = await fetch(`/api/admin/items/settings?category=${category}`);
        if (response.ok) {
          const data = await response.json();
          const uniqueCompanies = data.items.reduce((acc: Array<{id: string, provider: string}>, item: ItemSetting) => {
            if (!acc.find(company => company.provider === item.provider)) {
              acc.push({ id: item.id, provider: item.provider });
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
  };

  // 회사명 변경 시 상품명 로드
  const handleCompanyChange = async (companyName: string) => {
    setFormData(prev => ({ ...prev, companyName, itemName: '', expectedRate: '', pointRate: '' }));
    
    if (companyName && formData.itemCategory) {
      try {
        const response = await fetch(`/api/admin/items/settings?category=${formData.itemCategory}`);
        if (response.ok) {
          const data = await response.json();
          const companyProducts = data.items
            .filter((item: ItemSetting) => item.provider === companyName)
            .map((item: ItemSetting) => ({
              id: item.id,
              productName: item.productName,
              expectedRate: item.expectedRate,
              pointRate: item.pointRate
            }));
          setProducts(companyProducts);
        }
      } catch (error) {
        console.error('상품명 로드 오류:', error);
      }
    } else {
      setProducts([]);
    }
  };

  // 계약 수정 모드 시작
  const handleEditContract = async (contract: Contract) => {
    try {
      await handleCategoryChange(contract.itemCategory);
      await handleCompanyChange(contract.companyName || '');
      
      const dynamicFields = (contract as any).dynamicFields ? JSON.parse((contract as any).dynamicFields) : {};
      
      setFormData({
        customerName: contract.customerName || '',
        customerPhone: contract.customerPhone || '',
        customerAddress: contract.customerAddress || '',
        insuredName: (contract as any).insuredName || '',
        insuredPhone: (contract as any).insuredPhone || '',
        itemCategory: contract.itemCategory || '',
        companyName: contract.companyName || '',
        itemName: contract.itemName || '',
        contractAmount: contract.contractAmount?.toString() || '',
        expectedRate: contract.expectedRate?.toString() || '',
        pointRate: contract.pointRate?.toString() || '',
        decisionPoints: (contract as any).decisionPoints?.toString() || '',
        contractDate: contract.contractDate ? new Date(contract.contractDate).toISOString().split('T')[0] : '',
        startDate: contract.startDate || '',
        endDate: contract.endDate || '',
        payoutRate: contract.payoutRate?.toString() || '',
        finalPoints: contract.finalPoints?.toString() || '',
        installationDate: contract.installationDate ? new Date(contract.installationDate).toISOString().split('T')[0] : '',
        dynamicFields: dynamicFields,
      });
      
      setIsEditMode(true);
      setEditingContractId(contract.id);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('계약 수정 모드 시작 오류:', error);
      alert('계약 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      insuredName: '',
      insuredPhone: '',
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
    setIsEditMode(false);
    setEditingContractId(null);
    setCompanies([]);
    setProducts([]);
  };

  // 계약 목록 로드
  const loadContracts = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/contracts/entries?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('계약 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 계약 목록 로드
  useEffect(() => {
    loadContracts();
  }, []);

  // 폼 제출 처리 (입력/수정 통합)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = isEditMode 
        ? `/api/admin/contracts/entries/${editingContractId}`
        : '/api/admin/contracts/entries';
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `계약 ${isEditMode ? '수정' : '입력'} 중 오류가 발생했습니다.`);
      }

              await response.json();

      setFormData({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        insuredName: '',
        insuredPhone: '',
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
      setIsEditMode(false);
      setEditingContractId(null);

      alert(`계약이 성공적으로 ${isEditMode ? '수정' : '입력'}되었습니다.`);
      
      loadContracts(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 계약 입력 폼 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditMode ? '계약 수정' : '계약 입력'}
            </h2>
            {isEditMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                수정 취소
              </button>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">계약 입력 오류</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                    title="오류 메시지 닫기"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
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
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🔍 회원 검색 버튼 클릭됨');
                      setIsMemberSearchOpen(true);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    title="회원 검색"
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
                    <option key={`category-${idx}-${category.value || 'default'}`} value={category.value}>
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
                    <option key={`company-${idx}-${company.provider || 'default'}`} value={company.provider}>
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
                    <option key={`product-${idx}-${product.productName || 'default'}`} value={product.productName}>
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

            {/* 2줄: 계약일 / 납입기간 / 종료일 / 결정지급율 / 최종결정포인트 / 설치완료일 */}
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
                  <option key="main-default-startDate" value="">납입기간을 선택하세요</option>
                  <option key="main-일시납" value="일시납">일시납</option>
                  <option key="main-1년납" value="1년납">1년납</option>
                  <option key="main-2년납" value="2년납">2년납</option>
                  <option key="main-3년납" value="3년납">3년납</option>
                  <option key="main-4년납" value="4년납">4년납</option>
                  <option key="main-5년납" value="5년납">5년납</option>
                  <option key="main-6년납" value="6년납">6년납</option>
                  <option key="main-7년납" value="7년납">7년납</option>
                  <option key="main-10년납" value="10년납">10년납</option>
                  <option key="main-15년납" value="15년납">15년납</option>
                  <option key="main-20년납" value="20년납">20년납</option>
                  <option key="main-30년납" value="30년납">30년납</option>
                  <option key="main-종신" value="종신">종신</option>
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
                  <option key="main-default-endDate" value="">종료일을 선택하세요</option>
                  <option key="main-납입기간과동일" value="납입기간과동일">납입기간과동일</option>
                  <option key="main-5년만기" value="5년만기">5년만기</option>
                  <option key="main-7년만기" value="7년만기">7년만기</option>
                  <option key="main-10년만기" value="10년만기">10년만기</option>
                  <option key="main-15년만기" value="15년만기">15년만기</option>
                  <option key="main-20년만기" value="20년만기">20년만기</option>
                  <option key="main-30년만기" value="30년만기">30년만기</option>
                  <option key="main-80세만기" value="80세만기">80세만기</option>
                  <option key="main-90세만기" value="90세만기">90세만기</option>
                  <option key="main-100세만기" value="100세만기">100세만기</option>
                  <option key="main-110세만기" value="110세만기">110세만기</option>
                  <option key="main-종신-endDate" value="종신">종신</option>
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
                  <option key="main-default-payoutRate" value="">지급율을 선택하세요</option>
                  <option key="main-payoutRate-100" value="100">100%</option>
                  <option key="main-payoutRate-90" value="90">90%</option>
                  <option key="main-payoutRate-80" value="80">80%</option>
                  <option key="main-payoutRate-70" value="70">70%</option>
                  <option key="main-payoutRate-60" value="60">60%</option>
                  <option key="main-payoutRate-50" value="50">50%</option>
                  <option key="main-payoutRate-40" value="40">40%</option>
                  <option key="main-payoutRate-30" value="30">30%</option>
                  <option key="main-payoutRate-20" value="20">20%</option>
                  <option key="main-payoutRate-10" value="10">10%</option>
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
            
            {/* 1줄: 증권번호(25%) / 상품의세부정보(25%) / 설치상세주소(35%) / 계약입력하기버튼(15%) */}
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
              
              {/* 계약입력하기 버튼 - 15% (2/12) */}
              <div className="col-span-12 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">버튼</label>
                <button
                  type="submit"
                  disabled={submitting || !isFormValid()}
                  className={`w-full px-6 py-2 rounded-lg font-medium transition-colors ${
                    submitting || !isFormValid() 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : isEditMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title={!isFormValid() ? '모든 필수 필드를 입력해주세요' : isEditMode ? '계약 수정하기' : '계약 입력하기'}
                >
                  {submitting ? (isEditMode ? '수정 중...' : '입력 중...') : (isEditMode ? '수정완료하기' : '계약입력하기')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>

      {/* 계약 목록 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">계약 목록</h2>
            <div className="flex items-center gap-3">
              {/* 고객명 필터 */}
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                aria-label="고객명 필터"
              >
                <option value="">전체 고객명</option>
                {uniqueCustomers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>

              {/* 카테고리 필터 */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                aria-label="카테고리 필터"
              >
                <option value="">전체 카테고리</option>
                <option value="INSURANCE">보험</option>
                <option value="RENTAL">렌탈</option>
                <option value="INTERNET_TV">인터넷/방송</option>
                <option value="FUNERAL">상조</option>
                <option value="RENTAL_MALL">렌탈몰</option>
              </select>

              {/* 계약확정 버튼 */}
              <button
                onClick={handleConfirmContracts}
                disabled={selectedContracts.size === 0 || confirming}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedContracts.size === 0 || confirming
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                }`}
              >
                {confirming ? '확정 중...' : '계약확정'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="모든 계약 선택"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">증권번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계약금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최종결정포인트</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계약일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설치완료일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태값</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                    등록된 계약이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract, idx) => {
                  const dynamicFields = (contract as any).dynamicFields ? JSON.parse((contract as any).dynamicFields) : {};
                  return (
                    <tr key={`contract-${contract.id || idx}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedContracts.has(contract.id)}
                          onChange={(e) => handleSelectContract(contract.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          aria-label={`${contract.customerName} 계약 선택`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contract.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.customerPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           contract.itemCategory === 'INSURANCE' ? 'bg-blue-100 text-blue-800' :
                           contract.itemCategory === 'RENTAL' ? 'bg-green-100 text-green-800' :
                           contract.itemCategory === 'INTERNET_TV' ? 'bg-purple-100 text-purple-800' :
                           contract.itemCategory === 'FUNERAL' ? 'bg-gray-100 text-gray-800' :
                           contract.itemCategory === 'RENTAL_MALL' ? 'bg-orange-100 text-orange-800' :
                           'bg-yellow-100 text-yellow-800'
                         }`}>
                           {contract.itemCategory === 'INSURANCE' ? '보험' :
                            contract.itemCategory === 'RENTAL' ? '렌탈' :
                            contract.itemCategory === 'INTERNET_TV' ? '인터넷/방송' :
                            contract.itemCategory === 'FUNERAL' ? '상조' :
                            contract.itemCategory === 'RENTAL_MALL' ? '렌탈몰' : contract.itemCategory}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dynamicFields.policyNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.contractAmount?.toLocaleString()}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.finalPoints?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(contract.contractDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.installationDate ? new Date(contract.installationDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contract.installationDate 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {contract.installationDate ? '계약체결완료' : '계약진행중'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          onClick={() => handleEditContract(contract)}
                        >
                          수정
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                페이지 {currentPage} / {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadContracts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  이전
                </button>
                <button
                  onClick={() => loadContracts(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* 회원 검색 모달 */}
      <MemberSearchModal
        isOpen={isMemberSearchOpen}
        onClose={() => setIsMemberSearchOpen(false)}
        onSelect={handleMemberSelect}
      />
    </div>
  );
}
