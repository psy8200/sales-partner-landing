'use client';

import React, { useState } from 'react';

export default function LevelIconsPage() {
  const [levelDescriptions, setLevelDescriptions] = useState({
    0: '최초 가입자',
    1: '3명 추천 완료',
    2: '레벨 2 달성',
    3: '레벨 3 달성',
    4: '레벨 4 달성',
    5: '레벨 5 달성',
    6: '레벨 6 달성',
    7: '레벨 7 달성',
    8: '레벨 8 달성',
    9: '레벨 9 달성',
    10: '레벨 10 달성',
    'SP': 'SP 레벨 달성'
  });

  const levelRequirements = {
    0: '0명',
    1: '3명',
    2: '9명',
    3: '27명',
    4: '81명',
    5: '243명',
    6: '729명',
    7: '2,187명',
    8: '6,561명',
    9: '19,683명',
    10: '59,049명',
    'SP': '관리자'
  };

  const [editingLevel, setEditingLevel] = useState<number | 'SP' | null>(null);

  const handleSave = (level: number | 'SP') => {
    localStorage.setItem('levelDescriptions', JSON.stringify(levelDescriptions));
    setEditingLevel(null);
  };

  const handleEdit = (level: number | 'SP') => {
    setEditingLevel(level);
  };

  const handleCancel = () => {
    const saved = localStorage.getItem('levelDescriptions');
    if (saved) {
      setLevelDescriptions(JSON.parse(saved));
    }
    setEditingLevel(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">🏆 승급 아이콘 설정</h1>
            <p className="text-gray-600 mt-2">사용자 레벨별 아이콘 및 설명 관리</p>
          </div>

          <div className="p-6">
            {/* 승급 아이콘 시스템 */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-lg border border-pink-200">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">🏆</div>
                <h2 className="text-xl font-semibold text-pink-900">승급 아이콘 시스템</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                {Object.entries(levelDescriptions).map(([level, description]) => (
                  <div key={level} className="bg-white p-4 rounded-lg border border-pink-200 shadow-sm">
                    <div className="text-center mb-2">
                      <div className="text-2xl mb-1">
                        {level === 'SP' ? '👑' : level === '0' ? '🥚' : level === '1' ? '🐣' : 
                         level === '2' ? '🐤' : level === '3' ? '🐔' : level === '4' ? '🦅' : 
                         level === '5' ? '🦉' : level === '6' ? '🦅' : level === '7' ? '🦅' : 
                         level === '8' ? '🦅' : level === '9' ? '🦅' : '🦅'}
                      </div>
                      <div className="text-sm font-semibold text-gray-700">레벨 {level}</div>
                      <div className="text-xs text-gray-500 mb-2">요구: {levelRequirements[level as keyof typeof levelRequirements]}</div>
                    </div>
                    
                    {editingLevel === level ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setLevelDescriptions(prev => ({
                            ...prev,
                            [level]: e.target.value
                          }))}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          title={`레벨 ${level} 설명을 편집하세요`}
                          placeholder={`레벨 ${level} 설명을 입력하세요`}
                          aria-label={`레벨 ${level} 설명 편집`}
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleSave(level as number | 'SP')}
                            className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            title={`레벨 ${level} 설명 저장`}
                            aria-label={`레벨 ${level} 설명 저장`}
                          >
                            저장
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                            title="편집 취소"
                            aria-label="편집 취소"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-2 min-h-[2rem]">{description}</div>
                        <button
                          onClick={() => handleEdit(level as number | 'SP')}
                          className="px-3 py-1 text-xs bg-pink-500 text-white rounded hover:bg-pink-600"
                          title={`레벨 ${level} 설명 수정`}
                          aria-label={`레벨 ${level} 설명 수정`}
                        >
                          수정
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
