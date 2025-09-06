'use client';

import React from 'react';
import styles from './DeviceFrame.module.css';

interface DeviceFrameProps {
  device: {
    width: number;
    height: number;
    frame: string;
    screenWidth: number;
    screenHeight: number;
    notch: boolean;
    homeIndicator: boolean;
  };
  orientation: 'portrait' | 'landscape';
  children: React.ReactNode;
  isTablet?: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  device,
  orientation,
  children,
  isTablet = false,
}) => {
  const frameWidth = orientation === 'landscape' ? device.height : device.width;
  const frameHeight = orientation === 'landscape' ? device.width : device.height;

  return (
    <div 
      className={`relative ${isTablet ? 'scale-75' : 'scale-100'} transition-transform duration-300 ${orientation === 'landscape' ? '[transform:rotate(90deg)]' : '[transform:rotate(0deg)]'}`}
    >
      {/* 디바이스 프레임 */}
      <div 
        className={`${styles.frame} relative bg-gray-800 rounded-3xl shadow-2xl ${isTablet ? 'p-3' : 'p-2'}`}
        ref={(el) => {
          if (el) {
            el.style.setProperty('--frame-width', `${frameWidth}px`);
            el.style.setProperty('--frame-height', `${frameHeight}px`);
          }
        }}
      >
        {/* 노치 (iPhone) */}
        {device.notch && orientation === 'portrait' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>
        )}

        {/* 스크린 */}
        <div 
          className={`${styles.screen} bg-white rounded-2xl overflow-hidden relative`}
        >
          {children}
        </div>

        {/* 홈 인디케이터 (iPhone) */}
        {device.homeIndicator && orientation === 'portrait' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
        )}
      </div>
    </div>
  );
};
