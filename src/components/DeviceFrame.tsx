'use client';

import React from 'react';

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
      className={`relative ${isTablet ? 'scale-75' : 'scale-100'} transition-transform duration-300`}
      style={{
        transform: orientation === 'landscape' ? 'rotate(90deg)' : 'rotate(0deg)',
      }}
    >
      {/* 디바이스 프레임 */}
      <div 
        className="relative bg-gray-800 rounded-3xl shadow-2xl"
        style={{
          width: frameWidth,
          height: frameHeight,
          padding: isTablet ? '12px' : '8px',
        }}
      >
        {/* 노치 (iPhone) */}
        {device.notch && orientation === 'portrait' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>
        )}

        {/* 스크린 */}
        <div 
          className="bg-white rounded-2xl overflow-hidden relative"
          style={{
            width: '100%',
            height: '100%',
          }}
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
