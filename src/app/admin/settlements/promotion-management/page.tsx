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
  Award,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { LEVEL_ICONS, getLevelIcon, getLevelName, getLevelColor } from '@/lib/levelIcons';
import { calculateLevel, getNextLevelRequirement, getRemainingReferrals } from '@/lib/levelCalculator';

// 승급 회원 데이터 타입 정의 (수정된 컬럼 기준)
interface PromotionMember {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  myCode: string; // 내코드 필드 추가
  referralCode: string;
  previousLevel: number;
  currentLevel: number | 'LEGEND'; // newLevel -> currentLevel로 변경
  totalReferrals: number; // 총 추천인원 (직접+간접)
  directReferrals: number; // 직접 추천인원
  indirectReferrals: number; // 간접 추천인원
  promotionDate: string;
  giftContent: string; // bonusContent -> giftContent로 변경
  giftAmount?: number; // bonusAmount -> giftAmount로 변경
  giftType: 'GIFT_CARD' | 'TRAVEL' | 'CAR' | 'LEGEND'; // 선물 타입 추가
  paymentStatus: 'PENDING' | 'PAYMENT_REQUESTED' | 'PAID' | 'CANCELLED';
  paymentDate?: string;
  processedBy?: string;
  memo?: string;
  isPaid: boolean; // 지급완료 여부 추가
  createdAt: string;
}

