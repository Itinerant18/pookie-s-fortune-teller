// mobile/src/screens/main/DashboardScreen.tsx

import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ProgressRing } from '../../components/ProgressRing';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { sizes } from '../../theme/sizes';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { useAuth } from '../../hooks/useAuth';
import { usePredictions } from '../../hooks/usePredictions';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { predictions, loading, fetchPredictions } = usePredictions();

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Derived state (mock logic for now)
  const stressLevel = 65; 
  const incomePrediction = predictions.find(p => p.tags.includes('Income'));
  const healthPrediction = predictions.find(p => p.tags.includes('Health'));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchPredictions} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="person-circle" size={48} color={colors.primary} style={styles.avatar} />
            <View>
              <Text style={[typography.h4, styles.greeting]}>
                Good Morning
              </Text>
              <Text style={[typography.body, styles.name]}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.notificationIcon}
          >
            <Ionicons name="notifications" size={24} color={colors.textPrimary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats Row (from new design doc) */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatCard}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Today's Fortune
            </Text>
            <Text style={[typography.h3, { color: colors.warning }]}>
              ⭐ Good
            </Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Current Dasha
            </Text>
            <Text style={[typography.h3, { color: colors.primary }]}>
              Rahu
            </Text>
          </View>
        </View>

        {/* Quick Predictions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h4, { color: colors.textPrimary }]}>
              Your Predictions
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Predictions')}>
              <Text style={[typography.label, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stress Level */}
          <Card style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View>
                <Text style={[typography.label, styles.predictionLabel]}>
                  Stress Level
                </Text>
                <Text style={[typography.h3, styles.predictionValue]}>
                  {stressLevel}%
                </Text>
              </View>
              <ProgressRing
                percentage={stressLevel}
                label="Today"
                color={stressLevel > 70 ? colors.error : colors.warning}
                size="sm"
              />
            </View>
            <View style={styles.riskLevel}>
              <Badge
                label={stressLevel > 70 ? 'High Stress' : 'Moderate'}
                variant={stressLevel > 70 ? 'error' : 'warning'}
              />
            </View>
          </Card>

          {/* Income Forecast */}
          {incomePrediction && (
              <Card style={styles.predictionCard}>
                <View style={styles.predictionHeader}>
                  <View>
                    <Text style={[typography.label, styles.predictionLabel]}>
                      {incomePrediction.title}
                    </Text>
                    <Text style={[typography.h3, styles.predictionValue]}>
                      Positive
                    </Text>
                  </View>
                  <Ionicons name="trending-up" size={32} color={colors.success} />
                </View>
                <Text style={[typography.caption, styles.forecastTrend]}>
                  {incomePrediction.description}
                </Text>
                <View style={{marginTop: 8}}>
                    <Badge label={`${incomePrediction.confidence}% Confidence`} variant="success" size="sm" />
                </View>
              </Card>
          )}

          {/* Health Risk */}
          <Card style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View>
                <Text style={[typography.label, styles.predictionLabel]}>
                  Health Risk
                </Text>
                <Text style={[typography.h3, styles.predictionValue]}>
                  Low
                </Text>
              </View>
              <Ionicons name="heart" size={32} color={colors.success} />
            </View>
            <Text style={[typography.caption, styles.healthStatus]}>
              All metrics look good today
            </Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[typography.h4, { color: colors.textPrimary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Predictions', { screen: 'IncomeForecast' })}>
              <Ionicons name="analytics" size={24} color={colors.primary} />
              <Text style={[typography.caption, styles.actionLabel]}>
                Income
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Predictions', { screen: 'Health' })}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <Text style={[typography.caption, styles.actionLabel]}>
                Health
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Predictions', { screen: 'Relationships' })}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={[typography.caption, styles.actionLabel]}>
                Relations
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('BirthChart')}>
              <Ionicons name="pie-chart" size={24} color={colors.primary} />
              <Text style={[typography.caption, styles.actionLabel]}>
                Chart
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacing */}
        <View style={styles.bottomPadding} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
  },
  greeting: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  notificationIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  quickStatsRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.md,
  },
  quickStatCard: {
      flex: 1,
      backgroundColor: colors.bgSecondary,
      borderRadius: sizes.radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionCard: {
    marginBottom: spacing.lg,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionLabel: {
    color: colors.textSecondary,
  },
  predictionValue: {
    color: colors.textPrimary,
  },
  riskLevel: {
    marginTop: spacing.lg,
  },
  forecastTrend: {
    color: colors.success,
    marginTop: spacing.md,
  },
  healthStatus: {
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionButton: {
    width: (width - spacing.lg * 2 - spacing.md * 3) / 4,
    aspectRatio: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: sizes.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionLabel: {
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: spacing['4xl'],
  },
});

export default DashboardScreen;
