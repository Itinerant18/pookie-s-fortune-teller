import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PredictionSectionProps {
  title: string;
  children: React.ReactNode;
}

const PredictionSection: React.FC<PredictionSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface HybridPredictionCardProps {
  category: 'career' | 'health' | 'finance' | 'relationship';
  astrology: any;
  behavior: any;
  combined: any;
}

export const HybridPredictionCard: React.FC<HybridPredictionCardProps> = ({
  category,
  astrology,
  behavior,
  combined,
}) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50'; // Green
    if (score >= 0.5) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.toUpperCase()} FORECAST</Text>
        <View style={[styles.badge, { backgroundColor: getConfidenceColor(combined.confidence) }]}>
          <Text style={styles.badgeText}>{(combined.confidence * 100).toFixed(0)}% Conf.</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Astrology Layer */}
        <PredictionSection title="✨ Astrological Insight">
          <Text style={styles.text}>{astrology.prediction || astrology.insight}</Text>
          <Text style={styles.subText}>Key Factor: {astrology.keyFactors?.[0]?.planet} in {astrology.keyFactors?.[0]?.house} House</Text>
        </PredictionSection>

        {/* Behavior Analytics Layer */}
        <PredictionSection title="📊 Data-Driven Analysis">
          <Text style={styles.text}>{behavior.prediction || behavior.insight}</Text>
          <Text style={styles.subText}>Trend: {behavior.trend || 'Stable'}</Text>
        </PredictionSection>

        {/* Combined Prediction */}
        <PredictionSection title="🎯 Combined Forecast">
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationText}>{combined.recommendation}</Text>
          </View>
          {combined.actionItems?.map((item: any, index: number) => (
            <Text key={index} style={styles.actionItem}>• {item.action}</Text>
          ))}
        </PredictionSection>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  body: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  subText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  recommendationBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#673ab7',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actionItem: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    marginBottom: 4,
  },
});
