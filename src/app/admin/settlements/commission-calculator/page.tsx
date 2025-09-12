'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  DollarSign,
  User,
  Phone,
  Package,
  Calendar,
  CheckSquare,
  Square,
  Info,
  Users,
  UserPlus,
  TreePine,
  Target
} from 'lucide-react';

// 수당 데이터 타입 정의
interface CommissionData {
  id: string;
  customerName: string;
  customerPhone: string;
  referralCode: string;
  finalPoints: number;
  commissionAmount: number;
  contractDate: string;
  status: string;
}

// 목업 데이터 (추후 API로 대체)
const mockData: Record<string, CommissionData[]> = {
  basic: [
    {
      id: '1',
      customerName: '김철수',
      customerPhone: '010-1234-5678',
      referralCode: 'REF001',
      finalPoints: 50050,
      commissionAmount: 50050,
      contractDate: '2025-01-10',
      status: 'COMPLETED'
    },
    {
      id: '2',
      customerName: '이영희',
      customerPhone: '010-2345-6789',
      referralCode: 'REF002',
      finalPoints: 75000,
      commissionAmount: 75000,
      contractDate: '2025-01-09',
      status: 'COMPLETED'
    }
  ],
  referral: [
    {
      id: '3',
      customerName: '박민수',
      customerPhone: '010-3456-7890',
      referralCode: 'REF003',
      finalPoints: 90000,
      commissionAmount: 45000,
      contractDate: '2025-01-08',
      status: 'COMPLETED'
    }
  ],
  tree: [
    {
      id: '4',
      customerName: '최지영',
      customerPhone: '010-4567-8901',
      referralCode: 'REF004',
      finalPoints: 120000,
      commissionAmount: 24000,
      contractDate: '2025-01-07',
      status: 'COMPLETED'
    }
  ],
  matching: [
    {
      id: '5',
      customerName: '정수현',
      customerPhone: '010-5678-9012',
      referralCode: 'REF005',
      finalPoints: 80000,
      commissionAmount: 16000,
      contractDate: '2025-01-06',
      status: 'COMPLETED'
    }
  ]
};

export default function CommissionCalculatorPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // 탭 메뉴 정의
  const tabs = [
    { id: 'basic', name: '기본수당', icon: DollarSign, description: '계약 완료 시 지급되는 기본 수당' },
    { id: 'referral', name: '추천수당', icon: UserPlus, description: '직접 추천한 고객의 계약으로 발생하는 수당' },
    { id: 'tree', name: '트리수당', icon: TreePine, description: '하위 조직의 계약으로 발생하는 수당' },
    { id: 'matching', name: '추천매칭수당', icon: Target, description: '추천인 매칭으로 발생하는 수당' }
  ];

  // 현재 탭의 데이터 가져오기
  const getCurrentTabData = () => {
    return mockData[activeTab as keyof typeof mockData] || [];
  };

  // 검색 필터링
  const filteredData = getCurrentTabData().filter(item =>
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerPhone.includes(searchTerm) ||
    item.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 선택 관련 함수들
  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredData.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const isAllSelected = filteredData.length > 0 && filteredData.every(item => selectedItems.has(item.id));
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredData.length;

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">완료</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">대기</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">수당수수료계산</h1>
              <p className="text-gray-600 mt-2">4가지 수당 유형별로 수수료를 계산하고 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="h-4 w-4 mr-2" />
                Excel 다운로드
              </button>
            </div>
          </div>
        </motion.div>

        {/* 검색 및 필터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="고객명, 연락처, 추천인코드로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                필터
              </button>
            </div>
          </div>
        </motion.div>

        {/* 수수료지급기준 설명박스 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">수수료지급기준</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                각 수당 유형별로 다른 지급 기준이 적용됩니다. 기본수당은 계약 완료 시 100% 지급되며, 
                추천수당은 50%, 트리수당은 20%, 추천매칭수당은 20%의 비율로 지급됩니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 탭 메뉴 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* 현재 탭 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            {(() => {
              const currentTab = tabs.find(tab => tab.id === activeTab);
              const Icon = currentTab?.icon || DollarSign;
              return <Icon className="h-5 w-5 text-blue-600" />;
            })()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="모든 항목 선택"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      이름
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      연락처
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      추천인코드
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      최종결정포인트
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      수당금액
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      계약일시
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      상태
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-gray-400" />
                        <span>해당 수당 유형의 데이터가 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          aria-label={`항목 ${item.id} 선택`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{item.referralCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{formatAmount(item.finalPoints)}P</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">₩{formatAmount(item.commissionAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(item.contractDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 선택된 항목 정보 */}
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.size}개 항목이 선택되었습니다.
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  선택 항목 수당 지급
                </button>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50">
                  선택 해제
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
