// mobile/src/components/PredictionCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import { sizes } from '../theme/sizes';

interface PredictionCardProps {
  prediction: {
    id: string | number;
    title: string;
    period: string;
    description: string;
    confidence: number;
    tags: string[];
  };
  onPress: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onPress }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return colors.success;
    if (confidence >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[typography.h4, styles.title]}>
            {prediction.title}
          </Text>
          <Text style={[typography.caption, styles.period]}>
            {prediction.period}
          </Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(prediction.confidence) }]}>
          <Text style={styles.confidenceText}>
            {prediction.confidence}%
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={[typography.body, styles.description]}>
        {prediction.description}
      </Text>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {prediction.tags.map((tag) => (
          <View
            key={tag}
            style={styles.tag}
          >
            <Text style={[typography.caption, styles.tagText]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          View Details
        </Text>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: sizes.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  period: {
    color: colors.textSecondary,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: sizes.radius.full,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  description: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: sizes.radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagText: {
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    flex: 1,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  arrow: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
