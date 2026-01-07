// mobile/src/screens/main/HealthScreen.tsx

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { sizes } from '../../theme/sizes';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

interface HealthMetrics {
  workHours: number;
  sleepHours: number;
  exerciseMinutes: number;
  moodScore: number;
  stressScore: number;
}

interface StressAssessment {
  score: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
}

interface Recommendation {
  icon: string;
  text: string;
}

const HealthScreen = () => {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    workHours: 8,
    sleepHours: 7,
    exerciseMinutes: 30,
    moodScore: 7,
    stressScore: 5,
  });

  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<StressAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return colors.success;
      case 'moderate': return colors.warning;
      case 'high': return colors.error;
      case 'critical': return '#8B0000';
      default: return colors.info;
    }
  };

  const getMetricColor = (value: number, max: number, inverse = false) => {
    const ratio = value / max;
    if (inverse) {
      if (ratio < 0.3) return colors.success;
      if (ratio < 0.6) return colors.warning;
      return colors.error;
    }
    if (ratio > 0.7) return colors.success;
    if (ratio > 0.4) return colors.warning;
    return colors.error;
  };

  const analyzeHealth = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate stress based on inputs
      const workStress = metrics.workHours > 9 ? 2 : metrics.workHours > 8 ? 1 : 0;
      const sleepBonus = metrics.sleepHours >= 7 ? -1 : metrics.sleepHours >= 6 ? 0 : 1;
      const exerciseBonus = metrics.exerciseMinutes >= 30 ? -1 : 0;
      const moodFactor = metrics.moodScore < 5 ? 1 : 0;
      const baseStress = metrics.stressScore;

      const calculatedScore = Math.min(10, Math.max(0, 
        baseStress + workStress + sleepBonus - exerciseBonus + moodFactor
      ));

      let status: StressAssessment['status'];
      let description: string;

      if (calculatedScore <= 3) {
        status = 'low';
        description = 'Your stress levels are well managed. Keep up the healthy habits!';
      } else if (calculatedScore <= 5) {
        status = 'moderate';
        description = 'Some stress indicators detected. Consider increasing rest or exercise.';
      } else if (calculatedScore <= 7) {
        status = 'high';
        description = 'Elevated stress levels. Recommend immediate lifestyle adjustments.';
      } else {
        status = 'critical';
        description = 'Critical stress levels detected. Please prioritize self-care and consider professional support.';
      }

      setAssessment({
        score: calculatedScore,
        status,
        description,
      });

      // Generate recommendations based on metrics
      const newRecs: Recommendation[] = [];
      
      if (metrics.sleepHours < 7) {
        newRecs.push({ icon: 'moon', text: 'Aim for 7-8 hours of sleep for optimal recovery' });
      }
      if (metrics.workHours > 8) {
        newRecs.push({ icon: 'briefcase', text: 'Consider taking regular breaks during work' });
      }
      if (metrics.exerciseMinutes < 30) {
        newRecs.push({ icon: 'fitness', text: 'Add 30 minutes of moderate exercise daily' });
      }
      if (metrics.moodScore < 6) {
        newRecs.push({ icon: 'happy', text: 'Practice mindfulness or meditation for 10 minutes' });
      }
      if (metrics.stressScore > 6) {
        newRecs.push({ icon: 'leaf', text: 'Try deep breathing exercises throughout the day' });
      }

      if (newRecs.length === 0) {
        newRecs.push({ icon: 'checkmark-circle', text: 'Great job! Your health metrics look balanced.' });
      }

      setRecommendations(newRecs);

    } catch (error) {
      console.error('Error analyzing health:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricSlider = ({
    label,
    value,
    min,
    max,
    step,
    unit,
    icon,
    onChange,
    inverse = false,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    icon: string;
    onChange: (val: number) => void;
    inverse?: boolean;
  }) => (
    <View style={styles.metricContainer}>
      <View style={styles.metricHeader}>
        <View style={styles.metricLabel}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
          <Text style={typography.body}>{label}</Text>
        </View>
        <Text style={[typography.h4, { color: getMetricColor(value, max, inverse) }]}>
          {value} {unit}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.grayLight}
        thumbTintColor={colors.primary}
      />
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${(value / max) * 100}%`,
              backgroundColor: getMetricColor(value, max, inverse),
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h2, styles.title]}>Health & Wellness</Text>
          <Text style={[typography.body, styles.subtitle]}>
            Track your daily metrics for personalized insights
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>Daily Metrics</Text>
          <Card style={styles.metricsCard}>
            <MetricSlider
              label="Work Hours"
              value={metrics.workHours}
              min={1}
              max={12}
              step={0.5}
              unit="hrs"
              icon="briefcase"
              onChange={(val) => setMetrics({ ...metrics, workHours: val })}
            />
            <MetricSlider
              label="Sleep Hours"
              value={metrics.sleepHours}
              min={1}
              max={12}
              step={0.5}
              unit="hrs"
              icon="moon"
              onChange={(val) => setMetrics({ ...metrics, sleepHours: val })}
            />
            <MetricSlider
              label="Exercise"
              value={metrics.exerciseMinutes}
              min={0}
              max={120}
              step={5}
              unit="min"
              icon="fitness"
              onChange={(val) => setMetrics({ ...metrics, exerciseMinutes: val })}
            />
            <MetricSlider
              label="Mood"
              value={metrics.moodScore}
              min={1}
              max={10}
              step={1}
              unit=""
              icon="happy"
              onChange={(val) => setMetrics({ ...metrics, moodScore: val })}
            />
            <MetricSlider
              label="Stress Level"
              value={metrics.stressScore}
              min={1}
              max={10}
              step={1}
              unit=""
              icon="pulse"
              onChange={(val) => setMetrics({ ...metrics, stressScore: val })}
              inverse
            />
          </Card>
        </View>

        {/* Analyze Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={analyzeHealth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="analytics" size={20} color={colors.white} />
                <Text style={styles.analyzeButtonText}>Analyze & Get Insights</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {assessment && (
          <View style={styles.section}>
            <Text style={[typography.h4, styles.sectionTitle]}>Stress Assessment</Text>
            <Card style={[styles.assessmentCard, { borderLeftColor: getStatusColor(assessment.status) }]}>
              <View style={styles.assessmentHeader}>
                <View style={styles.scoreCircle}>
                  <Text style={[typography.h2, { color: getStatusColor(assessment.status) }]}>
                    {assessment.score}
                  </Text>
                  <Text style={typography.caption}>/10</Text>
                </View>
                <View style={styles.assessmentInfo}>
                  <Badge
                    label={assessment.status.toUpperCase()}
                    variant={assessment.status === 'low' ? 'success' : assessment.status === 'moderate' ? 'warning' : 'error'}
                  />
                  <Text style={[typography.body, { marginTop: spacing.sm }]}>
                    {assessment.description}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={[typography.h4, styles.sectionTitle]}>Wellness Recommendations</Text>
            {recommendations.map((rec, idx) => (
              <Card key={idx} style={styles.recommendationCard}>
                <View style={styles.recommendationContent}>
                  <View style={styles.recommendationIcon}>
                    <Ionicons name={rec.icon as any} size={24} color={colors.secondary} />
                  </View>
                  <Text style={[typography.body, styles.recommendationText]}>{rec.text}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metricsCard: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  metricContainer: {
    marginBottom: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.grayLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  analyzeButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: sizes.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  analyzeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  assessmentCard: {
    borderLeftWidth: 4,
    padding: spacing.lg,
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.borderLight,
  },
  assessmentInfo: {
    flex: 1,
  },
  recommendationCard: {
    marginBottom: spacing.md,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationText: {
    flex: 1,
    color: colors.textPrimary,
  },
});

export default HealthScreen;
