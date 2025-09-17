'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter,
  User,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Calculator,
  TrendingUp
} from 'lucide-react';
import AccountInfoModal from '@/components/AccountInfoModal';

// 수당수수료계산 데이터 타입 정의
interface CommissionCalculation {
  id: string;
  userName: string;
  userPhone: string;
  finalPoints: number;
  sumPoints: number; // 합산포인트 추가
  currentLevel: number;
  basicCommission: number;
  recruitmentCommission: number;
  indirectCommission: number;
  dividendBasicCommission: number;
  dividendLevelCommission: number;
  totalCommission: number;
  settlementYearMonth: string;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  requestStatus: '정산대기' | '정산가능' | '출금요청' | '지급완료'; // 요청정보 상태 추가
  createdAt: string;
  updatedAt: string;
}

export default function CompletedSettlementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSearchTerm, setFilteredSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [commissionData, setCommissionData] = useState<CommissionCalculation[]>([]);
  
  // 정산월 필터링 상태
  const [selectedSettlementMonth, setSelectedSettlementMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  // 계좌정보 모달 관련 상태
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{name: string, phone: string} | null>(null);
  const [accountInfo, setAccountInfo] = useState<{bankName: string, accountNumber: string, accountHolder: string} | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  
  // 저장된 계좌정보 상태
  const [savedAccountInfo, setSavedAccountInfo] = useState<{[key: string]: {bankName: string, accountNumber: string, accountHolder: string}}>({});
  
  // 회원별 업로드된 파일 상태
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});

  // 목업 데이터
  // 더미 데이터 제거 - 실제 API 데이터만 사용

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 데이터베이스에서 정산완료 데이터 조회
        const response = await fetch('/api/admin/settlements/completed');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setCommissionData(result.data);
            
            // 정산월 목록 추출 및 정렬
            const months = [...new Set(result.data.map((item: CommissionCalculation) => item.settlementYearMonth))];
            months.sort((a, b) => (b as string).localeCompare(a as string)); // 최신순 정렬
            setAvailableMonths(months as string[]);
            
            console.log('✅ 정산완료 데이터 로드 완료:', result.data.length, '건');
            console.log('📅 사용 가능한 정산월:', months);
          } else {
            setCommissionData([]);
            setAvailableMonths([]);
            console.log('✅ 정산완료 데이터 없음 - 빈 상태로 초기화');
          }
        } else {
          console.error('API 호출 실패:', response.status);
          setCommissionData([]);
        }

        // 계좌정보는 별도 관리 (필요시 데이터베이스에서 조회)
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setCommissionData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 검색 및 필터링
  const filteredData = commissionData.filter(item => {
    const matchesSearch = !filteredSearchTerm || 
      item.userName.toLowerCase().includes(filteredSearchTerm.toLowerCase()) ||
      item.userPhone.includes(filteredSearchTerm);
    
    const matchesMonth = !selectedSettlementMonth || 
      item.settlementYearMonth === selectedSettlementMonth;
    
    return matchesSearch && matchesMonth;
  });

  // 선택 관련 함수들
  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected = filteredData.length > 0 && filteredData.every(item => selectedItems.includes(item.id));
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < filteredData.length;

  // 검색 핸들러
  const handleSearch = () => {
    setFilteredSearchTerm(searchTerm);
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = async () => {
    try {
      setLoading(true);
      
      // 엑셀 라이브러리 동적 import
      const ExcelJS = (await import('exceljs')).default;
      
      // 새 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('정산완료내역');
      
      // 헤더 스타일 정의
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: '366092' } },
        alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
        border: {
          top: { style: 'thin' as const },
          left: { style: 'thin' as const },
          bottom: { style: 'thin' as const },
          right: { style: 'thin' as const }
        }
      };
      
      // 컬럼 헤더 정의
      const headers = [
        '회원명', '연락처', '결정포인트', '합산포인트', '현재등급',
        '기본수당', '모집수당', '간접수당', '기본배당', '배당등급별',
        '총지급액', '정산년월', '지급상태', '요청정보', '생성일시'
      ];
      
      // 헤더 행 추가
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });
      
      // 데이터 행 추가
      filteredData.forEach((item) => {
        const row = worksheet.addRow([
          item.userName,
          item.userPhone,
          item.finalPoints,
          item.sumPoints,
          item.currentLevel,
          item.basicCommission,
          item.recruitmentCommission,
          item.indirectCommission,
          item.dividendBasicCommission,
          item.dividendLevelCommission,
          item.totalCommission,
          item.settlementYearMonth,
          item.paymentStatus,
          item.requestStatus,
          new Date(item.createdAt).toLocaleString('ko-KR')
        ]);
        
        // 데이터 행 스타일
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // 컬럼 너비 자동 조정
      worksheet.columns.forEach((column) => {
        column.width = 15;
      });
      
      // 파일명 생성 (현재 날짜 포함)
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const fileName = `정산완료내역_${dateStr}.xlsx`;
      
      // 엑셀 파일 생성 및 다운로드
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ 엑셀 다운로드 완료:', fileName);
      alert(`엑셀 파일이 다운로드되었습니다.\n파일명: ${fileName}\n데이터 건수: ${filteredData.length}건`);
      
    } catch (error) {
      console.error('❌ 엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 정산완료내역보내기 핸들러 (새로운 안전한 방식)
  const handleSendCompleted = async () => {
    if (selectedItems.length === 0) {
      alert('전송할 항목을 선택해주세요.');
      return;
    }

    const confirmSend = confirm(`선택된 ${selectedItems.length}명의 정산완료내역을 회원 페이지로 보내시겠습니까?\n\n이 작업은 안전하게 회원별 데이터 테이블에 복사됩니다.`);
    if (!confirmSend) {
      return;
    }

    try {
      setLoading(true);
      
      // 새로운 API 사용: SettlementRecord → UserSettlementRecord 복사
      const response = await fetch('/api/admin/settlements/send-to-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIds: selectedItems
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`정산완료내역 전송 완료!\n\n전송된 건수: ${result.data.sentCount}건\n중복으로 건너뛴 건수: ${result.data.skippedCount}건\n\n이제 회원들이 자신의 정산 데이터를 확인할 수 있습니다.`);
        
        // 선택 항목 초기화
        setSelectedItems([]);
        
        // 데이터 새로고침
        window.location.reload();
      } else {
        alert(`전송 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('정산완료내역 전송 오류:', error);
      alert('정산완료내역 전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 확인저장 핸들러 (선택된 항목들을 서버에 저장하고 정산가능으로 변경)
  const handleRefresh = async () => {
    if (selectedItems.length === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }

    const confirmUpdate = confirm(`선택된 ${selectedItems.length}개 항목을 정산가능으로 변경하고 서버에 저장하시겠습니까?`);
    if (!confirmUpdate) {
      return;
    }

    try {
      setLoading(true);
      
      // 선택된 항목들의 데이터 준비
      const selectedData = commissionData.filter(item => selectedItems.includes(item.id));
      
      console.log('📤 서버에 저장할 데이터:', selectedData);
      
      // 서버에 저장
      const response = await fetch('/api/admin/settlements/save-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedItems: selectedData,
          processedBy: 'admin' // 실제로는 현재 로그인한 관리자 정보
        })
      });

      const result = await response.json();
      console.log('🔍 API 응답 결과:', result);
      console.log('🔍 응답 상태:', response.status);
      console.log('🔍 응답 헤더:', response.headers);
      
      if (result.success && result.data.savedCount > 0) {
        // 서버 저장 성공시 로컬 데이터도 업데이트
        const updatedData = commissionData.map(item => {
          if (selectedItems.includes(item.id)) {
            return {
              ...item,
              requestStatus: '정산가능' as const,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        });

        setCommissionData(updatedData);
        
        // 데이터베이스에만 저장 (localStorage 제거)
        
        // 선택 항목 초기화
        setSelectedItems([]);
        
        alert(`✅ ${result.data.savedCount}개 항목이 서버에 저장되고 정산가능으로 변경되었습니다.`);
        console.log('✅ 서버 저장 완료:', result);
      } else {
        // 저장 실패 또는 0개 저장
        const errorMessage = result.message || result.error || '서버에 저장되지 않았습니다.';
        alert(`❌ 저장 실패: ${errorMessage}`);
        console.error('❌ 서버 저장 실패:', result);
      }
    } catch (error) {
      console.error('❌ 확인저장 오류:', error);
      alert('❌ 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 선택된 데이터 삭제 핸들러
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    const confirmDelete = confirm(`선택된 ${selectedItems.length}개 항목을 삭제하시겠습니까?`);
    if (!confirmDelete) {
      return;
    }

    try {
      console.log('🔄 선택된 항목 삭제 시작:', selectedItems);

      // 🔥 데이터베이스에서 실제로 삭제하는 API 호출
      const response = await fetch('/api/admin/settlements/completed', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idsToDelete: selectedItems
        })
      });

      const result = await response.json();
      console.log('🔍 삭제 API 응답:', result);

      if (result.success && result.data.deletedCount > 0) {
        // 서버 삭제 성공시 로컬 데이터도 업데이트
        const updatedData = commissionData.filter(item => !selectedItems.includes(item.id));
        setCommissionData(updatedData);
        
        // 선택 항목 초기화
        setSelectedItems([]);
        
        alert(`✅ ${result.data.deletedCount}개 항목이 성공적으로 삭제되었습니다.`);
        console.log('✅ 삭제 완료:', result.data.deletedCount, '건');
      } else {
        const errorMessage = result.message || result.error || '삭제에 실패했습니다.';
        alert(`❌ 삭제 실패: ${errorMessage}`);
        console.error('❌ 삭제 실패:', result);
      }
    } catch (error) {
      console.error('❌ 삭제 처리 오류:', error);
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  // 계좌정보 조회 함수
  const handleAccountInfo = async (userName: string, userPhone: string) => {
    setSelectedUser({ name: userName, phone: userPhone });
    setIsAccountModalOpen(true);
    setAccountLoading(true);
    setAccountInfo(null);

    try {
      console.log('🔍 계좌정보 조회 시작:', { userName, userPhone });
      
      // 새로운 계좌정보 API 호출
      const response = await fetch(`/api/admin/members/account-info?name=${encodeURIComponent(userName)}&phone=${encodeURIComponent(userPhone)}`);
      const data = await response.json();
      
      console.log('📊 계좌정보 API 응답:', data);
      
      if (data.success && data.data) {
        const accountData = {
          bankName: data.data.bankName || '정보 없음',
          accountNumber: data.data.bankAccount || '정보 없음',
          accountHolder: data.data.accountHolder || '정보 없음'
        };
        
        setAccountInfo(accountData);
        console.log('✅ 계좌정보 설정 완료:', accountData);
      } else {
        console.log('❌ 계좌정보 조회 실패:', data.message);
        setAccountInfo({
          bankName: '조회 실패',
          accountNumber: '조회 실패',
          accountHolder: '조회 실패'
        });
      }
    } catch (error) {
      console.error('❌ 계좌정보 조회 오류:', error);
      setAccountInfo({
        bankName: '오류 발생',
        accountNumber: '오류 발생',
        accountHolder: '오류 발생'
      });
    } finally {
      setAccountLoading(false);
    }
  };

  // 계좌정보 저장 함수
  const handleSaveAccountInfo = (accountInfo: {bankName: string, accountNumber: string, accountHolder: string}) => {
    if (!selectedUser) return;
    
    const userKey = `${selectedUser.name}_${selectedUser.phone}`;
    const updatedSavedInfo = {
      ...savedAccountInfo,
      [userKey]: accountInfo
    };
    
    setSavedAccountInfo(updatedSavedInfo);
    // 계좌정보는 별도 관리 (필요시 데이터베이스에서 저장)
    
    console.log('✅ 계좌정보 저장 완료:', userKey, accountInfo);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (userKey: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [userKey]: file
    }));
    console.log('✅ 파일 업로드 완료:', userKey, file.name);
  };

  // 지급 처리 함수
  const handlePayment = async (itemId: string, userName: string, userPhone: string) => {
    const confirmPayment = confirm(`${userName}(${userPhone})님의 정산을 지급완료로 처리하시겠습니까?`);
    if (!confirmPayment) {
      return;
    }

    try {
      setLoading(true);
      
      // 해당 항목의 requestStatus를 '지급완료'로 업데이트
      const updatedData = commissionData.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            requestStatus: '지급완료' as const,
            paymentStatus: 'PAID' as const,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });

      setCommissionData(updatedData);
      
      // 서버에 상태값 업데이트 저장
      const response = await fetch('/api/admin/settlements/save-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedItems: updatedData.filter(item => item.id === itemId),
          processedBy: 'admin'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${userName}님의 정산이 지급완료로 처리되었습니다.`);
      } else {
        alert(`지급 처리 중 오류가 발생했습니다: ${result.message || result.error}`);
      }
      
    } catch (error) {
      console.error('지급 처리 오류:', error);
      alert('지급 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + 'P';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 상태별 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return '승인됨';
      case 'PENDING': return '대기중';
      case 'CANCELLED': return '지급보류';
      default: return status;
    }
  };

  // 통계 계산
  const totalMembers = filteredData.length;
  const totalFinalPoints = filteredData.reduce((sum, item) => sum + item.finalPoints, 0);
  const totalCommission = filteredData.reduce((sum, item) => sum + item.totalCommission, 0);

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
              <h1 className="text-3xl font-bold text-gray-900">✅ 정산완료</h1>
              <p className="text-gray-600 mt-2">승인 완료된 정산 내역을 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">총인원</div>
                <div className="text-lg font-bold text-gray-900">{totalMembers.toLocaleString()}명</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">결정포인트합계</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(totalFinalPoints)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">총지급액합계</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(totalCommission)}</div>
              </div>
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
                  placeholder="회원명 또는 연락처로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>



            {/* 기본 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Search className="w-4 h-4 mr-1" />
                검색
              </button>
              
              {/* 정산월 필터 드롭다운 */}
              <div className="relative">
                <select
                  value={selectedSettlementMonth}
                  onChange={(e) => setSelectedSettlementMonth(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="정산월 필터 선택"
                  aria-label="정산월 필터"
                >
                  <option value="">전체 정산월</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                확인저장
              </button>
              <button
                onClick={handleSendCompleted}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                정산완료내역보내기
              </button>
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                삭제하기
              </button>
              <button
                onClick={handleExcelDownload}
                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                다운로드
              </button>
            </div>
          </div>
        </motion.div>

        {/* 메인 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                    회원명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결정포인트
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기본수당
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    모집수당
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    간접수당
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기본배당
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    배당등급별
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총지급액
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정산월
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청정보
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    지급관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                        <span>데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-gray-400" />
                        <span>검색 결과가 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          aria-label={`항목 ${item.id} 선택`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.userPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(item.finalPoints)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600 font-semibold">{formatCurrency(item.basicCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600 font-semibold">{formatCurrency(item.recruitmentCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-purple-600 font-semibold">{formatCurrency(item.indirectCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-orange-600 font-semibold">{formatCurrency(item.dividendBasicCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-600 font-semibold">{formatCurrency(item.dividendLevelCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(item.totalCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.settlementYearMonth}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.requestStatus === '정산대기' ? 'bg-yellow-100 text-yellow-800' :
                            item.requestStatus === '정산가능' ? 'bg-green-100 text-green-800' :
                            item.requestStatus === '출금요청' ? 'bg-blue-100 text-blue-800' :
                            item.requestStatus === '지급완료' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.requestStatus || '정산대기'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleAccountInfo(item.userName, item.userPhone)}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            계좌정보
                          </button>
                          <button 
                            disabled
                            className="px-3 py-1 text-xs bg-gray-400 text-white rounded cursor-not-allowed"
                            title="서버 데이터는 변경할 수 없습니다"
                          >
                            수정
                          </button>
                          <button 
                            onClick={() => handlePayment(item.id, item.userName, item.userPhone)}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            송금완료
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 선택된 항목 정보 */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length}개 항목이 선택되었습니다.
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  선택 항목 Excel 다운로드
                </button>
                <button 
                  onClick={() => setSelectedItems([])}
                  className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50"
                >
                  선택 해제
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 계좌정보 모달 */}
        <AccountInfoModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          userName={selectedUser?.name || ''}
          userPhone={selectedUser?.phone || ''}
          accountInfo={accountInfo}
          loading={accountLoading}
          onSaveAccountInfo={handleSaveAccountInfo}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
}
