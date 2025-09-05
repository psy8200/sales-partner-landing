'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BackupInfo {
  manual: {
    status: string;
    lastBackup?: string;
    backupDate?: string;
    backupCount?: number;
    totalSize?: number;
    backupData?: {
      users: number;
      contracts: number;
      items: number;
      partnerApplications: number;
      activityLogs: number;
    };
    message?: string;
  };
  git: {
    status: string;
    currentBranch?: string;
    lastCommit?: string;
    modifiedFiles?: number;
    untrackedFiles?: number;
    totalChanges?: number;
    message?: string;
  };
  github: {
    status: string;
    remoteUrl?: string;
    isUpToDate?: boolean;
    hasUnpushedCommits?: boolean;
    hasUnpulledCommits?: boolean;
    lastPushTime?: string;
    syncStatus?: string;
    message?: string;
  };
}

export default function DevGuidePage() {
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackupInfo();
  }, []);

  const fetchBackupInfo = async () => {
    try {
      const response = await fetch('/api/admin/backup-info');
      const data = await response.json();
      setBackupInfo(data);
    } catch (error) {
      console.error('백업 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">🔧 개발 가이드</h1>
            <p className="text-gray-600 mt-2">현재까지 개발된 시스템의 전체적인 개요 및 기술 문서</p>

          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* 시스템 개요 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">📋</div>
                  <h2 className="text-xl font-semibold text-blue-900">시스템 개요</h2>
                </div>
                <div className="space-y-3 text-sm text-blue-800">
                  <div>• <strong>기술 스택:</strong> Next.js 15.4.3 + React + TypeScript</div>
                  <div>• <strong>데이터베이스:</strong> SQLite + Prisma ORM</div>
                  <div>• <strong>스타일링:</strong> Tailwind CSS</div>
                  <div>• <strong>인증:</strong> Custom Session Management</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    자세히 보기 →
                  </Link>
                </div>
              </div>

              {/* 주요 기능 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">⚙️</div>
                  <h2 className="text-xl font-semibold text-green-900">주요 기능</h2>
                </div>
                <div className="space-y-3 text-sm text-green-800">
                  <div>• <strong>회원 관리:</strong> 일반/파트너/관리자 분리</div>
                  <div>• <strong>파트너 신청:</strong> 상담신청 및 승인 시스템</div>
                  <div>• <strong>포인트 시스템:</strong> 적립 및 사용 관리</div>
                  <div>• <strong>관리자 대시보드:</strong> 통계 및 관리 기능</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    자세히 보기 →
                  </Link>
                </div>
              </div>

              {/* 데이터베이스 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🗄️</div>
                  <h2 className="text-xl font-semibold text-purple-900">데이터베이스</h2>
                </div>
                <div className="space-y-3 text-sm text-purple-800">
                  <div>• <strong>User:</strong> 회원 정보 및 권한 관리</div>
                  <div>• <strong>PartnerApplication:</strong> 파트너 신청 관리</div>
                  <div>• <strong>CompanyInfo:</strong> 회사 정보 관리</div>
                  <div>• <strong>ActivityLog:</strong> 활동 로그 관리</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                  >
                    스키마 보기 →
                  </Link>
                </div>
              </div>

              {/* API 엔드포인트 */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🔌</div>
                  <h2 className="text-xl font-semibold text-orange-900">API 엔드포인트</h2>
                </div>
                <div className="space-y-3 text-sm text-orange-800">
                  <div>• <strong>인증:</strong> 로그인/로그아웃/세션 관리</div>
                  <div>• <strong>회원:</strong> CRUD 작업 및 권한 관리</div>
                  <div>• <strong>파트너:</strong> 신청 및 승인 처리</div>
                  <div>• <strong>관리자:</strong> 대시보드 및 통계</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                  >
                    API 문서 →
                  </Link>
                </div>
              </div>

              {/* 최근 업데이트 */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🆕</div>
                  <h2 className="text-xl font-semibold text-red-900">최근 업데이트</h2>
                </div>
                <div className="space-y-3 text-sm text-red-800">
                  <div>• <strong>파트너 승인:</strong> 시스템 완성</div>
                  <div>• <strong>인증 개선:</strong> adminSession 통일</div>
                  <div>• <strong>스키마 안정화:</strong> 필드 추가 완료</div>
                  <div>• <strong>하드코딩 제거:</strong> 동적 데이터 관리</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    변경사항 →
                  </Link>
                </div>
              </div>

              {/* 개발 환경 */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">⚙️</div>
                  <h2 className="text-xl font-semibold text-gray-900">개발 환경</h2>
                </div>
                <div className="space-y-3 text-sm text-gray-800">
                  <div>• <strong>설치:</strong> npm install</div>
                  <div>• <strong>데이터베이스:</strong> npx prisma db push</div>
                  <div>• <strong>실행:</strong> npm run dev</div>
                  <div>• <strong>문제해결:</strong> taskkill /f /im node.exe</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    설정 가이드 →
                  </Link>
                </div>
              </div>
            </div>

            {/* 백업 정보 섹션 */}
            <div className="mt-8">
              <div className="flex items-center mb-6">
                <div className="text-2xl mr-3">💾</div>
                <h2 className="text-2xl font-semibold text-gray-900">백업 시스템 현황</h2>
                <button 
                  onClick={fetchBackupInfo}
                  className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  새로고침
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 수동 백업 정보 */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="text-lg mr-2">📁</div>
                    <h3 className="text-lg font-semibold text-blue-900">수동 백업</h3>
                  </div>
                  {loading ? (
                    <div className="text-sm text-blue-700">로딩 중...</div>
                  ) : backupInfo?.manual.status === 'success' ? (
                    <div className="space-y-2 text-sm text-blue-800">
                      <div>• <strong>최근 백업:</strong> {backupInfo.manual.lastBackup}</div>
                      <div>• <strong>백업 일시:</strong> {backupInfo.manual.backupDate ? new Date(backupInfo.manual.backupDate).toLocaleString('ko-KR') : 'N/A'}</div>
                      <div>• <strong>백업 개수:</strong> {backupInfo.manual.backupCount}개</div>
                      <div>• <strong>백업 크기:</strong> {backupInfo.manual.totalSize}KB</div>
                      <div>• <strong>백업 상태:</strong> ✅ 완료</div>
                      {backupInfo.manual.backupData && (
                        <div>• <strong>백업 내용:</strong> 사용자 {backupInfo.manual.backupData.users}명, 계약 {backupInfo.manual.backupData.contracts}건, 상품 {backupInfo.manual.backupData.items}개</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      ❌ {backupInfo?.manual.message || '백업 정보를 가져올 수 없습니다.'}
                    </div>
                  )}
                </div>

                {/* Git 백업 정보 */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="text-lg mr-2">🌿</div>
                    <h3 className="text-lg font-semibold text-green-900">Git 백업</h3>
                  </div>
                  {loading ? (
                    <div className="text-sm text-green-700">로딩 중...</div>
                  ) : backupInfo?.git.status === 'success' ? (
                    <div className="space-y-2 text-sm text-green-800">
                      <div>• <strong>현재 브랜치:</strong> {backupInfo.git.currentBranch}</div>
                      <div>• <strong>마지막 커밋:</strong> {backupInfo.git.lastCommit}</div>
                      <div>• <strong>수정된 파일:</strong> {backupInfo.git.modifiedFiles}개</div>
                      <div>• <strong>추적되지 않은 파일:</strong> {backupInfo.git.untrackedFiles}개</div>
                      <div>• <strong>총 변경사항:</strong> {backupInfo.git.totalChanges}개</div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      ❌ {backupInfo?.git.message || 'Git 정보를 가져올 수 없습니다.'}
                    </div>
                  )}
                </div>

                {/* GitHub 백업 정보 */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="text-lg mr-2">☁️</div>
                    <h3 className="text-lg font-semibold text-purple-900">GitHub 백업</h3>
                  </div>
                  {loading ? (
                    <div className="text-sm text-purple-700">로딩 중...</div>
                  ) : backupInfo?.github.status === 'success' ? (
                    <div className="space-y-2 text-sm text-purple-800">
                      <div>• <strong>원격 저장소:</strong> {backupInfo.github.remoteUrl}</div>
                      <div>• <strong>동기화 상태:</strong> {
                        backupInfo.github.syncStatus === 'up_to_date' ? '✅ 최신' :
                        backupInfo.github.syncStatus === 'ahead' ? '⬆️ 앞서감' :
                        backupInfo.github.syncStatus === 'behind' ? '⬇️ 뒤처짐' : '❓ 알 수 없음'
                      }</div>
                      <div>• <strong>마지막 푸시:</strong> {backupInfo.github.lastPushTime || 'N/A'}</div>
                      <div>• <strong>푸시 대기:</strong> {backupInfo.github.hasUnpushedCommits ? '⚠️ 있음' : '✅ 없음'}</div>
                      <div>• <strong>풀 대기:</strong> {backupInfo.github.hasUnpulledCommits ? '⚠️ 있음' : '✅ 없음'}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      ❌ {backupInfo?.github.message || 'GitHub 정보를 가져올 수 없습니다.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
