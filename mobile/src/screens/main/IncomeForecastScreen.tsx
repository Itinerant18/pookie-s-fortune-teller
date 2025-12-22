// mobile/src/screens/main/IncomeForecastScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { sizes } from '../../theme/sizes';

const IncomeForecastScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  // Mock data
  const forecast = {
    averageIncome: 55000,
    growthTrend: 12,
    bestMonth: 62000,
    confidence: 85,
    monthlyData: [
        { month: 'Jan', value: 45000 },
        { month: 'Feb', value: 48000 },
        { month: 'Mar', value: 47000 },
        { month: 'Apr', value: 52000 },
        { month: 'May', value: 58000 },
        { month: 'Jun', value: 62000 },
    ],
    recommendations: [
        'Good time to invest in long-term assets.',
        'Consider negotiating salary in May.'
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.h2, styles.headerTitle]}>
          Income Forecast
        </Text>
        <Text style={[typography.body, styles.headerSub]}>
          6-12 month projection based on your profile
        </Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['3months', '6months', '12months'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}
            >
              {period === '3months' && '3M'}
              {period === '6months' && '6M'}
              {period === '12months' && '12M'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Section (Visual Mock) */}
      <View style={styles.chartContainer}>
           <Text style={[typography.h4, {marginBottom: spacing.md}]}>Income Trend</Text>
           <View style={styles.chartBars}>
                {forecast.monthlyData.map((item, idx) => (
                  <View key={idx} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { height: (item.value / 70000) * 150 } // scale
                      ]}
                    />
                    <Text style={[typography.caption, styles.barLabel]}>
                      {item.month}
                    </Text>
                  </View>
                ))}
            </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={[typography.h4, styles.sectionTitle]}>
          Key Metrics
        </Text>
        <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
                 <Ionicons name="stats-chart" size={24} color={colors.primary} />
                 <Text style={styles.metricLabel}>Avg. Income</Text>
                 <Text style={[typography.h3, {color: colors.primary}]}>${(forecast.averageIncome/1000).toFixed(1)}k</Text>
            </View>
            <View style={styles.metricCard}>
                 <Ionicons name="trending-up" size={24} color={colors.success} />
                 <Text style={styles.metricLabel}>Growth</Text>
                 <Text style={[typography.h3, {color: colors.success}]}>+{forecast.growthTrend}%</Text>
            </View>
             <View style={styles.metricCard}>
                 <Ionicons name="trophy" size={24} color={colors.warning} />
                 <Text style={styles.metricLabel}>Best Month</Text>
                 <Text style={[typography.h3, {color: colors.warning}]}>${(forecast.bestMonth/1000).toFixed(1)}k</Text>
            </View>
             <View style={styles.metricCard}>
                 <Ionicons name="shield-checkmark" size={24} color={colors.info} />
                 <Text style={styles.metricLabel}>Confidence</Text>
                 <Text style={[typography.h3, {color: colors.info}]}>{forecast.confidence}%</Text>
            </View>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
              Recommendations
          </Text>
          {forecast.recommendations.map((rec, idx) => (
             <View key={idx} style={styles.recommendationCard}>
                 <Ionicons name="information-circle" size={20} color={colors.secondary} style={{marginRight: spacing.sm}}/>
                 <Text style={typography.body}>{rec}</Text>
             </View>
          ))}
      </View>
      
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
  },
  headerTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSub: {
    color: colors.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: sizes.radius.md,
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  periodTextActive: {
      color: colors.white,
  },
  chartContainer: {
      margin: spacing.lg,
      padding: spacing.lg,
      backgroundColor: colors.bgSecondary,
      borderRadius: sizes.radius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
  },
  chartBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 180,
  },
  barWrapper: {
      alignItems: 'center',
      flex: 1,
  },
  bar: {
      width: 20,
      backgroundColor: colors.secondary,
      borderRadius: sizes.radius.sm,
      marginBottom: spacing.xs,
  },
  barLabel: {
      color: colors.textSecondary,
  },
  section: {
      padding: spacing.lg,
  },
  sectionTitle: {
      marginBottom: spacing.md,
      color: colors.textPrimary,
  },
  metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
  },
  metricCard: {
      width: '47%',
      backgroundColor: colors.bgSecondary,
      padding: spacing.md,
      borderRadius: sizes.radius.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: spacing.xs,
  },
  metricLabel: {
      color: colors.textSecondary,
      fontSize: 12,
  },
  recommendationCard: {
      flexDirection: 'row',
      backgroundColor: colors.infoLight,
      padding: spacing.md,
      borderRadius: sizes.radius.md,
      marginBottom: spacing.md,
      alignItems: 'center',
  },
});

export default IncomeForecastScreen;