export default function PromotionManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSearchTerm, setFilteredSearchTerm] = useState(''); // 실제 필터링에 사용되는 검색어
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [promotionMembers, setPromotionMembers] = useState<PromotionMember[]>([]);
  const [loading, setLoading] = useState(true);

  // 검색 함수
  const handleSearch = () => {
    setFilteredSearchTerm(searchTerm);
  };

  // 데이터 조회 함수 (정산리스트 기반)
  const fetchPromotionMembers = async () => {
    try {
      setLoading(true);
      
      // 정산리스트 데이터 조회
      const settlementsResponse = await fetch('/api/admin/settlements/data?page=1&limit=1000');
      const settlementsData = await settlementsResponse.json();
      
      // 지급 완료 내역 조회 (별도 처리)
      let paymentHistoryData = { success: false, data: [] };
      try {
        const paymentHistoryResponse = await fetch('/api/admin/settlements/payment-history');
        paymentHistoryData = await paymentHistoryResponse.json();
        console.log('🔍 PaymentHistory API 응답:', paymentHistoryData);
      } catch (error) {
        console.error('❌ PaymentHistory API 호출 실패:', error);
      }
      
      // 지급 완료된 회원들의 내코드 목록 생성
      const paidMembers = new Set();
      if (paymentHistoryData.success && paymentHistoryData.data) {
        paymentHistoryData.data.forEach((payment: any) => {
          paidMembers.add(payment.myCode);
        });
        console.log('✅ 지급 완료된 회원들:', Array.from(paidMembers));
      } else {
        console.log('❌ 지급 완료 내역 조회 실패:', paymentHistoryData);
      }
      
      if (settlementsResponse.ok) {
        const data = settlementsData;
        const settlementData = data.data || [];
        
        // 정산리스트 데이터를 고객별로 집계하여 승급회원 형태로 변환
        const customerMap = new Map();
        
        // 고객별로 데이터 집계
        settlementData.forEach((contract: any) => {
          const customerKey = `${contract.customerName}_${contract.customerPhone}`;
          
          if (!customerMap.has(customerKey)) {
            customerMap.set(customerKey, {
              customerName: contract.customerName,
              customerPhone: contract.customerPhone,
              totalPoints: 0,
              totalAmount: 0,
              contractCount: 0,
              referralCode: contract.referralCode,
              latestConfirmedAt: contract.confirmedAt,
              contractNumbers: []
            });
          }
          
          const customer = customerMap.get(customerKey);
          customer.totalPoints += contract.finalPoints || 0;
          customer.totalAmount += contract.contractAmount || 0;
          customer.contractCount += 1;
          customer.contractNumbers.push(contract.contractNumber);
          
          // 가장 최근 확정일로 업데이트
          if (new Date(contract.confirmedAt) > new Date(customer.latestConfirmedAt)) {
            customer.latestConfirmedAt = contract.confirmedAt;
          }
        });
        
        // 집계된 데이터를 승급회원 형태로 변환
        const transformedMembers = await Promise.all(
          Array.from(customerMap.values()).map(async (customer, index) => {
            const myCode = customer.customerPhone.slice(-8);
            
            // 직접 추천인원 계산 (해당 회원의 내코드로 정산리스트에서 조회)
            let directReferrals = 0;
            let indirectReferrals = 0;
            
            try {
              // User 테이블 기반 추천인원 조회
              const response = await fetch(`/api/admin/settlements/user-referrals?phoneLast8=${myCode}`);
              const data = await response.json();
              
              if (data.success && data.data) {
                directReferrals = data.data.totalDirectReferrals;
                indirectReferrals = data.data.totalIndirectReferrals;
                
                console.log(`✅ ${customer.customerName}(${myCode}) 추천인원:`, {
                  직접: directReferrals,
                  간접: indirectReferrals,
                  총합: directReferrals + indirectReferrals
                });
              }
            } catch (error) {
              console.error(`❌ ${customer.customerName}의 추천인원 계산 오류:`, error);
            }
            
            const totalReferrals = directReferrals + indirectReferrals;
            const currentLevel = calculateCurrentLevel(totalReferrals);
            
            // 이전 등급 계산 (현재 등급보다 1단계 낮은 등급)
            const currentLevelNum = typeof currentLevel === 'number' ? currentLevel : 10;
            const previousLevelNum = Math.max(0, currentLevelNum - 1); // 현재 등급에서 1단계 낮은 등급
            const previousLevel = previousLevelNum;
            
            // 승급 조건 확인 (이전 등급에서 현재 등급으로 승급했는지 확인)
            const hasPromoted = currentLevelNum > previousLevelNum; // 등급이 올라갔는지 확인
            
            // 지급 완료된 회원인지 확인
            const isPaid = paidMembers.has(myCode);
            
            // 지급상태 결정
            let paymentStatus: 'PENDING' | 'PAYMENT_REQUESTED' | 'PAID' | 'CANCELLED';
            let memo: string;
            
            if (isPaid) {
              // 지급 완료된 회원: 다음 승급을 위한 필요 인원수 표시
              const nextLevel = typeof currentLevel === 'number' ? currentLevel + 1 : 10;
              const nextLevelRequirement = getNextLevelRequirement(nextLevel);
              const neededForNext = Math.max(0, nextLevelRequirement - totalReferrals);
              memo = `다음 승급까지: ${neededForNext}명 필요`;
              paymentStatus = 'PENDING' as const;
              console.log(`✅ ${customer.customerName}(${myCode}): 지급완료 → 다음승급까지 ${neededForNext}명 필요`);
            } else if (hasPromoted) {
              // 승급했지만 아직 지급하지 않은 회원
              memo = `승급요청중`;
              paymentStatus = 'PAYMENT_REQUESTED' as const;
              console.log(`🎯 ${customer.customerName}(${myCode}): 승급완료 → 지급요청 상태`);
            } else {
              // 승급 조건 미달성
              const needed = getNextLevelRequirement(currentLevelNum + 1) - totalReferrals;
              memo = needed > 0 ? `다음 승급까지: ${needed}명 필요` : `최고등급`;
              paymentStatus = 'PENDING' as const;
              console.log(`⏳ ${customer.customerName}(${myCode}): 승급조건 미달성 → 다음 승급까지 ${needed}명 필요`);
            }
            
            return {
              id: `customer_${index}`,
              userId: `user_${index}`,
              userName: customer.customerName,
              userPhone: customer.customerPhone,
              myCode: myCode,
              referralCode: customer.referralCode,
              previousLevel: previousLevel, // 이전 등급
              currentLevel: currentLevel,
              totalReferrals: totalReferrals,
              directReferrals: directReferrals,
              indirectReferrals: indirectReferrals,
              promotionDate: customer.latestConfirmedAt,
              giftContent: getGiftContent(currentLevel),
              giftAmount: getGiftAmount(currentLevel),
              giftType: getGiftType(currentLevel),
              paymentStatus: paymentStatus,
              memo: memo,
              isPaid: isPaid, // 지급완료 여부 추가
              createdAt: customer.latestConfirmedAt
            };
          })
        );
        
        setPromotionMembers(transformedMembers);
      } else {
        console.error('Failed to fetch settlement data');
        setPromotionMembers([]);
      }
    } catch (error) {
      console.error('Error fetching settlement data:', error);
      setPromotionMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // 현재 등급 계산 함수 (levelCalculator.ts의 calculateLevel 사용)
  const calculateCurrentLevel = (referralCount: number): number | 'LEGEND' => {
    return calculateLevel(referralCount);
  };

  // 승급까지 필요한 인원수 계산 함수 (levelCalculator.ts의 getRemainingReferrals 사용)
  const calculateRequiredReferrals = (currentLevel: number | 'LEGEND', currentReferrals: number): number => {
    if (currentLevel === 'LEGEND') return 0; // LEGEND는 최고 등급
    return getRemainingReferrals(currentLevel, currentReferrals);
  };

  // 새로고침 함수
  const handleRefresh = () => {
    setFilteredSearchTerm('');
    setSearchTerm('');
    fetchPromotionMembers();
  };

  // 엔터키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 선물 지급 처리
  const handlePayment = async (memberId: string) => {
    try {
      // 현재 회원 정보 찾기
      const member = promotionMembers.find(m => m.id === memberId);
      if (!member) {
        alert('회원 정보를 찾을 수 없습니다.');
        return;
      }

      // 지급완료 내역을 서버에 저장
      const response = await fetch('/api/admin/settlements/payment-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: member.userId,
          userName: member.userName,
          userPhone: member.userPhone,
          myCode: member.myCode,
          referralCode: member.referralCode,
          previousLevel: member.previousLevel,
          currentLevel: member.currentLevel,
          totalReferrals: member.totalReferrals,
          directReferrals: member.directReferrals,
          indirectReferrals: member.indirectReferrals,
          promotionDate: member.promotionDate,
          giftContent: member.giftContent,
          giftAmount: member.giftAmount,
          giftType: member.giftType,
          processedBy: '관리자', // 실제로는 로그인한 관리자 정보
          memo: '선물 지급 완료'
        }),
      });

      if (response.ok) {
        alert('선물 지급이 완료되었습니다. 지급완료 내역이 저장되었습니다.');
        // 데이터 새로고침으로 서버에서 최신 상태 반영
        fetchPromotionMembers();
      } else {
        const error = await response.json();
        alert(`지급 처리 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('지급 처리 중 오류가 발생했습니다.');
    }
  };

  // 선물 지급 취소
  const handleCancel = async (memberId: string) => {
    const cancelReason = prompt('취소 사유를 입력해주세요:');
    if (!cancelReason || cancelReason.trim() === '') {
      alert('취소 사유를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/settlements/promotion-cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promotionMemberId: memberId,
          processedBy: '관리자',
          cancelReason: cancelReason.trim(),
          memo: '선물 지급 취소'
        }),
      });

      if (response.ok) {
        alert('선물 지급이 취소되었습니다.');
        fetchPromotionMembers(); // 데이터 새로고침
      } else {
        const error = await response.json();
        alert(`취소 처리 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('취소 처리 중 오류가 발생했습니다.');
    }
  };

  // 일괄 선물 지급
  const handleBulkPayment = async () => {
    if (selectedItems.length === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }

    if (!confirm(`${selectedItems.length}명의 선물을 일괄 지급하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/settlements/promotion-payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promotionMemberIds: selectedItems,
          processedBy: '관리자',
          memo: '일괄 선물 지급 완료'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setSelectedItems([]);
        fetchPromotionMembers(); // 데이터 새로고침
      } else {
        const error = await response.json();
        alert(`일괄 지급 처리 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('Bulk payment error:', error);
      alert('일괄 지급 처리 중 오류가 발생했습니다.');
    }
  };

  // 일괄 선물 지급 취소
  const handleBulkCancel = async () => {
    if (selectedItems.length === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }

    const cancelReason = prompt('취소 사유를 입력해주세요:');
    if (!cancelReason || cancelReason.trim() === '') {
      alert('취소 사유를 입력해주세요.');
      return;
    }

    if (!confirm(`${selectedItems.length}명의 선물을 일괄 취소하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/settlements/promotion-cancel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promotionMemberIds: selectedItems,
          processedBy: '관리자',
          cancelReason: cancelReason.trim(),
          memo: '일괄 선물 지급 취소'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setSelectedItems([]);
        fetchPromotionMembers(); // 데이터 새로고침
      } else {
        const error = await response.json();
        alert(`일괄 취소 처리 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('Bulk cancel error:', error);
      alert('일괄 취소 처리 중 오류가 발생했습니다.');
    }
  };

  // 등급별 선물 내용 (회원페이지 혜택 기준)
  const getGiftContent = (level: number | string) => {
    switch (level) {
      case 4: return "상품권 50만원 지급 (10만원 상품권 5장)";
      case 5: return "상품권 200만원 지급 (10만원 상품권 20장)";
      case 6: return "상품권 500만원 지급 (50만원 상품권 10장)";
      case 7: return "최고급동남아 3박4일 여행권 2인권 + 여행경비 500만원";
      case 8: return "비즈니스석 + 유럽크루즈 2인 + 여행경비 1,000만원";
      case 9: return "고급세단 벤츠 또는 동급 + 주유상품권 500만원추가지급";
      case 10: return "최고급세단 벤츠 S-Class 또는 동급 + 전용기사제공";
      case "LEGEND": return "드림카 + 전용기사 + 법인카드 + 부회장급 임원대우";
      default: return "승급보너스";
    }
  };

  // 등급별 선물 금액
  const getGiftAmount = (level: number | string) => {
    switch (level) {
      case 4: return 500000; // 50만원
      case 5: return 2000000; // 200만원
      case 6: return 5000000; // 500만원
      case 7: return 5000000; // 여행경비 500만원
      case 8: return 10000000; // 여행경비 1,000만원
      case 9: return 5000000; // 주유상품권 500만원
      case 10: return 0; // 차량 + 전용기사 (금액 없음)
      case "LEGEND": return 0; // 드림카 + 기타 혜택 (금액 없음)
      default: return 0;
    }
  };

  // 등급별 선물 타입
  const getGiftType = (level: number | string): 'GIFT_CARD' | 'TRAVEL' | 'CAR' | 'LEGEND' => {
    if (level === "LEGEND") return 'LEGEND';
    if (typeof level === 'number') {
      if (level >= 4 && level <= 6) return 'GIFT_CARD';
      if (level >= 7 && level <= 8) return 'TRAVEL';
      if (level >= 9 && level <= 10) return 'CAR';
    }
    return 'GIFT_CARD';
  };

  // 목업 데이터 (수정된 구조)
  const mockPromotionMembers: PromotionMember[] = [
    {
      id: '1',
      userId: 'user001',
      userName: '김승급',
      userPhone: '010-1234-5678',
      myCode: '12345678',
      referralCode: 'REF001',
      previousLevel: 3,
      currentLevel: 4,
      totalReferrals: 15,
      directReferrals: 5,
      indirectReferrals: 10,
      promotionDate: '2024-01-15 14:30:00',
      giftContent: getGiftContent(4),
      giftAmount: getGiftAmount(4),
      giftType: getGiftType(4),
      paymentStatus: 'PENDING',
      memo: '승급 조건 달성 확인',
      createdAt: '2024-01-15 14:30:00'
    },
    {
      id: '2',
      userId: 'user002',
      userName: '이레벨업',
      userPhone: '010-2345-6789',
      myCode: '23456789',
      referralCode: 'REF002',
      previousLevel: 4,
      currentLevel: 5,
      totalReferrals: 25,
      directReferrals: 8,
      indirectReferrals: 17,
      promotionDate: '2024-01-14 16:45:00',
      giftContent: getGiftContent(5),
      giftAmount: getGiftAmount(5),
      giftType: getGiftType(5),
      paymentStatus: 'PAID',
      paymentDate: '2024-01-15 09:00:00',
      processedBy: '관리자1',
      memo: '지급 완료',
      createdAt: '2024-01-14 16:45:00'
    },
    {
      id: '3',
      userId: 'user003',
      userName: '박트로피',
      userPhone: '010-3456-7890',
      myCode: '34567890',
      referralCode: 'REF003',
      previousLevel: 9,
      currentLevel: 10,
      totalReferrals: 1200,
      directReferrals: 50,
      indirectReferrals: 1150,
      promotionDate: '2024-01-13 11:20:00',
      giftContent: getGiftContent(10),
      giftAmount: getGiftAmount(10),
      giftType: getGiftType(10),
      paymentStatus: 'PENDING',
      memo: '고가 상품 준비 중',
      createdAt: '2024-01-13 11:20:00'
    },
    {
      id: '4',
      userId: 'user004',
      userName: '최레전드',
      userPhone: '010-4567-8901',
      myCode: '45678901',
      referralCode: 'REF004',
      previousLevel: 10,
      currentLevel: 'LEGEND',
      totalReferrals: 2000,
      directReferrals: 100,
      indirectReferrals: 1900,
      promotionDate: '2024-01-12 08:15:00',
      giftContent: getGiftContent('LEGEND'),
      giftAmount: getGiftAmount('LEGEND'),
      giftType: getGiftType('LEGEND'),
      paymentStatus: 'PAID',
      paymentDate: '2024-01-12 15:30:00',
      processedBy: '관리자2',
      memo: '부회장급 임원 대우 적용',
      createdAt: '2024-01-12 08:15:00'
    }
  ];

  // 필터링된 데이터 (이름+연락처+내코드+추천인코드 검색)
  const filteredMembers = promotionMembers.filter(member => {
    // 검색어 필터링
    const matchesSearch = !filteredSearchTerm || (() => {
      const searchLower = filteredSearchTerm.toLowerCase();
      
      return (
        // 고객명으로 검색
        member.userName.toLowerCase().includes(searchLower) ||
        // 연락처로 검색
        member.userPhone.includes(filteredSearchTerm) ||
        // 내코드로 검색
        member.myCode.includes(filteredSearchTerm) ||
        // 추천인코드로 검색
        (member.referralCode && member.referralCode.toLowerCase().includes(searchLower))
      );
    })();
    
    // 상태 필터링
    const matchesStatus = statusFilter === 'ALL' || member.paymentStatus === statusFilter;
    
    // 레벨 필터링
    const matchesLevel = levelFilter === 'ALL' || member.currentLevel.toString() === levelFilter;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  // 개별 선택 처리
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // 전체 선택 처리
  const handleSelectAll = () => {
    if (selectedItems.length === filteredMembers.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMembers.map(member => member.id));
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 날짜시간 포맷팅 (년월일만 표시)
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          대기중
        </span>;
      case 'PAYMENT_REQUESTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Award className="w-3 h-3 mr-1" />
          지급요청
        </span>;
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          지급완료
        </span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          취소
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  // 지급 버튼 텍스트
  const getPaymentButtonText = (level: number | string) => {
    switch (level) {
      case 1:
      case 2:
      case 3:
        return "승급지급";
      case 4:
      case 5:
      case 6:
        return "상품권지급";
      case 7:
      case 8:
        return "여행권지급";
      case 9:
      case 10:
        return "차량지급";
      case "LEGEND":
        return "LEGEND지급";
      default:
        return "승급지급";
    }
  };

  // 액션 버튼
  const getActionButtons = (member: PromotionMember) => {
    const currentLevelNum = typeof member.currentLevel === 'number' ? member.currentLevel : 10; // LEGEND는 10으로 처리
    const previousLevelNum = typeof member.previousLevel === 'number' ? member.previousLevel : 10;
    const hasPromoted = currentLevelNum > previousLevelNum; // 등급이 올라갔는지 확인
    
    // 지급완료 여부 확인 (PaymentHistory에서 확인)
    const isPaid = member.isPaid;
    
    // 모든 행에 일관되게 버튼 표시
    return (
      <div className="flex space-x-2">
        <button 
          onClick={() => handlePayment(member.id)}
          className={`px-3 py-1 text-white text-xs rounded hover:opacity-80 ${
            hasPromoted && !isPaid && (member.paymentStatus === 'PENDING' || member.paymentStatus === 'PAYMENT_REQUESTED')
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasPromoted || isPaid || member.paymentStatus === 'CANCELLED'}
        >
          {isPaid ? '지급완료' : 
           member.paymentStatus === 'CANCELLED' ? '취소됨' :
           hasPromoted ? getPaymentButtonText(member.currentLevel) : '승급조건미달'}
        </button>
        <button 
          onClick={() => handleCancel(member.id)}
          className={`px-3 py-1 text-white text-xs rounded hover:opacity-80 ${
            hasPromoted && !isPaid && (member.paymentStatus === 'PENDING' || member.paymentStatus === 'PAYMENT_REQUESTED')
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasPromoted || isPaid || member.paymentStatus === 'CANCELLED'}
        >
          취소
        </button>
      </div>
    );
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchPromotionMembers();
  }, []);

  // 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    fetchPromotionMembers();
  }, [filteredSearchTerm, statusFilter, levelFilter]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">승급회원관리</h1>
              <p className="text-sm text-gray-600 mt-1">
                정산리스트 기반으로 모든 회원의 등급과 추천인원을 확인하고, 승급까지 필요한 인원수를 관리합니다.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            {/* 검색바 (50% 너비) */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="회원명, 연락처, 내코드, 추천인코드 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 버튼 영역 (50% 너비, 좌측 정렬) */}
            <div className="flex-1 flex justify-start gap-3">
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                검색
              </button>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </button>
            </div>
          </div>

          {/* 필터 영역 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 지급상태 필터 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="지급상태 필터"
            >
              <option value="ALL">전체 지급상태</option>
              <option value="PENDING">대기중</option>
              <option value="PAYMENT_REQUESTED">지급요청</option>
              <option value="PAID">지급완료</option>
              <option value="CANCELLED">취소</option>
            </select>

            {/* 레벨 필터 */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="레벨 필터"
            >
              <option value="ALL">전체 레벨</option>
              <option value="4">4단계</option>
              <option value="5">5단계</option>
              <option value="6">6단계</option>
              <option value="7">7단계</option>
              <option value="8">8단계</option>
              <option value="9">9단계</option>
              <option value="10">10단계</option>
              <option value="LEGEND">LEGEND</option>
            </select>

            {/* 날짜 필터 */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="날짜 필터"
            >
              <option value="ALL">전체 기간</option>
              <option value="TODAY">오늘</option>
              <option value="WEEK">이번 주</option>
              <option value="MONTH">이번 달</option>
            </select>
          </div>
        </div>
      </div>

      {/* 일괄 처리 버튼 */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedItems.length}개 항목 선택됨
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={handleBulkPayment}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                선택 항목 일괄 선물지급
              </button>
              <button 
                onClick={handleBulkCancel}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                선택 항목 일괄 취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 테이블 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredMembers.length && filteredMembers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="전체 선택"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  회원정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이전등급 → 승급되어현재등급
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 추천인원 (직접+간접)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  승급까지 필요한 인원수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  승급일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지급할 선물 내용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지급상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지급일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  승급관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => {
                const previousLevelInfo = LEVEL_ICONS[member.previousLevel];
                const currentLevelInfo = LEVEL_ICONS[member.currentLevel];
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(member.id)}
                        onChange={() => handleSelectItem(member.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`${member.userName} 선택`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.userName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {member.userPhone}
                          </div>
                          <div className="text-xs text-gray-400">
                            내코드: {member.myCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <span className={`text-xl mr-2 ${previousLevelInfo?.color || 'text-gray-400'}`}>
                          {previousLevelInfo?.icon || '🥚'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                            {previousLevelInfo?.name || '알'}
                          </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center">
                          <span className={`text-xl mr-2 ${currentLevelInfo?.color || 'text-gray-400'}`}>
                            {currentLevelInfo?.icon || '🥚'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {currentLevelInfo?.name || '알'}
                        </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{member.totalReferrals}명</div>
                        <div className="text-xs text-gray-500">
                          직접: {member.directReferrals}명, 간접: {member.indirectReferrals}명
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {member.memo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(() => {
                          // 실제 데이터의 memo 값을 사용
                          if (member.memo === '승급요청중') {
                            return (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Clock className="w-3 h-3 mr-1" />
                                {member.memo}
                              </span>
                            );
                          } else if (member.memo.includes('다음 승급까지')) {
                            return (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {member.memo}
                              </span>
                            );
                          } else if (member.memo === '최고등급') {
                            return (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Award className="w-3 h-3 mr-1" />
                                {member.memo}
                        </span>
                            );
                          } else {
                            // 기타 메시지들도 통일된 형식으로 표시
                            return (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {member.memo}
                        </span>
                            );
                          }
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(member.promotionDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {member.giftContent}
                      </div>
                      {member.giftAmount && member.giftAmount > 0 && (
                        <div className="text-sm font-medium text-blue-600">
                          {formatAmount(member.giftAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(member.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.paymentDate ? formatDateTime(member.paymentDate) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionButtons(member)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">승급회원 목록을 불러오는 중...</h3>
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">승급 회원이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              검색 조건을 변경하거나 다른 필터를 시도해보세요.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 (추후 구현) */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            이전
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            다음
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              총 <span className="font-medium">{filteredMembers.length}</span>개 결과
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                이전
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                다음
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
