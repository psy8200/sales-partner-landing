// 레벨 아이콘 중앙 관리 시스템
export interface LevelIconData {
  icon: string;
  color: string;
  name: string;
  description: string;
}

export const LEVEL_ICONS: Record<number | 'LEGEND' | 'SP', LevelIconData> = {
  0: {
    icon: '🥚',
    color: 'text-gray-400',
    name: '알',
    description: '최초 가입자 (기본수당만 가능)'
  },
  1: {
    icon: '🐣',
    color: 'text-yellow-500',
    name: '병아리',
    description: '1명 추천 완료 (추천수당 시작)'
  },
  2: {
    icon: '🐤',
    color: 'text-orange-500',
    name: '작은 병아리',
    description: '3명 추천 완료 (트리수당 시작)'
  },
  3: {
    icon: '🦜',
    color: 'text-red-500',
    name: '앵무새',
    description: '9명 추천 완료 (매칭수당 시작)'
  },
  4: {
    icon: '🦢',
    color: 'text-purple-500',
    name: '백조',
    description: '27명 추천 완료'
  },
  5: {
    icon: '🦚',
    color: 'text-blue-500',
    name: '공작새',
    description: '81명 추천 완료'
  },
  6: {
    icon: '🦅',
    color: 'text-indigo-500',
    name: '독수리',
    description: '243명 추천 완료'
  },
  7: {
    icon: '💎',
    color: 'text-pink-500',
    name: '다이아몬드',
    description: '729명 추천 완료'
  },
  8: {
    icon: '⭐',
    color: 'text-green-500',
    name: '빛나는별',
    description: '2,187명 추천 완료'
  },
  9: {
    icon: '👑',
    color: 'text-emerald-500',
    name: '왕관',
    description: '6,561명 추천 완료'
  },
  10: {
    icon: '🏆',
    color: 'text-yellow-400',
    name: '트로피',
    description: '19,683명 추천 완료'
  },
  'LEGEND': {
    icon: '🏢',
    color: 'text-yellow-400',
    name: '레전드',
    description: '59,049명 추천 완료 (부회장 임원)'
  },
  'SP': {
    icon: '🏢',
    color: 'text-yellow-400',
    name: '회사로고',
    description: '관리자'
  }
};

export const getLevelIcon = (level: number | 'LEGEND' | 'SP'): string => {
  return LEVEL_ICONS[level]?.icon || LEVEL_ICONS[0].icon;
};

export const getLevelColor = (level: number | 'LEGEND' | 'SP'): string => {
  return LEVEL_ICONS[level]?.color || LEVEL_ICONS[0].color;
};

export const getLevelName = (level: number | 'LEGEND' | 'SP'): string => {
  return LEVEL_ICONS[level]?.name || LEVEL_ICONS[0].name;
};

export const getLevelDescription = (level: number | 'LEGEND' | 'SP'): string => {
  return LEVEL_ICONS[level]?.description || LEVEL_ICONS[0].description;
};

export const getAllLevels = (): Array<{ level: number | 'LEGEND' | 'SP'; data: LevelIconData }> => {
  return Object.entries(LEVEL_ICONS).map(([level, data]) => ({
    level: level === 'LEGEND' ? 'LEGEND' : level === 'SP' ? 'SP' : parseInt(level),
    data
  }));
};





