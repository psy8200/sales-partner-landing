'use client';

import React, { useEffect, useState } from 'react';

// 모바일 최적화 훅
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    // 모바일 디바이스 감지
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice);
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
      setViewportHeight(window.innerHeight);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return { isMobile, isTouchDevice, viewportHeight };
};

// 모바일 친화적 버튼 컴포넌트
export const MobileButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  variant = 'primary',
  size = 'md'
}) => {
  const { isMobile, isTouchDevice } = useMobileOptimization();

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100'
  };

  const sizeClasses = {
    sm: isMobile ? 'px-3 py-2 text-sm min-h-[44px]' : 'px-3 py-2 text-sm',
    md: isMobile ? 'px-4 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base',
    lg: isMobile ? 'px-6 py-4 text-lg min-h-[52px]' : 'px-6 py-3 text-lg'
  };

  const touchClasses = isTouchDevice ? 'touch-manipulation select-none' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${touchClasses}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        // 모바일에서 터치 영역 확보
        minWidth: isMobile ? '44px' : 'auto',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
};

// 모바일 친화적 입력 필드 컴포넌트
export const MobileInput: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}> = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  required = false
}) => {
  const { isMobile } = useMobileOptimization();

  const baseClasses = 'w-full border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const mobileClasses = isMobile ? 'px-4 py-3 text-base min-h-[48px]' : 'px-3 py-2 text-sm';

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`
        ${baseClasses}
        ${mobileClasses}
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        ${className}
      `}
      style={{
        fontSize: isMobile ? '16px' : '14px', // iOS 줌 방지
      }}
    />
  );
};

// 모바일 친화적 카드 컴포넌트
export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}> = ({ children, className = '', onClick, interactive = false }) => {
  const { isMobile, isTouchDevice } = useMobileOptimization();

  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-sm';
  const interactiveClasses = interactive ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : '';
  const touchClasses = isTouchDevice && interactive ? 'active:scale-95 transition-transform duration-100' : '';
  const mobileClasses = isMobile ? 'p-4' : 'p-6';

  return (
    <div
      onClick={onClick}
      className={`
        ${baseClasses}
        ${interactiveClasses}
        ${touchClasses}
        ${mobileClasses}
        ${className}
      `}
      style={{
        WebkitTapHighlightColor: interactive ? 'transparent' : 'auto',
      }}
    >
      {children}
    </div>
  );
};

// 모바일 네비게이션 컴포넌트
export const MobileNavigation: React.FC<{
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }>;
  activeItem?: string;
  className?: string;
}> = ({ items, activeItem, className = '' }) => {
  const { isMobile } = useMobileOptimization();

  if (!isMobile) {
    return null; // 데스크톱에서는 표시하지 않음
  }

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 ${className}`}>
      <div className="flex justify-around items-center py-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              flex flex-col items-center justify-center p-2 min-h-[60px] min-w-[60px]
              transition-colors duration-200
              ${activeItem === item.id 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {item.icon && (
              <div className="mb-1">
                {item.icon}
              </div>
            )}
            <span className="text-xs font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// 모바일 스와이프 제스처 훅
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void
) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
    if (isUpSwipe && onSwipeUp) onSwipeUp();
    if (isDownSwipe && onSwipeDown) onSwipeDown();
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

// 모바일 풀스크린 모달 컴포넌트
export const MobileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}> = ({ isOpen, onClose, children, title, className = '' }) => {
  const { isMobile } = useMobileOptimization();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className={`
        relative bg-white rounded-t-lg w-full max-w-md
        ${isMobile ? 'max-h-[90vh]' : 'max-h-[80vh]'}
        ${className}
      `}>
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* 컨텐츠 */}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

