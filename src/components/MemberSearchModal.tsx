'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Phone } from 'lucide-react';


interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
  addressDetail?: string;
}

interface MemberSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (member: Member) => void;
}

const MemberSearchModal: React.FC<MemberSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneSearch, setShowPhoneSearch] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // 디바운싱을 위한 타이머
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 회원 검색 함수
  const searchMembers = async (query: string, phone?: string) => {
    console.log('🔍 회원 검색 시작:', { query, phone });
    
    if (!query.trim()) {
      console.log('❌ 검색어가 비어있음');
      setMembers([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('q', query.trim());
      if (phone && phone.trim()) {
        params.append('phone', phone.trim());
      }

      const searchUrl = `/api/admin/members/search?${params.toString()}`;
      console.log('🌐 API 호출:', searchUrl);

      const response = await fetch(searchUrl);
      console.log('📡 응답 상태:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error('검색 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      console.log('📦 응답 데이터:', data);
      setMembers(data.members || []);
      setTotalResults(data.total || 0);
      
      // 결과가 20개를 초과하면 전화번호 검색 안내 표시
      if (data.total > 20 && !phone) {
        setShowPhoneSearch(true);
      } else {
        setShowPhoneSearch(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
      setMembers([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 변경 시 디바운싱 적용
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      searchMembers(searchTerm, phoneSearch);
    }, 300); // 300ms 디바운싱

    setDebounceTimer(timer);

    // cleanup 함수
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, phoneSearch]); // debounceTimer 제거

  // 모달 닫기 시 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setPhoneSearch('');
      setMembers([]);
      setSelectedMemberId(null);
      setError(null);
      setShowPhoneSearch(false);
      setTotalResults(0);
    }
  }, [isOpen]);

  // 회원 선택
  const handleMemberSelect = (member: Member) => {
    setSelectedMemberId(member.id);
  };

  // 선택 확인
  const handleConfirm = () => {
    if (selectedMemberId) {
      const selectedMember = members.find(member => member.id === selectedMemberId);
      if (selectedMember) {
        onSelect(selectedMember);
        onClose();
      }
    }
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

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

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">회원 검색</h2>
                <p className="text-sm text-gray-600 mt-1">이름으로 회원을 검색하고 선택하세요</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="닫기"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 검색 입력 */}
            <div className="p-6 border-b border-gray-200">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="회원 이름을 입력하세요..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                
                {/* 전화번호 추가 검색 */}
                {showPhoneSearch && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      placeholder="전화번호를 입력하여 정확한 검색 (예: 010-1234-5678)"
                      className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    />
                    <div className="text-xs text-blue-600 mt-1">
                      💡 {totalResults}명의 결과가 있습니다. 전화번호를 입력하여 정확한 회원을 찾으세요.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 검색 결과 */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {loading && (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">검색 중...</p>
                </div>
              )}

              {error && (
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && members.length === 0 && searchTerm && (
                <div className="p-6 text-center">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">검색 결과가 없습니다.</p>
                  <p className="text-sm text-gray-500 mt-1">다른 이름으로 검색해보세요.</p>
                </div>
              )}

              {!loading && !error && members.length > 0 && (
                <div className="p-6">
                  <div className="space-y-2">
                    {members.map((member, idx) => (
                      <div
                        key={`member-${idx}-${member.id || 'default'}`}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedMemberId === member.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleMemberSelect(member)}
                      >
                                                 <input
                           type="radio"
                           name="selectedMember"
                           checked={selectedMemberId === member.id}
                           onChange={() => handleMemberSelect(member)}
                           className="mr-3 text-blue-600 focus:ring-blue-500"
                           title={`${member.name} 선택`}
                         />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{member.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{member.phone}</span>
                          </div>
                          {member.address && (
                            <div className="text-xs text-gray-500 mt-1">
                              {member.address} {member.addressDetail}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedMemberId}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedMemberId
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                선택
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MemberSearchModal;
