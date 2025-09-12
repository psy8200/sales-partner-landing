// 등급 계산 유틸리티 함수들
import { getLevelIcon, getLevelName } from './levelIcons';

// 새로운 승급 기준 (1, 4, 10, 28, 82, 244, 730, 2188, 6562, 19684, 59050)
const LEVEL_REQUIREMENTS = [1, 4, 10, 28, 82, 244, 730, 2188, 6562, 19684, 59050];

/**
 * 총 추천인 수를 기반으로 현재 등급을 계산
 * @param totalReferrals 총 추천인 수
 * @returns 현재 등급 (0-10, 'LEGEND')
 */
export const calculateLevel = (totalReferrals: number): number | 'LEGEND' => {
  if (totalReferrals >= 59050) return 'LEGEND';
  if (totalReferrals >= 19684) return 10;
  if (totalReferrals >= 6562) return 9;
  if (totalReferrals >= 2188) return 8;
  if (totalReferrals >= 730) return 7;
  if (totalReferrals >= 244) return 6;
  if (totalReferrals >= 82) return 5;
  if (totalReferrals >= 28) return 4;
  if (totalReferrals >= 10) return 3;
  if (totalReferrals >= 4) return 2;
  if (totalReferrals >= 1) return 1;
  return 0;
};

/**
 * 현재 등급에서 다음 등급까지 필요한 추천인 수를 계산
 * @param currentLevel 현재 등급
 * @returns 다음 등급까지 필요한 추천인 수
 */
export const getNextLevelRequirement = (currentLevel: number): number => {
  if (currentLevel >= 10) return 0; // 최고 등급
  return LEVEL_REQUIREMENTS[currentLevel] || 0;
};

/**
 * 다음 등급까지 남은 추천인 수를 계산
 * @param currentLevel 현재 등급
 * @param totalReferrals 총 추천인 수
 * @returns 다음 등급까지 남은 추천인 수
 */
export const getRemainingReferrals = (currentLevel: number, totalReferrals: number): number => {
  const nextRequirement = getNextLevelRequirement(currentLevel);
  const remaining = nextRequirement - totalReferrals;
  return Math.max(0, remaining);
};

/**
 * 사용자의 등급 정보를 계산하여 반환
 * @param totalReferrals 총 추천인 수
 * @returns 등급 정보 객체
 */
export const getUserLevelInfo = (totalReferrals: number) => {
  const currentLevel = calculateLevel(totalReferrals);
  const nextRequirement = getNextLevelRequirement(currentLevel);
  const remaining = getRemainingReferrals(currentLevel, totalReferrals);
  
  return {
    currentLevel,
    totalReferrals,
    nextLevelRequirement: nextRequirement,
    remainingReferrals: remaining,
    levelIcon: getLevelIcon(currentLevel),
    levelName: getLevelName(currentLevel),
    isMaxLevel: currentLevel === 10
  };
};

/**
 * 이번 달 추천인 수를 계산 (현재 월 기준)
 * @param referrals 추천인 목록
 * @returns 이번 달 추천인 수
 */
interface Referral {
  createdAt: string | Date;
}

export const calculateMonthlyReferrals = (referrals: Referral[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return referrals.filter(referral => {
    const referralDate = new Date(referral.createdAt);
    return referralDate.getMonth() === currentMonth && 
           referralDate.getFullYear() === currentYear;
  }).length;
};

