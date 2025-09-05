import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../common/Card';
import { lightTheme } from '../../styles/theme';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ActivityItem } from '../../types';

interface RecentActivityProps {
  activities: ActivityItem[];
  onActivityPress?: (activity: ActivityItem) => void;
  onViewAllPress?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onActivityPress,
  onViewAllPress,
}) => {
  const renderActivityItem = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => onActivityPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={20} color="#FFFFFF" />
      </View>
      
      <View style={styles.contentSection}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
        <Text style={styles.activityDate}>{formatDateTime(item.date)}</Text>
      </View>
      
      <View style={styles.amountSection}>
        <Text
          style={[
            styles.amountText,
            {
              color: item.type === 'earn' || item.type === 'referral'
                ? lightTheme.colors.success
                : lightTheme.colors.error,
            },
          ]}
        >
          {item.type === 'earn' || item.type === 'referral' ? '+' : '-'}
          {formatCurrency(Math.abs(item.amount))}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="history" size={48} color={lightTheme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>활동 내역이 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        거래나 활동이 있으면 여기에 표시됩니다
      </Text>
    </View>
  );

  return (
    <Card style={styles.container} shadow="md">
      <View style={styles.header}>
        <Text style={styles.title}>최근 활동</Text>
        {activities.length > 0 && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={styles.viewAllText}>전체보기</Text>
          </TouchableOpacity>
        )}
      </View>

      {activities.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={activities.slice(0, 5)}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: lightTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text,
  },
  viewAllText: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.primary,
    fontWeight: lightTheme.typography.fontWeight.medium,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: lightTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: lightTheme.spacing.md,
  },
  contentSection: {
    flex: 1,
  },
  activityTitle: {
    fontSize: lightTheme.typography.fontSize.md,
    fontWeight: lightTheme.typography.fontWeight.medium,
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.xs,
  },
  activitySubtitle: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    marginBottom: lightTheme.spacing.xs,
  },
  activityDate: {
    fontSize: lightTheme.typography.fontSize.xs,
    color: lightTheme.colors.textSecondary,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: lightTheme.typography.fontSize.md,
    fontWeight: lightTheme.typography.fontWeight.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: lightTheme.typography.fontWeight.medium,
    color: lightTheme.colors.text,
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
  },
});
