// 등급 계산 유틸리티 함수들
import { getLevelIcon, getLevelName } from './levelIcons';

// 3의 거듭제곱 기준 등급 요구사항
const LEVEL_REQUIREMENTS = [3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049];

/**
 * 총 추천인 수를 기반으로 현재 등급을 계산
 * @param totalReferrals 총 추천인 수
 * @returns 현재 등급 (0-10)
 */
export const calculateLevel = (totalReferrals: number): number => {
  if (totalReferrals >= 59049) return 10;
  if (totalReferrals >= 19683) return 9;
  if (totalReferrals >= 6561) return 8;
  if (totalReferrals >= 2187) return 7;
  if (totalReferrals >= 729) return 6;
  if (totalReferrals >= 243) return 5;
  if (totalReferrals >= 81) return 4;
  if (totalReferrals >= 27) return 3;
  if (totalReferrals >= 9) return 2;
  if (totalReferrals >= 3) return 1;
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

