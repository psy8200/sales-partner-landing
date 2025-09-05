import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { AppBar } from '../../components/common/AppBar';
import { SummaryCard } from '../../components/business/SummaryCard';
import { QuickActions } from '../../components/business/QuickActions';
import { InfoCards } from '../../components/business/InfoCards';
import { RecentActivity } from '../../components/business/RecentActivity';
import { lightTheme } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { apiClient } from '../../services/api/client';
import { StatsData, ActivityItem, QuickAction, InfoCard } from '../../types';

export const HomeScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // API 호출 훅
  const { execute: fetchStats, loading: statsLoading } = useApi<StatsData>(
    () => apiClient.get('/mypage/stats')
  );
  
  const { execute: fetchActivities, loading: activitiesLoading } = useApi<ActivityItem[]>(
    () => apiClient.get('/mypage/activities')
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 통계 데이터 로드
      const statsResponse = await fetchStats();
      if (statsResponse) {
        setStatsData(statsResponse);
      }

      // 활동 내역 로드
      const activitiesResponse = await fetchActivities();
      if (activitiesResponse) {
        setActivities(activitiesResponse);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), refreshUser()]);
    setRefreshing(false);
  };

  const handleChargePress = () => {
    Alert.alert('충전', '충전 기능을 준비 중입니다.');
  };

  const handleTransferPress = () => {
    Alert.alert('이체', '이체 기능을 준비 중입니다.');
  };

  const handleActivityPress = (activity: ActivityItem) => {
    Alert.alert('활동 상세', `${activity.title} - ${activity.subtitle}`);
  };

  const handleViewAllActivities = () => {
    Alert.alert('전체 활동', '전체 활동 내역을 준비 중입니다.');
  };

  // 빠른 액션 데이터
  const quickActions: QuickAction[] = [
    {
      id: 'settlement',
      title: '정산',
      icon: 'account-balance-wallet',
      color: lightTheme.colors.primary,
      onPress: () => Alert.alert('정산', '정산 기능을 준비 중입니다.'),
    },
    {
      id: 'history',
      title: '내역',
      icon: 'history',
      color: lightTheme.colors.secondary,
      onPress: () => Alert.alert('내역', '내역 기능을 준비 중입니다.'),
    },
    {
      id: 'account',
      title: '계좌',
      icon: 'account-balance',
      color: lightTheme.colors.success,
      onPress: () => Alert.alert('계좌', '계좌 기능을 준비 중입니다.'),
    },
    {
      id: 'security',
      title: '보안',
      icon: 'security',
      color: lightTheme.colors.warning,
      onPress: () => Alert.alert('보안', '보안 기능을 준비 중입니다.'),
    },
    {
      id: 'partner',
      title: '파트너',
      icon: 'people',
      color: lightTheme.colors.info,
      onPress: () => Alert.alert('파트너', '파트너 기능을 준비 중입니다.'),
    },
    {
      id: 'support',
      title: '지원',
      icon: 'support-agent',
      color: lightTheme.colors.error,
      onPress: () => Alert.alert('지원', '지원 기능을 준비 중입니다.'),
    },
  ];

  // 정보 카드 데이터
  const infoCards: InfoCard[] = [
    {
      id: 'earnings',
      title: '이번 달 수당',
      value: statsData ? `₩${statsData.thisMonthEarnings.toLocaleString()}` : '₩0',
      icon: 'trending-up',
      color: lightTheme.colors.success,
      trend: { value: 12.5, isPositive: true },
    },
    {
      id: 'points',
      title: '보유 포인트',
      value: statsData ? `${statsData.currentPoints.toLocaleString()}P` : '0P',
      icon: 'stars',
      color: lightTheme.colors.warning,
    },
    {
      id: 'level',
      title: '내 등급',
      value: statsData?.userLevel.name || '브론즈',
      icon: 'emoji-events',
      color: statsData?.userLevel.color || lightTheme.colors.secondary,
    },
  ];

  // 더미 데이터 (API가 없을 때 사용)
  const dummyStatsData: StatsData = {
    totalBalance: 1250000,
    monthlySpend: 450000,
    pendingCount: 3,
    thisMonthEarnings: 850000,
    currentPoints: 12500,
    userLevel: {
      level: 3,
      name: '골드',
      color: '#FFD700',
      icon: 'star',
    },
  };

  const dummyActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'earn',
      title: '정산 완료',
      subtitle: '2024년 1월 정산',
      amount: 850000,
      date: new Date().toISOString(),
      icon: 'account-balance-wallet',
      color: lightTheme.colors.success,
    },
    {
      id: '2',
      type: 'spend',
      title: '포인트 사용',
      subtitle: '상품 구매',
      amount: -25000,
      date: new Date(Date.now() - 86400000).toISOString(),
      icon: 'shopping-cart',
      color: lightTheme.colors.error,
    },
    {
      id: '3',
      type: 'referral',
      title: '추천 보상',
      subtitle: '신규 파트너 추천',
      amount: 50000,
      date: new Date(Date.now() - 172800000).toISOString(),
      icon: 'people',
      color: lightTheme.colors.info,
    },
  ];

  const displayStatsData = statsData || dummyStatsData;
  const displayActivities = activities.length > 0 ? activities : dummyActivities;

  return (
    <View style={styles.container}>
      <AppBar title={`안녕하세요, ${user?.name || '회원'}님`} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <SummaryCard
          data={displayStatsData}
          onChargePress={handleChargePress}
          onTransferPress={handleTransferPress}
        />

        <QuickActions actions={quickActions} />

        <InfoCards cards={infoCards} />

        <RecentActivity
          activities={displayActivities}
          onActivityPress={handleActivityPress}
          onViewAllPress={handleViewAllActivities}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
});