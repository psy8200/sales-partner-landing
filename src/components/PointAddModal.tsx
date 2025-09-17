'use client';

import React, { useState } from 'react';
import { X, Plus, Star, Crown, Sparkles, Gift } from 'lucide-react';

interface PointAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userPhone: string;
}

const PointAddModal: React.FC<PointAddModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userPhone
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [consultationDate, setConsultationDate] = useState<string>('');
  const [consultationTime, setConsultationTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const itemOptions = [
    '상조상품',
    '상조결합상품', 
    '보험추가상담',
    '인터넷+TV상담',
    '렌탈제품신청상담',
    '렌탈사이트분양상담'
  ];

  const handleItemToggle = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0 || !consultationDate || !consultationTime) {
      alert('아이템을 선택하고 상담 날짜와 시간을 입력해주세요! ✨');
      return;
    }

    // 확인 모달 표시
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    try {
      // 포인트추가 신청 API 호출
      const response = await fetch('/api/admin/point-add/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          selectedItems,
          consultationDate,
          consultationTime
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        alert(`신청 중 오류가 발생했습니다: ${result.error}`);
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error('포인트추가 신청 오류:', error);
      alert('포인트추가 신청 중 오류가 발생했습니다. 다시 시도해주세요! 😅');
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 메인 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl transform animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* 모달 헤더 */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-t-3xl p-4 text-white overflow-hidden">
          {/* 럭셔리 배경 패턴 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
            <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-8 w-4 h-4 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-8 right-4 w-10 h-10 border-2 border-white/30 rounded-full"></div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 z-10"
            title="닫기"
            aria-label="모달 닫기"
          >
            <X size={20} />
          </button>
          
          <div className="relative z-10 flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Crown size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">기준포인트추가방법</h2>
            </div>
          </div>
        </div>

        {/* 모달 내용 */}
        <div className="p-4">
          {/* 상담 안내 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Star className="inline w-4 h-4 mr-1 text-yellow-500" />
              상담을 통해서 기준포인트를 추가하세요.
            </label>
          </div>

          {/* 아이템 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Gift className="inline w-4 h-4 mr-1 text-purple-500" />
              아이템 선택
            </label>
            <div className="grid grid-cols-1 gap-1">
              {itemOptions.map((item) => (
                <label key={item} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item)}
                    onChange={() => handleItemToggle(item)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 상담가능 날짜 */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <Sparkles className="inline w-4 h-4 mr-1 text-pink-500" />
              상담가능 날짜
            </label>
            <input
              type="date"
              value={consultationDate}
              onChange={(e) => setConsultationDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              title="상담가능 날짜를 선택하세요"
              required
            />
          </div>

          {/* 상담가능 시간 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <Sparkles className="inline w-4 h-4 mr-1 text-pink-500" />
              상담가능 시간
            </label>
            <select
              value={consultationTime}
              onChange={(e) => setConsultationTime(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              title="상담가능 시간을 선택하세요"
              required
            >
              <option value="">상담 시간을 선택하세요</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
              <option value="18:00">18:00</option>
            </select>
          </div>

          {/* 버튼들 */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              닫기
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>신청중...</span>
                </div>
              ) : (
                '신청하기'
              )}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">포인트추가 신청</h3>
              <p className="text-sm text-gray-600 mb-6">
                선택한 아이템으로 포인트추가를 신청하시겠어요? ✨
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                >
                  신청하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">신청 완료! 🎉</h3>
              <p className="text-sm text-gray-600 mb-6">
                포인트추가 신청이 완료되었습니다!<br />
                관리자 승인 후 포인트가 지급됩니다. 💎
              </p>
              <button
                onClick={handleSuccessClose}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PointAddModal;
