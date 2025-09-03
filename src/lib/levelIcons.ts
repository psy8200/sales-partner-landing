// 레벨 아이콘 중앙 관리 시스템
export interface LevelIconData {
  icon: string;
  color: string;
  name: string;
  description: string;
}

export const LEVEL_ICONS: Record<number | 'SP', LevelIconData> = {
  0: {
    icon: '🥚',
    color: 'text-gray-400',
    name: '알',
    description: '최초 가입자'
  },
  1: {
    icon: '🐣',
    color: 'text-yellow-500',
    name: '병아리',
    description: '3명 추천 완료'
  },
  3: {
    icon: '🐤',
    color: 'text-orange-500',
    name: '작은 병아리',
    description: '레벨 3 달성'
  },
  4: {
    icon: '🦜',
    color: 'text-red-500',
    name: '앵무새',
    description: '레벨 4 달성'
  },
  5: {
    icon: '🦢',
    color: 'text-purple-500',
    name: '백조',
    description: '레벨 5 달성'
  },
  6: {
    icon: '🦚',
    color: 'text-blue-500',
    name: '공작새',
    description: '레벨 6 달성'
  },
  7: {
    icon: '🦅',
    color: 'text-indigo-500',
    name: '독수리',
    description: '레벨 7 달성 (주력)'
  },
  8: {
    icon: '💎',
    color: 'text-pink-500',
    name: '다이아몬드',
    description: '레벨 8 달성'
  },
  9: {
    icon: '⭐',
    color: 'text-green-500',
    name: '빛나는별',
    description: '레벨 9 달성'
  },
  10: {
    icon: '👑',
    color: 'text-emerald-500',
    name: '왕관',
    description: '레벨 10 달성'
  },
  'SP': {
    icon: '🏢',
    color: 'text-yellow-400',
    name: '회사로고',
    description: '관리자'
  }
};

export const getLevelIcon = (level: number | 'SP'): string => {
  return LEVEL_ICONS[level]?.icon || LEVEL_ICONS[0].icon;
};

export const getLevelColor = (level: number | 'SP'): string => {
  return LEVEL_ICONS[level]?.color || LEVEL_ICONS[0].color;
};

export const getLevelName = (level: number | 'SP'): string => {
  return LEVEL_ICONS[level]?.name || LEVEL_ICONS[0].name;
};

export const getLevelDescription = (level: number | 'SP'): string => {
  return LEVEL_ICONS[level]?.description || LEVEL_ICONS[0].description;
};

export const getAllLevels = (): Array<{ level: number | 'SP'; data: LevelIconData }> => {
  return Object.entries(LEVEL_ICONS).map(([level, data]) => ({
    level: level === 'SP' ? 'SP' : parseInt(level),
    data
  }));
};





