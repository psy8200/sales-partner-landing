'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Download, Database, GitBranch, Github, Calendar, HardDrive, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BackupInfo {
  manual: {
    status: string;
    message: string;
    lastBackup: string | null;
    backupDate: string;
    backupCount: number;
    totalSize: number;
    backupData: {
      users: number;
      contracts: number;
      items: number;
      partnerApplications: number;
      activityLogs: number;
    };
    backupInfo?: {
      backupDate: string;
      backupPath: string;
      sourcePath: string;
      version: string;
      description: string;
    };
  };
  git: {
    status: string;
    currentBranch: string;
    lastCommit: string;
    commitHash: string;
    commitTime: string;
    modifiedFiles: number;
    untrackedFiles: number;
    totalChanges: number;
  };
  github: {
    status: string;
    remoteUrl: string;
    isUpToDate: boolean;
    hasUnpushedCommits: boolean;
    hasUnpulledCommits: boolean;
    lastPushTime: string;
    syncStatus: string;
  };
}

export default function BackupPage() {
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 백업 정보 조회
  const fetchBackupInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/backup-info');
      if (response.ok) {
        const data = await response.json();
        setBackupInfo(data);
        setError(null);
      } else {
        setError('백업 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('백업 정보 조회 실패:', error);
      setError('백업 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 백업 생성
  const createBackup = async () => {
    try {
      setCreatingBackup(true);
      setError(null);
      
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert('백업이 성공적으로 생성되었습니다!');
        // 백업 정보 새로고침
        await fetchBackupInfo();
      } else {
        const errorData = await response.json();
        setError(errorData.error || '백업 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('백업 생성 실패:', error);
      setError('백업 생성 중 오류가 발생했습니다.');
    } finally {
      setCreatingBackup(false);
    }
  };

  useEffect(() => {
    fetchBackupInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">백업 정보를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">백업 관리</h1>
          <p className="text-gray-600">시스템 백업 및 복원을 관리합니다.</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 백업 생성 버튼 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">백업 생성</h2>
                <p className="text-gray-600">현재 시스템 상태를 백업합니다. 기존 백업은 덮어씌워집니다.</p>
              </div>
              <button
                onClick={createBackup}
                disabled={creatingBackup}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingBackup ? (
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Download className="h-5 w-5 mr-2" />
                )}
                {creatingBackup ? '백업 생성 중...' : '백업 생성'}
              </button>
            </div>
          </div>
        </div>

        {/* 백업 정보 */}
        {backupInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 수동 백업 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">수동 백업</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">상태:</span>
                  <span className={`text-sm font-medium ${
                    backupInfo.manual.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {backupInfo.manual.status === 'success' ? '백업 완료' : '백업 없음'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">경로:</span>
                  <span className="text-sm font-mono text-gray-800">backup-latest</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">생성일:</span>
                  <span className="text-sm text-gray-800">{backupInfo.manual.backupDate}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">크기:</span>
                  <span className="text-sm text-gray-800">{backupInfo.manual.totalSize} GB</span>
                </div>
                
                {backupInfo.manual.backupInfo && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">백업 정보:</div>
                    <div className="text-xs text-gray-800">
                      <div>버전: {backupInfo.manual.backupInfo.version}</div>
                      <div>설명: {backupInfo.manual.backupInfo.description}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Git 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <GitBranch className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Git 정보</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">브랜치:</span>
                  <span className="text-sm font-mono text-gray-800">{backupInfo.git.currentBranch}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">커밋:</span>
                  <span className="text-sm font-mono text-gray-800">{backupInfo.git.commitHash}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">시간:</span>
                  <span className="text-sm text-gray-800">{backupInfo.git.commitTime}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">변경:</span>
                  <span className="text-sm text-gray-800">
                    {backupInfo.git.modifiedFiles} 수정, {backupInfo.git.untrackedFiles} 신규
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Github className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">GitHub 정보</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">상태:</span>
                  <span className={`text-sm font-medium ${
                    backupInfo.github.isUpToDate ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {backupInfo.github.isUpToDate ? '동기화됨' : '동기화 필요'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">푸시:</span>
                  <span className="text-sm text-gray-800">{backupInfo.github.lastPushTime}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-20">URL:</span>
                  <span className="text-sm font-mono text-gray-800 truncate">
                    {backupInfo.github.remoteUrl}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 새로고침 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchBackupInfo}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            정보 새로고침
          </button>
        </div>
      </div>
    </div>
  );
}

