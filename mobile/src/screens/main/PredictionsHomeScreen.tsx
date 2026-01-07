// mobile/src/screens/main/PredictionsHomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { sizes } from '../../theme/sizes';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { usePredictions } from '../../hooks/usePredictions';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'income' | 'health' | 'relationships';
type PeriodFilter = 'all' | 'week' | 'month' | 'year';

const PredictionsHomeScreen = ({ navigation }: any) => {
  const { predictions, loading, fetchPredictions, filters } = usePredictions();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activePeriod, setActivePeriod] = useState<PeriodFilter>('all');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const filterTabs: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'income', label: 'Income', icon: 'cash' },
    { key: 'health', label: 'Health', icon: 'heart' },
    { key: 'relationships', label: 'Relations', icon: 'people' },
  ];

  const periodTabs: { key: PeriodFilter; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ];

  const filteredPredictions = predictions.filter((p: any) => {
    if (activeFilter === 'all') return true;
    const tags = p.tags?.map((t: string) => t.toLowerCase()) || [];
    return tags.includes(activeFilter);
  });

  const getCategoryIcon = (tags: string[]) => {
    if (tags?.includes('Income') || tags?.includes('Career')) return 'cash';
    if (tags?.includes('Health')) return 'heart';
    if (tags?.includes('Relationship')) return 'people';
    return 'analytics';
  };

  const getCategoryColor = (tags: string[]) => {
    if (tags?.includes('Income') || tags?.includes('Career')) return colors.success;
    if (tags?.includes('Health')) return colors.error;
    if (tags?.includes('Relationship')) return colors.secondary;
    return colors.primary;
  };

  const quickActions = [
    { 
      title: 'Income Forecast', 
      icon: 'trending-up', 
      color: colors.success,
      screen: 'IncomeForecast' 
    },
    { 
      title: 'Health Insights', 
      icon: 'heart', 
      color: colors.error,
      screen: 'Health' 
    },
    { 
      title: 'Relationships', 
      icon: 'people', 
      color: colors.secondary,
      screen: 'Relationships' 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPredictions} />
        }
      >
        {/* Quick Action Cards */}
        <View style={styles.quickActionsSection}>
          <Text style={[typography.h4, styles.sectionTitle]}>Quick Access</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {quickActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.quickActionCard, { borderColor: action.color }]}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[typography.bodySmall, styles.quickActionText]}>
                  {action.title}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key && styles.filterTabActive,
                ]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={16} 
                  color={activeFilter === tab.key ? colors.white : colors.textSecondary} 
                />
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === tab.key && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Period Filter */}
        <View style={styles.periodFilterSection}>
          {periodTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.periodTab,
                activePeriod === tab.key && styles.periodTabActive,
              ]}
              onPress={() => setActivePeriod(tab.key)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  activePeriod === tab.key && styles.periodTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Predictions List */}
        <View style={styles.predictionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h4, styles.sectionTitle]}>
              Your Predictions
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {filteredPredictions.length} results
            </Text>
          </View>

          {filteredPredictions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="analytics" size={48} color={colors.grayMedium} />
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
                  No predictions found
                </Text>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>
                  Generate predictions from your dashboard
                </Text>
              </View>
            </Card>
          ) : (
            filteredPredictions.map((prediction: any) => (
              <TouchableOpacity
                key={prediction.id}
                style={styles.predictionCard}
                onPress={() => {
                  // Navigate to detail or related screen
                  if (prediction.tags?.includes('Income')) {
                    navigation.navigate('IncomeForecast');
                  } else if (prediction.tags?.includes('Health')) {
                    navigation.navigate('Health');
                  } else if (prediction.tags?.includes('Relationship')) {
                    navigation.navigate('Relationships');
                  }
                }}
              >
                <View style={styles.predictionHeader}>
                  <View style={[styles.predictionIcon, { backgroundColor: getCategoryColor(prediction.tags) + '20' }]}>
                    <Ionicons 
                      name={getCategoryIcon(prediction.tags) as any} 
                      size={24} 
                      color={getCategoryColor(prediction.tags)} 
                    />
                  </View>
                  <View style={styles.predictionInfo}>
                    <Text style={[typography.body, { fontWeight: '600' }]}>
                      {prediction.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {prediction.period}
                    </Text>
                  </View>
                  <View style={styles.confidenceBadge}>
                    <Text style={[typography.h4, { color: colors.primary }]}>
                      {prediction.confidence}%
                    </Text>
                    <Text style={[typography.caption, { color: colors.textTertiary }]}>
                      confidence
                    </Text>
                  </View>
                </View>
                
                <Text style={[typography.body, styles.predictionDescription]}>
                  {prediction.description}
                </Text>
                
                <View style={styles.predictionFooter}>
                  <View style={styles.tagsContainer}>
                    {prediction.tags?.map((tag: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        label={tag} 
                        size="sm" 
                        variant="info"
                        style={{ backgroundColor: colors.bgSecondary }}
                      />
                    ))}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  quickActionsSection: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  quickActionsContainer: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.radius.lg,
    borderWidth: 1,
    marginRight: spacing.md,
    gap: spacing.sm,
    minWidth: 160,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  filterSection: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.radius.full,
    backgroundColor: colors.bgSecondary,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.white,
  },
  periodFilterSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  periodTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  periodTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  periodTabText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  periodTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  predictionsSection: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  predictionCard: {
    backgroundColor: colors.white,
    borderRadius: sizes.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  predictionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  predictionInfo: {
    flex: 1,
  },
  confidenceBadge: {
    alignItems: 'center',
  },
  predictionDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  predictionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});

export default PredictionsHomeScreen;
