import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../common/Card';
import { lightTheme } from '../../styles/theme';
import { formatCurrency, formatPoints } from '../../utils/formatters';
import { InfoCard } from '../../types';

interface InfoCardsProps {
  cards: InfoCard[];
}

export const InfoCards: React.FC<InfoCardsProps> = ({ cards }) => {
  return (
    <View style={styles.container}>
      {cards.map((card) => (
        <TouchableOpacity key={card.id} style={styles.cardWrapper}>
          <Card style={styles.card} shadow="sm">
            <View style={styles.cardContent}>
              <View style={styles.leftSection}>
                <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                  <Icon name={card.icon} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.textSection}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardValue}>{card.value}</Text>
                </View>
              </View>
              
              {card.trend && (
                <View style={styles.trendSection}>
                  <Icon
                    name={card.trend.isPositive ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={card.trend.isPositive ? lightTheme.colors.success : lightTheme.colors.error}
                  />
                  <Text
                    style={[
                      styles.trendText,
                      {
                        color: card.trend.isPositive
                          ? lightTheme.colors.success
                          : lightTheme.colors.error,
                      },
                    ]}
                  >
                    {card.trend.isPositive ? '+' : ''}{card.trend.value}%
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: lightTheme.spacing.md,
  },
  cardWrapper: {
    marginHorizontal: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.sm,
  },
  card: {
    margin: 0,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: lightTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: lightTheme.spacing.md,
  },
  textSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    marginBottom: lightTheme.spacing.xs,
  },
  cardValue: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text,
  },
  trendSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: lightTheme.typography.fontWeight.medium,
    marginLeft: lightTheme.spacing.xs,
  },
});
