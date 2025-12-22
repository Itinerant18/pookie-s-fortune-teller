// mobile/src/components/Button.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { sizes } from '../theme/sizes';
import { typography } from '../theme/typography';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = {
      borderRadius: sizes.radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row' as const,
      gap: spacing.sm,
    };

    const sizeStyle = {
      sm: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
      md: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
      lg: { paddingVertical: spacing.xl, paddingHorizontal: spacing['2xl'] },
    };

    const variantStyle = {
      primary: {
        backgroundColor: disabled ? colors.grayMedium : colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? colors.grayMedium : colors.secondary,
      },
      outline: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: disabled ? colors.grayMedium : colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyle[size],
      ...variantStyle[variant],
      width: fullWidth ? '100%' : undefined,
    };
  };

  const getTextStyle = (): TextStyle => {
    const variantTextColor = {
      primary: colors.white,
      secondary: colors.white,
      outline: colors.primary,
      ghost: colors.primary,
    };

    return {
      color: disabled ? colors.grayDark : variantTextColor[variant],
      ...typography.buttonLarge,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : colors.white}
        />
      ) : (
        <>
          {leftIcon && leftIcon}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};
