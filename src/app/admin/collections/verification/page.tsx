'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, RefreshCcw, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Contract {
  id: string;
  contractNumber: string;
  customerName: string;
  customerPhone: string;
  contractAmount: number;
  finalPoints: number;
  status: string;
  confirmedAt: string;
  dynamicFields?: string;
}

interface ExcelData {
  customerName: string;
  customerPhone: string;
  contractNumber: string;
  amount: number;
}

interface VerificationResult {
  contractId: string;
  contractNumber: string;
  customerName: string;
  customerPhone: string;
  status: 'success' | 'failure';
  reason?: string;
}

export default function VerificationPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // 수금관리계약 데이터 조회
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '1000',
        search: '',
        status: 'COLLECTION'
      });

      const response = await fetch(`/api/admin/collections/collection-contracts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts);
        console.log(`📋 수금관리계약 조회 완료: ${data.contracts.length}건`);
      }
    } catch (error) {
      console.error('수금관리계약 조회 오류:', error);
      alert('수금관리계약 데이터 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // 예시 엑셀 파일 다운로드
  const handleDownloadExample = (e: React.MouseEvent) => {
    // 이벤트 전파 방지
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔥 예시다운로드 버튼 클릭됨!');
    
    try {
      // 예시 데이터 생성 (실제 검증 방식에 맞는 형식)
      const exampleData = [
        ['이름', '전화번호', '증권번호', '금액'],
        ['홍길동', '01055551111', 'smart20250858', 180000],
        ['김철수', '01012345678', 'ins20250901', 250000],
        ['이영희', '01098765432', 'tel20250902', 150000],
        ['박민수', '01055551234', 'rent20250903', 300000]
      ];

      console.log('📊 예시 데이터 생성 완료:', exampleData);

      // Excel 워크북 생성
      const wb = XLSX.utils.book_new();
      
      // 워크시트 생성
      const ws = XLSX.utils.aoa_to_sheet(exampleData);
      
      // 전화번호 컬럼을 텍스트로 설정 (앞자리 0 보존)
      const phoneColumnRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = phoneColumnRange.s.r + 1; row <= phoneColumnRange.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 }); // B열 (전화번호)
        if (ws[cellAddress]) {
          ws[cellAddress].z = '@'; // 텍스트 형식으로 설정
        }
      }
      
      // 워크시트를 워크북에 추가
      XLSX.utils.book_append_sheet(wb, ws, '수금검증예시');
      
      // Excel 파일 생성
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      console.log('📄 Excel 파일 생성 완료');
      
      // 다운로드 링크 생성
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', '수금검증_예시파일.xlsx');
      link.style.visibility = 'hidden';
      link.style.position = 'absolute';
      link.style.top = '-1000px';
      document.body.appendChild(link);
      
      console.log('🔗 다운로드 링크 생성 완료');
      
      // 다운로드 실행
      link.click();
      
      // 정리
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('📥 예시 엑셀 파일 다운로드 완료');
      alert('예시 파일이 다운로드되었습니다!');
      
    } catch (error) {
      console.error('❌ 예시 파일 다운로드 오류:', error);
      alert('예시 파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 드래그 앤 드롭 이벤트 핸들러들
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        handleFileUploadFromFile(droppedFile);
      } else {
        alert('엑셀 파일(.xlsx, .xls) 또는 CSV 파일(.csv)만 업로드 가능합니다.');
      }
    }
  };

  // 업로드된 파일 삭제
  const handleRemoveFile = () => {
    setFile(null);
    setExcelData([]);
    setVerificationResults([]);
    
    // 파일 입력 필드 초기화
    const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    console.log('🗑️ 업로드된 파일 삭제 완료');
  };

  // 파일 업로드 처리 (공통 함수)
  const handleFileUploadFromFile = async (uploadedFile: File) => {
    setFile(uploadedFile);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/admin/collections/verification/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExcelData(data.data);
        console.log(`📊 엑셀 데이터 업로드 완료: ${data.data.length}건`);
      } else {
        const errorData = await response.json();
        alert(`엑셀 파일 업로드 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  // 엑셀 파일 업로드 처리 (기존 함수)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    handleFileUploadFromFile(uploadedFile);
  };

  // 수금 검증 실행 (이름 + 전화번호 + 증권번호 매칭)
  const handleVerification = useCallback(async () => {
    if (contracts.length === 0 || excelData.length === 0) {
      alert('수금관리계약 데이터와 엑셀 데이터가 모두 필요합니다.');
      return;
    }

    setProcessing(true);
    const results: VerificationResult[] = [];

    console.log('🔍 수금 검증 시작...');

        contracts.forEach(contract => {
          // dynamicFields에서 증권번호 추출
          let policyNumber = '';
          if (contract.dynamicFields) {
            try {
              const fields = JSON.parse(contract.dynamicFields);
              policyNumber = fields.policyNumber || '';
            } catch {
              policyNumber = '';
            }
          }

          // 이름 + 전화번호 + 증권번호로 완전 매칭
          const matchedExcelRow = excelData.find(excel =>
            excel.customerName.trim() === contract.customerName.trim() &&
            excel.customerPhone.trim() === contract.customerPhone.trim() &&
            excel.contractNumber.trim() === policyNumber.trim()
          );

      if (matchedExcelRow) {
        results.push({
          contractId: contract.id,
          contractNumber: policyNumber || contract.contractNumber,
          customerName: contract.customerName,
          customerPhone: contract.customerPhone,
          status: 'success'
        });
        console.log(`✅ 매칭 성공: ${contract.customerName} (${contract.contractNumber})`);
      } else {
        results.push({
          contractId: contract.id,
          contractNumber: policyNumber || contract.contractNumber,
          customerName: contract.customerName,
          customerPhone: contract.customerPhone,
          status: 'failure',
          reason: '엑셀 데이터에서 이름+전화번호+증권번호가 일치하는 데이터를 찾을 수 없음'
        });
        console.log(`❌ 매칭 실패: ${contract.customerName} (${contract.contractNumber})`);
      }
    });

    setVerificationResults(results);
    setProcessing(false);
    
    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status === 'failure').length;
    console.log(`🎯 검증 완료 - 성공: ${successCount}건, 실패: ${failureCount}건`);
  }, [contracts, excelData]);

  // 검증 결과 처리 (수금완료/실패 이동)
  const handleProcessResults = async () => {
    if (verificationResults.length === 0) {
      alert('검증 결과가 없습니다.');
      return;
    }

    const successIds = verificationResults
      .filter(result => result.status === 'success')
      .map(result => result.contractId);

    const failureCount = verificationResults.filter(r => r.status === 'failure').length;

    if (successIds.length === 0) {
      alert(`검증 결과: 성공 0건, 실패 ${failureCount}건\n성공한 계약이 없어 처리할 내용이 없습니다.`);
      return;
    }

    const confirmMessage = `검증 결과를 처리하시겠습니까?\n\n성공: ${successIds.length}건 → 수금완료된계약으로 이동\n실패: ${failureCount}건 → 수금관리계약에 잔류\n\n처리 후에는 되돌릴 수 없습니다.`;
    
    // confirm() 대신 alert() 사용하여 클릭 문제 해결
    alert(confirmMessage);

    try {
      setProcessing(true);
      console.log('🚀 검증 결과 처리 시작...');

      // 성공한 계약들을 수금완료된계약으로 이동
      const promises = successIds.map(id =>
        fetch(`/api/admin/contracts/${id}/confirm-collection`, {
          method: 'POST',
        })
      );

      await Promise.all(promises);
      console.log(`✅ ${successIds.length}건의 계약을 수금완료된계약으로 이동 완료`);

      alert(`검증 결과 처리 완료!\n\n성공: ${successIds.length}건 → 수금완료된계약으로 이동\n실패: ${failureCount}건 → 수금관리계약에 잔류`);
      
            // 페이지 초기화
            handleRemoveFile(); // 파일 삭제 함수 사용

            fetchContracts(); // 수금관리계약 데이터 새로고침
      
    } catch (error) {
      console.error('검증 결과 처리 오류:', error);
      alert('검증 결과 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">수금검증하기</h1>
          <p className="text-gray-600 mt-2">
            <span className="font-medium">매칭 조건:</span> 이름 + 전화번호 + 증권번호 모두 일치
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <span className="text-green-600 font-medium">일치 →</span> 수금완료 (수금완료된계약으로 이동) | 
            <span className="text-red-600 font-medium ml-2">불일치 →</span> 수금실패 (수금관리계약에 잔류)
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* 박스 1: 수금관리계약 데이터 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    수금관리계약 데이터
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">총 {contracts.length}건의 수금 대상 계약</p>
                </div>
                <button
                  onClick={fetchContracts}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="새로고침"
                >
                  <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">데이터 로딩 중...</p>
                  </div>
                ) : contracts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">수금관리계약 데이터가 없습니다.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                      {/* 테이블 헤더 */}
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                            이름
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                            연락처
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                            증권번호
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                            계약금액
                          </th>
                        </tr>
                      </thead>
                      {/* 테이블 바디 */}
                      <tbody>
                        {contracts.map((contract) => (
                          <tr key={contract.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                              {contract.customerName}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                              {contract.customerPhone}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                              {contract.dynamicFields ? 
                                (() => {
                                  try {
                                    const fields = JSON.parse(contract.dynamicFields);
                                    return fields.policyNumber || '증권번호 없음';
                                  } catch {
                                    return '증권번호 없음';
                                  }
                                })() 
                                : '증권번호 없음'
                              }
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium">
                              {contract.contractAmount.toLocaleString()}원
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 박스 2: 엑셀 파일 업로드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    엑셀 데이터 업로드
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    컬럼 순서: <span className="font-medium">이름 | 전화번호 | 증권번호 | 금액</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 <span className="font-medium">예시:</span> 홍길동 | 01055551111 | smart20250858 | 180000
                  </p>
                </div>
                <div
                  onClick={handleDownloadExample}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ 마우스 다운 이벤트 발생!');
                    handleDownloadExample(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👆 터치 시작 이벤트 발생!');
                    handleDownloadExample(e);
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('👆 포인터 다운 이벤트 발생!');
                    handleDownloadExample(e);
                  }}
                  className="relative cursor-pointer select-none [z-index:9999] [pointer-events:auto] [touch-action:manipulation] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  title="검증에 필요한 형식의 예시 파일을 다운로드합니다"
                >
                  <Download className="h-4 w-4" />
                  예시 다운로드
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* 파일 업로드 영역 */}
              <div className="mb-4">
                <label htmlFor="excel-upload" className="block">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className={`${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
                      {isDragOver ? '파일을 놓으세요' : '엑셀 또는 CSV 파일을 선택하거나 드래그하세요'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">(.xlsx, .xls, .csv 파일 지원)</p>
                    <p className="text-xs text-gray-400 mt-1">💡 잘못 업로드한 경우 파일명 옆 X 버튼으로 삭제 후 다시 업로드하세요</p>
                  </div>
                        <input
                          id="excel-upload"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                </label>
                {file && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">{file.name}</span>
                        <span className="text-xs text-green-600">업로드 완료</span>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="파일 삭제"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {excelData.length}건의 데이터가 로드되었습니다
                    </p>
                  </div>
                )}
              </div>

              {/* 업로드된 엑셀 데이터 미리보기 */}
              <div className="max-h-64 overflow-y-auto">
                {excelData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">엑셀 파일을 업로드해주세요.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">업로드된 데이터 ({excelData.length}건)</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        {/* 테이블 헤더 */}
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                              이름
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                              연락처
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                              증권번호
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                              금액
                            </th>
                          </tr>
                        </thead>
                        {/* 테이블 바디 */}
                        <tbody>
                          {excelData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                {item.customerName}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                                {item.customerPhone}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                                {item.contractNumber}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium">
                                {item.amount.toLocaleString()}원
                              </td>
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
          </div>

        {/* 검증 실행 버튼 */}
        <div className="text-center mb-6">
          <button
            onClick={handleVerification}
            disabled={contracts.length === 0 || excelData.length === 0 || processing}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                검증 중...
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5" />
                수금 검증 실행
              </>
            )}
          </button>
        </div>

        {/* 검증 결과 */}
        {verificationResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">검증 결과</h2>
                  <div className="flex gap-4 mt-2">
                    <p className="text-sm text-green-600">
                      <span className="font-medium">성공:</span> {verificationResults.filter(r => r.status === 'success').length}건
                    </p>
                    <p className="text-sm text-red-600">
                      <span className="font-medium">실패:</span> {verificationResults.filter(r => r.status === 'failure').length}건
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleProcessResults}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      처리 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      결과 처리하기
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {verificationResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    result.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{result.customerName}</p>
                          <p className="text-sm text-gray-600">{result.contractNumber} | {result.customerPhone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          result.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.status === 'success' ? '수금완료' : '수금실패'}
                        </p>
                        {result.reason && (
                          <p className="text-sm text-red-600 mt-1 max-w-xs break-words">{result.reason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
