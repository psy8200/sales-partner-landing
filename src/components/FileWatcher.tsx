'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Clock,
  GitBranch
} from 'lucide-react';

interface FileChange {
  id: string;
  path: string;
  type: 'added' | 'modified' | 'deleted';
  timestamp: string;
  size?: number;
}

interface GitStatus {
  branch: string;
  status: 'clean' | 'dirty';
  changes: number;
  lastCommit: string;
}

export const FileWatcher: React.FC = () => {
  const [fileChanges, setFileChanges] = useState<FileChange[]>([]);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [isWatching, setIsWatching] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    if (isWatching) {
      const interval = setInterval(() => {
        checkFileChanges();
        checkGitStatus();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isWatching]);

  const checkFileChanges = async () => {
    try {
      const response = await fetch('/api/expo/file-changes');
      if (response.ok) {
        const data = await response.json();
        setFileChanges(data.changes || []);
        setLastUpdate(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('파일 변경 감지 실패:', error);
    }
  };

  const checkGitStatus = async () => {
    try {
      const response = await fetch('/api/expo/git-status');
      if (response.ok) {
        const data = await response.json();
        setGitStatus(data);
      }
    } catch (error) {
      console.error('Git 상태 확인 실패:', error);
    }
  };

  const triggerReload = async () => {
    try {
      await fetch('/api/expo/websocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger-reload' })
      });
    } catch (error) {
      console.error('리로드 트리거 실패:', error);
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'text-green-600 bg-green-50';
      case 'modified':
        return 'text-blue-600 bg-blue-50';
      case 'deleted':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return '➕';
      case 'modified':
        return '✏️';
      case 'deleted':
        return '🗑️';
      default:
        return '📄';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">📁 파일 변경 감지</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsWatching(!isWatching)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              isWatching 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {isWatching ? <Eye className="w-4 h-4 mr-1 inline" /> : <EyeOff className="w-4 h-4 mr-1 inline" />}
            {isWatching ? '감지 중' : '일시정지'}
          </button>
          <button
            onClick={triggerReload}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1 inline" />
            리로드
          </button>
        </div>
      </div>

      {/* Git 상태 */}
      {gitStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">{gitStatus.branch}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                gitStatus.status === 'clean' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {gitStatus.status === 'clean' ? 'Clean' : `${gitStatus.changes} changes`}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              마지막 커밋: {new Date(gitStatus.lastCommit).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* 파일 변경 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">최근 변경된 파일</h3>
          {lastUpdate && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {lastUpdate}
            </div>
          )}
        </div>

        {fileChanges.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {fileChanges.slice(0, 20).map((change) => (
              <div key={change.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getChangeTypeIcon(change.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{change.path}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(change.timestamp).toLocaleString()}
                      {change.size && ` • ${(change.size / 1024).toFixed(1)}KB`}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getChangeTypeColor(change.type)}`}>
                  {change.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p>최근 변경된 파일이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 통계 */}
      {fileChanges.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {fileChanges.filter(c => c.type === 'added').length}
            </div>
            <div className="text-sm text-green-600">추가됨</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {fileChanges.filter(c => c.type === 'modified').length}
            </div>
            <div className="text-sm text-blue-600">수정됨</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {fileChanges.filter(c => c.type === 'deleted').length}
            </div>
            <div className="text-sm text-red-600">삭제됨</div>
          </div>
        </div>
      )}
    </div>
  );
};
