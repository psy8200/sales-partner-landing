import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { lightTheme } from '../../styles/theme';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { StatsData } from '../../types';

interface SummaryCardProps {
  data: StatsData;
  onChargePress: () => void;
  onTransferPress: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  data,
  onChargePress,
  onTransferPress,
}) => {
  return (
    <Card style={styles.container} shadow="lg">
      <View style={styles.header}>
        <Text style={styles.title}>내 계정</Text>
        <View style={styles.levelBadge}>
          <Icon name="star" size={16} color={data.userLevel.color} />
          <Text style={[styles.levelText, { color: data.userLevel.color }]}>
            {data.userLevel.name}
          </Text>
        </View>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>총 잔액</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(data.totalBalance)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>이번 달 지출</Text>
          <Text style={styles.statValue}>
            {formatCurrency(data.monthlySpend)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>대기 건수</Text>
          <Text style={styles.statValue}>
            {formatNumber(data.pendingCount)}건
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="충전"
          onPress={onChargePress}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
        <Button
          title="이체"
          onPress={onTransferPress}
          variant="outline"
          size="medium"
          style={styles.actionButton}
        />
      </View>
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
    marginBottom: lightTheme.spacing.lg,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surface,
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.full,
  },
  levelText: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: lightTheme.typography.fontWeight.medium,
    marginLeft: lightTheme.spacing.xs,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.lg,
  },
  balanceLabel: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    marginBottom: lightTheme.spacing.xs,
  },
  balanceAmount: {
    fontSize: lightTheme.typography.fontSize.xxxl,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: lightTheme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    marginBottom: lightTheme.spacing.xs,
  },
  statValue: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: lightTheme.typography.fontWeight.semibold,
    color: lightTheme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: lightTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});