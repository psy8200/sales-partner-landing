'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PaymentVerificationData {
  name: string;           // 이름
  policyNumber: string;   // 증권번호
  referrer: string;       // 추천인
  manager: string;        // 담당자
  paymentAmount: number;  // 납입금액
  paymentMonth: string;   // 수금월
}

interface VerificationResult {
  success: PaymentVerificationData[];
  failure: PaymentVerificationData[];
  totalCount: number;
  successCount: number;
  failureCount: number;
}

export default function PaymentVerificationPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 엑셀 파일 업로드 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/payment-verification/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 업로드에 실패했습니다.');
      }

      const result = await response.json();
      setVerificationResult(result);
    } catch (err) {
      console.error('파일 업로드 오류:', err);
      setError(err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 수금성공 데이터를 수금완료페이지로 이동
  const handleMoveToSuccess = async () => {
    if (!verificationResult || verificationResult.success.length === 0) {
      alert('수금성공 데이터가 없습니다.');
      return;
    }

    if (!confirm(`${verificationResult.success.length}개의 수금성공 데이터를 수금완료페이지로 이동하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/payment-verification/move-to-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successData: verificationResult.success
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '데이터 이동에 실패했습니다.');
      }

      alert('수금성공 데이터가 수금완료페이지로 이동되었습니다.');
      
      // 결과 초기화
      setVerificationResult(null);
      setUploadedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('데이터 이동 오류:', err);
      alert(err instanceof Error ? err.message : '데이터 이동 중 오류가 발생했습니다.');
    }
  };

  // 수금실패 데이터를 수금실패페이지로 이동
  const handleMoveToFailure = async () => {
    if (!verificationResult || verificationResult.failure.length === 0) {
      alert('수금실패 데이터가 없습니다.');
      return;
    }

    if (!confirm(`${verificationResult.failure.length}개의 수금실패 데이터를 수금실패페이지로 이동하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/payment-verification/move-to-failure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          failureData: verificationResult.failure
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '데이터 이동에 실패했습니다.');
      }

      alert('수금실패 데이터가 수금실패페이지로 이동되었습니다.');
      
      // 결과 초기화
      setVerificationResult(null);
      setUploadedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('데이터 이동 오류:', err);
      alert(err instanceof Error ? err.message : '데이터 이동 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-blue-600">📊</span>
              수금검증페이지
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              엑셀 파일을 업로드하여 수금 데이터를 검증하고 분류합니다.
            </p>
          </div>

          {/* 파일 업로드 섹션 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">엑셀 파일 업로드</h2>
              <p className="text-sm text-gray-600 mt-1">
                수금 데이터가 포함된 엑셀 파일을 업로드하세요. (이름, 증권번호, 추천인, 담당자, 납입금액, 수금월)
              </p>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                  aria-label="엑셀 파일 업로드"
                  title="엑셀 파일을 선택하세요"
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-sm text-gray-600">파일을 처리하는 중...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      엑셀 파일을 드래그하거나 클릭하여 업로드
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      파일 선택
                    </button>
                  </div>
                )}
              </div>

              {uploadedFileName && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>업로드된 파일:</strong> {uploadedFileName}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* 검증 결과 섹션 */}
          {verificationResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">검증 결과</h2>
                <p className="text-sm text-gray-600 mt-1">
                  총 {verificationResult.totalCount}건 중 성공 {verificationResult.successCount}건, 실패 {verificationResult.failureCount}건
                </p>
              </div>
              
              <div className="p-6">
                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">📊</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-700">총 데이터</p>
                        <p className="text-2xl font-semibold text-blue-900">{verificationResult.totalCount}건</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-700">수금성공</p>
                        <p className="text-2xl font-semibold text-green-900">{verificationResult.successCount}건</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-700">수금실패</p>
                        <p className="text-2xl font-semibold text-red-900">{verificationResult.failureCount}건</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  {verificationResult.successCount > 0 && (
                    <button
                      onClick={handleMoveToSuccess}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      수금성공 데이터 이동 ({verificationResult.successCount}건)
                    </button>
                  )}
                  
                  {verificationResult.failureCount > 0 && (
                    <button
                      onClick={handleMoveToFailure}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      수금실패 데이터 이동 ({verificationResult.failureCount}건)
                    </button>
                  )}
                </div>

                {/* 상세 결과 테이블 */}
                <div className="space-y-6">
                  {/* 수금성공 데이터 */}
                  {verificationResult.success.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-green-700 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        수금성공 데이터 ({verificationResult.success.length}건)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-green-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">이름</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">증권번호</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">추천인</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">담당자</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">납입금액</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">수금월</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {verificationResult.success.map((item, index) => (
                              <tr key={index} className="hover:bg-green-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.policyNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.referrer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.manager}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.paymentAmount.toLocaleString()}원</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.paymentMonth}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 수금실패 데이터 */}
                  {verificationResult.failure.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-red-700 mb-3 flex items-center">
                        <XCircle className="h-5 w-5 mr-2" />
                        수금실패 데이터 ({verificationResult.failure.length}건)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-red-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">이름</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">증권번호</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">추천인</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">담당자</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">납입금액</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">수금월</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {verificationResult.failure.map((item, index) => (
                              <tr key={index} className="hover:bg-red-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.policyNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.referrer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.manager}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.paymentAmount.toLocaleString()}원</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.paymentMonth}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
