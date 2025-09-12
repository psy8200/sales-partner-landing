'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DuplicateErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorType: 'email' | 'phone';
}

/**
 * 중복 오류 시 표시되는 모달 컴포넌트
 * 웹과 네이티브에서 동일한 사용자 경험을 제공
 */
export const DuplicateErrorModal: React.FC<DuplicateErrorModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  errorType
}) => {
  const getErrorMessage = () => {
    switch (errorType) {
      case 'email':
        return '이미 등록된 이메일입니다.';
      case 'phone':
        return '이미 등록된 전화번호입니다.';
      default:
        return '중복된 정보가 있습니다.';
    }
  };

  const getFieldName = () => {
    switch (errorType) {
      case 'email':
        return '이메일';
      case 'phone':
        return '전화번호';
      default:
        return '정보';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* 모달 컨텐츠 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 아이콘 */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-red-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
              </div>

              {/* 제목 */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                중복 오류
              </h3>

              {/* 메시지 */}
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                <span className="font-medium text-red-600">{getErrorMessage()}</span>
                <br />
                <span className="text-sm mt-2 block">
                  {getFieldName()}을 정확하게 입력해주세요.
                </span>
              </p>

              {/* 버튼들 */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  취소
                </button>
                <button
                  onClick={onRetry}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  다시 입력하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DuplicateErrorModal;







