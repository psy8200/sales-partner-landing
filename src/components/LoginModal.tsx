'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
  onRetry: () => void;
  message: string;
  type: 'error' | 'notfound' | 'success';
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSignup, 
  onRetry, 
  message, 
  type 
}: LoginModalProps) {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case 'notfound':
        return {
          icon: '🔍',
          title: '회원정보를 찾을 수 없어요',
          message: '입력하신 전화번호로 등록된 계정이 없습니다.',
          primaryButton: '회원가입하기',
          secondaryButton: '다시 시도',
          primaryAction: onSignup,
          secondaryAction: onRetry,
          primaryColor: 'bg-blue-600 hover:bg-blue-700',
          secondaryColor: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        };
      case 'error':
        return {
          icon: '⚠️',
          title: '로그인에 실패했어요',
          message: message,
          primaryButton: '다시 시도',
          secondaryButton: '회원가입',
          primaryAction: onRetry,
          secondaryAction: onSignup,
          primaryColor: 'bg-orange-600 hover:bg-orange-700',
          secondaryColor: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        };
      case 'success':
        return {
          icon: '🎉',
          title: '로그인 성공!',
          message: message,
          primaryButton: '확인',
          secondaryButton: null,
          primaryAction: onClose,
          secondaryAction: null,
          primaryColor: 'bg-green-600 hover:bg-green-700',
          secondaryColor: ''
        };
      default:
        return {
          icon: '❓',
          title: '알 수 없는 오류',
          message: message,
          primaryButton: '확인',
          secondaryButton: null,
          primaryAction: onClose,
          secondaryAction: null,
          primaryColor: 'bg-gray-600 hover:bg-gray-700',
          secondaryColor: ''
        };
    }
  };

  const content = getModalContent();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모달 헤더 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-center">
              <span className="text-4xl mb-2">{content.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center">
              {content.title}
            </h3>
          </div>

          {/* 모달 내용 */}
          <div className="px-6 py-6">
            <p className="text-gray-600 text-center leading-relaxed mb-6">
              {content.message}
            </p>

            {/* 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={content.primaryAction}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${content.primaryColor}`}
              >
                {content.primaryButton}
              </button>
              
              {content.secondaryButton && content.secondaryAction && (
                <button
                  onClick={content.secondaryAction}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${content.secondaryColor}`}
                >
                  {content.secondaryButton}
                </button>
              )}
            </div>
          </div>

          {/* 닫기 버튼 */}
          <div className="px-6 pb-4">
            <button
              onClick={onClose}
              className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}





