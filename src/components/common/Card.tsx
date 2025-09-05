import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { lightTheme } from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof lightTheme.spacing;
  shadow?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  shadow = 'md',
}) => {
  const cardStyle = [
    styles.base,
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    styles[`shadow${shadow.charAt(0).toUpperCase() + shadow.slice(1)}`],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: lightTheme.colors.card,
    borderRadius: lightTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  paddingXs: {
    padding: lightTheme.spacing.xs,
  },
  paddingSm: {
    padding: lightTheme.spacing.sm,
  },
  paddingMd: {
    padding: lightTheme.spacing.md,
  },
  paddingLg: {
    padding: lightTheme.spacing.lg,
  },
  paddingXl: {
    padding: lightTheme.spacing.xl,
  },
  paddingXxl: {
    padding: lightTheme.spacing.xxl,
  },
  shadowSm: lightTheme.shadows.sm,
  shadowMd: lightTheme.shadows.md,
  shadowLg: lightTheme.shadows.lg,
});
