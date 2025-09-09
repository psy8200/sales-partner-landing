'use client'

import { useState, useEffect } from 'react'

interface PartnerOnlyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PartnerOnlyModal({ isOpen, onClose }: PartnerOnlyModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* 헤더 */}
        <div className="relative p-6 pb-4">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="닫기"
            aria-label="모달 닫기"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* 제목 */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            🔒 파트너회원 전용
          </h3>
          
          {/* 설명 */}
          <p className="text-gray-600 text-center leading-relaxed">
            이 기능은 파트너회원만 이용할 수 있습니다.<br/>
            <span className="font-semibold text-blue-600">파트너회원으로 전환</span>하시면<br/>
            더 많은 혜택을 받으실 수 있습니다! ✨
          </p>
        </div>

        {/* 푸터 */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            확인
          </button>
          
          {/* 추가 정보 */}
          <p className="text-xs text-gray-500 text-center mt-3">
            💡 파트너회원 신청은 마이페이지에서 가능합니다
          </p>
        </div>
      </div>
    </div>
  )
}
