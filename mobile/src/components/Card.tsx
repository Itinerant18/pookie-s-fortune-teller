// mobile/src/components/Card.tsx

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { sizes } from '../theme/sizes';
import { shadows } from '../theme/shadows';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'elevated',
  style,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = {
      borderRadius: sizes.radius.lg,
      padding: spacing.lg,
      backgroundColor: colors.white,
    };

    const variantStyle = {
      elevated: shadows.md,
      outlined: {
        borderWidth: 1,
        borderColor: colors.borderLight,
      },
      filled: {
        backgroundColor: colors.bgSecondary,
      },
    };

    return {
      ...baseStyle,
      ...variantStyle[variant],
    };
  };

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      style={[getCardStyle(), style]}
      onPress={onPress}
    >
      {children}
    </Wrapper>
  );
};
