// mobile/src/components/Badge.tsx

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { sizes } from '../theme/sizes';
import { typography } from '../theme/typography';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  size = 'md',
  style,
}) => {
  const getVariantStyle = () => {
    const variants = {
      success: { backgroundColor: colors.successLight, color: colors.success },
      warning: { backgroundColor: colors.warningLight, color: colors.warning },
      error: { backgroundColor: colors.errorLight, color: colors.error },
      info: { backgroundColor: colors.infoLight, color: colors.info },
      primary: { backgroundColor: '#DDD', color: colors.primary },
    };
    return variants[variant];
  };

  const getSizeStyle = () => {
    return size === 'sm'
      ? { paddingVertical: spacing.xs, paddingHorizontal: spacing.md }
      : { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg };
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
        },
        getSizeStyle(),
        style,
      ]}
    >
      <Text
        style={[
          typography.caption,
          { color: variantStyle.color, fontWeight: '600' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: sizes.radius.full,
    alignSelf: 'flex-start',
  },
});
