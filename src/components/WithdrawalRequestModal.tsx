'use client';

import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Calendar, User, Phone, Upload, FileText, Image, Camera, FolderOpen } from 'lucide-react';

interface WithdrawalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userPhone: string;
  withdrawableAmount: number;
  onSuccess?: () => void; // 출금신청 성공 후 콜백
}

const WithdrawalRequestModal: React.FC<WithdrawalRequestModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userPhone,
  withdrawableAmount,
  onSuccess
}) => {
  const [requestAmount, setRequestAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<{amount: number, settlementMonth: string, withdrawalRequestId?: string, withdrawableAmount?: number} | null>(null);

  // 모달이 열릴 때 입력값만 초기화 (신분증은 유지)
  React.useEffect(() => {
    if (isOpen) {
      console.log('📱 모달 열림 - 신분증 파일 상태:', { 
        hasIdCardFile: !!idCardFile, 
        hasPreviewUrl: !!previewUrl,
        fileName: idCardFile?.name 
      });
      // 입력값만 초기화 (신분증 파일은 유지)
      setRequestAmount('');
    }
  }, [isOpen, idCardFile, previewUrl]);

  // 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하로 업로드해주세요! 📁');
        return;
      }
      
      // 파일 타입 검증 (이미지 파일만)
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다! 📸');
        return;
      }

      setIdCardFile(file);
      
      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      console.log('📸 신분증 파일 업로드 완료:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasPreviewUrl: !!url
      });
    }
  };

  // 카메라로 촬영
  const handleCameraCapture = () => {
    const input = document.getElementById('cameraUpload') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  // 갤러리에서 선택
  const handleGallerySelect = () => {
    const input = document.getElementById('galleryUpload') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  // 파일 삭제 핸들러
  const handleFileRemove = () => {
    setIdCardFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestAmount) {
      alert('출금 요청 금액을 입력해주세요! 💫');
      return;
    }

    if (!idCardFile) {
      alert('신분증을 첨부해주세요! 📄\n출금신청을 위해 신분증 확인이 필요합니다.');
      return;
    }

    const amount = parseFloat(requestAmount);
    const maxAmount = Math.floor(withdrawableAmount / 10000) * 10000;
    
    // 10,000원 미만 검증
    if (amount < 10000) {
      alert('출금 요청 금액은 10,000원 이상만 신청가능합니다! 💰\n10,000원 단위로 입력해주세요.');
      return;
    }
    
    // 최대 금액 초과 검증
    if (amount > maxAmount) {
      alert(`출금 요청 금액은 최대 ${maxAmount.toLocaleString()}원까지만 신청가능합니다! ✨`);
      return;
    }
    
    // 10,000원 단위 검증
    if (amount % 10000 !== 0) {
      alert('출금 요청 금액은 10,000원 단위로 입력해주세요! 💰');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // userId 검증
      if (!userId) {
        alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      // FormData 생성
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('userName', userName);
      formData.append('userPhone', userPhone);
      formData.append('finalPoints', withdrawableAmount.toString());
      formData.append('totalAmount', amount.toString());
      formData.append('idCardFile', idCardFile);

      console.log('출금신청 데이터 전송:', {
        userName,
        userPhone,
        finalPoints: withdrawableAmount,
        totalAmount: amount,
        fileName: idCardFile.name
      });

      // API 호출
      const response = await fetch('/api/admin/withdrawal-requests', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '출금신청에 실패했습니다.');
      }

      console.log('출금신청 성공:', result);
      console.log('withdrawableAmount:', result.data?.withdrawableAmount);
      
      // 성공 데이터 저장
      setSuccessData({
        amount: amount,
        settlementMonth: result.data?.settlementMonth || '2025-09',
        withdrawalRequestId: result.data?.id,
        withdrawableAmount: result.data?.withdrawableAmount
      });
      
      // 성공 모달 표시
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('출금신청 오류:', error);
      alert(`출금신청 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSuccessClose = async () => {
    try {
      console.log('🔥 출금신청 확인 버튼 클릭됨!');
      console.log('🔥 successData 상태:', successData);
      console.log('🔥 사용자 정보:', { userId, userName, userPhone });
      
      if (!successData) {
        console.error('❌ successData가 없습니다!');
        alert('출금신청 데이터가 없습니다. 다시 시도해주세요.');
        return;
      }
      
      console.log('출금신청 처리 시작:', {
        withdrawalRequestId: successData?.withdrawalRequestId,
        userId,
        userName,
        userPhone,
        totalAmount: successData?.amount,
        withdrawableAmount: successData?.withdrawableAmount
      });

      // 출금신청 처리 API 호출
      const response = await fetch('/api/admin/withdrawal-requests/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawalRequestId: successData?.withdrawalRequestId,
          userId,
          userName,
          userPhone,
          finalPoints: successData?.withdrawableAmount,
          totalAmount: successData?.amount
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '출금신청 처리에 실패했습니다.');
      }

      console.log('출금신청 처리 성공:', result);

      setShowSuccessModal(false);
      setSuccessData(null);
      onClose();
      
      // 출금신청 처리 후 정산 정보 새로고침
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('출금신청 처리 오류:', error);
      alert(`출금신청 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl transform animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-2xl p-4 text-white">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            title="닫기"
            aria-label="모달 닫기"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <DollarSign size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">출금신청하기</h2>
              <p className="text-pink-100 text-xs">안전하고 빠른 출금 서비스</p>
            </div>
          </div>
        </div>

        {/* 모달 내용 */}
        <div className="p-4">
          {/* 사용자 정보 */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <User size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{userName}</p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone size={12} className="mr-1" />
                  {userPhone}
                </p>
              </div>
            </div>
          </div>

          {/* 출금 가능 금액 */}
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-500 rounded-xl">
                  <CreditCard size={16} className="text-white" />
                </div>
                <span className="font-semibold text-gray-800">출금가능포인트</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {withdrawableAmount.toLocaleString()}P
              </span>
            </div>
          </div>

          {/* 출금신청 폼 */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 출금 요청 금액 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  출금 요청 금액 (P)
                </label>
                <span className="text-xs text-gray-500">
                  최대 {(Math.floor(withdrawableAmount / 10000) * 10000).toLocaleString()}원까지 출금 가능
                </span>
              </div>
              <input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder="출금할 금액을 입력해주세요"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200"
                max={Math.floor(withdrawableAmount / 10000) * 10000}
                min="10000"
                step="10000"
                required
              />
              <p className="text-xs text-blue-600 mt-1 font-medium">
                💡 10,000원 이상, 10,000원 단위로만 신청가능합니다.
              </p>
            </div>


            {/* 신분증 첨부 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                신분증 첨부 (필수) 📄
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-pink-400 transition-colors">
                {!idCardFile ? (
                  <div className="text-center space-y-3">
                    {/* 숨겨진 파일 입력들 */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="cameraUpload"
                      title="카메라로 촬영"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="galleryUpload"
                      title="갤러리에서 선택"
                    />
                    
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">신분증을 업로드하세요</p>
                      <p className="text-xs text-gray-500 mb-2">
                        JPG, PNG 파일만 가능 (최대 5MB)
                      </p>
                    </div>

                    {/* 카메라와 갤러리 버튼 */}
                    <div className="flex space-x-3 justify-center">
                      <button
                        type="button"
                        onClick={handleCameraCapture}
                        className="flex flex-col items-center space-y-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 transition-colors"
                      >
                        <div className="p-3 bg-blue-500 rounded-full">
                          <Camera size={20} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-blue-700">카메라로 촬영</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleGallerySelect}
                        className="flex flex-col items-center space-y-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 transition-colors"
                      >
                        <div className="p-3 bg-green-500 rounded-full">
                          <FolderOpen size={20} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-700">갤러리에서 선택</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* 신분증 업로드 완료 안내 */}
                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-medium text-green-800">신분증 업로드 완료</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-800">
                          {idCardFile.name}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            // 파일 입력 트리거
                            const fileInput = document.getElementById('galleryUpload') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.click();
                            }
                          }}
                          className="px-3 py-1 text-blue-500 hover:text-blue-700 text-sm border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          변경
                        </button>
                        <button
                          type="button"
                          onClick={handleFileRemove}
                          className="px-3 py-1 text-red-500 hover:text-red-700 text-sm border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    {previewUrl && (
                      <div className="mt-2">
                        <img
                          src={previewUrl}
                          alt="신분증 미리보기"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex space-x-2 pt-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>신청중...</span>
                  </div>
                ) : (
                  '신청하기 ✨'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleSuccessClose}
          />
          
          {/* 성공 모달 컨테이너 */}
          <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl transform animate-in zoom-in-95 duration-300">
            {/* 성공 모달 헤더 */}
            <div className="relative bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-t-3xl p-6 text-white text-center">
              {/* 성공 아이콘 */}
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">출금신청 완료! 🎉</h2>
              <p className="text-green-100 text-sm">관리자 승인 후 처리됩니다</p>
            </div>

            {/* 성공 모달 내용 */}
            <div className="p-6">
              {/* 신청 정보 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {successData?.amount.toLocaleString()}원
                  </div>
                  <p className="text-sm text-gray-600">출금 신청 금액</p>
                </div>
              </div>

              {/* 처리 정보 */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">신청자</span>
                  <span className="text-sm font-medium text-gray-800">{userName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">연락처</span>
                  <span className="text-sm font-medium text-gray-800">{userPhone}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">정산월</span>
                  <span className="text-sm font-medium text-gray-800">{successData?.settlementMonth}</span>
                </div>
              </div>

              {/* 안내 메시지 */}
              <div className="space-y-3 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">처리 안내</p>
                      <p className="text-xs">• 관리자 검토 후 승인됩니다</p>
                      <p className="text-xs">• 승인 시 계좌로 입금됩니다</p>
                      <p className="text-xs">• 처리 결과는 알림으로 안내됩니다</p>
                    </div>
                  </div>
                </div>
                
              </div>

              {/* 확인 버튼 */}
              <button
                onClick={handleSuccessClose}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                확인 ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequestModal;
