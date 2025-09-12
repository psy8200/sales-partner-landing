'use client';

import React from 'react';
import { getLevelIcon, getLevelColor, getLevelName } from '@/lib/levelIcons';

interface LevelIconProps {
  level: number | 'LEGEND' | 'SP';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LevelIcon: React.FC<LevelIconProps> = ({ level, size = 'md', className = '' }) => {
  const getSizeClass = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-lg';
      case 'lg':
        return 'text-2xl';
      default:
        return 'text-lg';
    }
  };

  // LEGEND는 특별하게 처리
  const getTitle = () => {
    if (level === 'LEGEND') {
      return `LEGEND - ${getLevelName(level)}`;
    }
    return `레벨 ${level} - ${getLevelName(level)}`;
  };

  return (
    <span 
      className={`inline-flex items-center justify-center ${getLevelColor(level)} ${getSizeClass(size)} ${className}`}
      title={getTitle()}
    >
      {getLevelIcon(level)}
    </span>
  );
};

export default LevelIcon;
