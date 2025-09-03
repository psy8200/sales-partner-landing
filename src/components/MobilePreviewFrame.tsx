'use client';

import React from 'react';

interface MobilePreviewFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const MobilePreviewFrame: React.FC<MobilePreviewFrameProps> = ({
  children,
  title = "모바일 미리보기",
  className = ""
}) => {
  return (
    <div className={`mobile-preview-container ${className}`}>
      {/* 모바일 프레임 */}
      <div className="mobile-frame">
        {/* 상단 노치 */}
        <div className="mobile-notch">
          <div className="notch-camera"></div>
        </div>
        
        {/* 모바일 스크린 */}
        <div className="mobile-screen">
          {/* 실제 콘텐츠 */}
          <div className="mobile-content">
            {children}
          </div>
        </div>
        
        {/* 하단 홈 인디케이터 */}
        <div className="mobile-home-indicator"></div>
      </div>
      
      {/* 제목 */}
      <div className="mobile-title">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">400 x 800px</p>
      </div>
    </div>
  );
};

export default MobilePreviewFrame;




