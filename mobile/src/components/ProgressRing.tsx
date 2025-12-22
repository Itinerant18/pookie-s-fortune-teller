// mobile/src/components/ProgressRing.tsx

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ProgressRingProps {
  percentage: number;
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  label,
  color = colors.primary,
  size = 'md',
}) => {
  const sizeConfig = {
    sm: { radius: 30, circumference: 188.4 },
    md: { radius: 50, circumference: 314 },
    lg: { radius: 70, circumference: 439.6 },
  };

  const config = sizeConfig[size];
  const strokeDashoffset = config.circumference - (percentage / 100) * config.circumference;

  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <Svg
          width={config.radius * 2}
          height={config.radius * 2}
          viewBox={`0 0 ${config.radius * 2} ${config.radius * 2}`}
        >
          {/* Background circle */}
          <Circle
            cx={config.radius}
            cy={config.radius}
            r={config.radius - 5}
            fill="none"
            stroke={colors.grayLight}
            strokeWidth="4"
          />
          {/* Progress circle */}
          <Circle
            cx={config.radius}
            cy={config.radius}
            r={config.radius - 5}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={config.circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${config.radius} ${config.radius})`}
          />
        </Svg>
        <View style={styles.content}>
          <Text style={[typography.h2, { textAlign: 'center', color }]}>
            {percentage}%
          </Text>
          <Text style={[typography.caption, styles.label]}>
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: spacing.xs,
    color: '#666',
  },
});
