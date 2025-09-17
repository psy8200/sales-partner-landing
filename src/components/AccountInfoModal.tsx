'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Building2, Hash, Upload, FileText, CheckCircle } from 'lucide-react';

interface AccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface AccountInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userPhone: string;
  accountInfo: AccountInfo | null;
  loading: boolean;
  onSaveAccountInfo?: (accountInfo: AccountInfo) => void;
  uploadedFiles?: { [key: string]: File }; // 회원별 업로드된 파일들
  onFileUpload?: (userKey: string, file: File) => void; // 파일 업로드 핸들러
}

export default function AccountInfoModal({
  isOpen,
  onClose,
  userName,
  userPhone,
  accountInfo,
  loading,
  onSaveAccountInfo,
  uploadedFiles = {},
  onFileUpload
}: AccountInfoModalProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  // 현재 회원의 고유 키 생성
  const userKey = `${userName}_${userPhone}`;
  const currentUserFile = uploadedFiles[userKey] || null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 파일 타입 체크 (이미지 파일만)
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      // 회원별로 파일 저장
      if (onFileUpload) {
        onFileUpload(userKey, file);
      }
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!currentUserFile || !accountInfo) return;
    
    setUploadStatus('uploading');
    
    try {
      // 실제 업로드 로직 (여기서는 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadStatus('success');
      
      // 신분증 업로드 성공 시 계좌정보 저장
      if (onSaveAccountInfo) {
        onSaveAccountInfo(accountInfo);
      }
      
      // 2초 후 성공 상태 초기화
      setTimeout(() => {
        setUploadStatus('idle');
      }, 2000);
      
    } catch (error) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 2000);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* 모달 컨텐츠 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">💳 계좌정보</h2>
                    <p className="text-blue-100 text-sm">{userName} ({userPhone})</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  aria-label="모달 닫기"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* 컨텐츠 */}
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">계좌정보를 불러오는 중...</p>
                </div>
              ) : accountInfo ? (
                <div className="space-y-4">
                  {/* 은행명 */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">은행명</p>
                        <p className="text-lg font-bold text-green-800">{accountInfo.bankName}</p>
                      </div>
                    </div>
                  </div>

                  {/* 계좌번호 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Hash className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">계좌번호</p>
                        <p className="text-lg font-bold text-blue-800 font-mono">{accountInfo.accountNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* 예금주 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">예금주</p>
                        <p className="text-lg font-bold text-purple-800">{accountInfo.accountHolder}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">계좌정보를 찾을 수 없습니다.</p>
                </div>
              )}

              {/* 신분증 업로드 섹션 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  신분증 업로드
                </h3>
                
                <div className="space-y-4">
                  {/* 파일 선택 영역 */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="idCardUpload"
                    />
                    <label
                      htmlFor="idCardUpload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      {currentUserFile ? (
                        // 업로드된 이미지 미리보기
                        <div className="relative w-full max-w-md">
                          <img
                            src={URL.createObjectURL(currentUserFile)}
                            alt="신분증 이미지"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            {currentUserFile.name}
                          </div>
                        </div>
                      ) : (
                        // 파일 선택 안내
                        <>
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Upload className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              신분증 이미지를 선택하세요
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG 파일만 가능 (최대 5MB)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  {/* 업로드 버튼 */}
                  {currentUserFile && (
                    <button
                      onClick={handleUpload}
                      disabled={uploadStatus === 'uploading'}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                        uploadStatus === 'uploading'
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : uploadStatus === 'success'
                          ? 'bg-green-500 text-white'
                          : uploadStatus === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {uploadStatus === 'uploading' && (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          업로드 중...
                        </div>
                      )}
                      {uploadStatus === 'success' && (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          업로드 완료!
                        </div>
                      )}
                      {uploadStatus === 'error' && '업로드 실패'}
                      {uploadStatus === 'idle' && '신분증 업로드'}
                    </button>
                  )}

                </div>
              </div>
            </div>

            {/* 푸터 */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
