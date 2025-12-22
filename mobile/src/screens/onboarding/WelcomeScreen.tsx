// mobile/src/screens/onboarding/WelcomeScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Ionicons name="sparkles" size={60} color="#FFD700" style={styles.heroIcon} />
          <Text style={[typography.h1, styles.title]}>
            Welcome to Predictions
          </Text>
          <Text style={[typography.body, styles.subtitle]}>
            Get personalized astrological insights, health predictions, and income forecasts based on your birth chart
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.features}>
          {[
            'Birth Chart Analysis',
            'Income Forecasting',
            'Health Predictions',
            'Relationship Compatibility'
          ].map((feature) => (
            <View 
              key={feature}
              style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#A85047" style={styles.featureIcon} />
              <Text style={[typography.body, styles.featureText]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BirthChart')} 
          activeOpacity={0.8}
        >
          <Text style={[typography.buttonLarge, styles.buttonText]}>
            Get Started
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Force White
  },
  scrollContent: {
    padding: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  heroIcon: {
    marginBottom: spacing.lg,
  },
  title: {
    color: '#000000', // Force Black
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    color: '#333333', // Dark Gray
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
  features: {
    marginBottom: spacing['3xl'],
    alignSelf: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    marginRight: spacing.md,
  },
  featureText: {
    color: '#000000', // Force Black
    fontSize: 16,
  },
  button: {
    backgroundColor: '#208095', // Primary Teal
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#208095',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold', 
  },
});

export default WelcomeScreen;
