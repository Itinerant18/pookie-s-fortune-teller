// mobile/src/screens/settings/NotificationsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { sizes } from '../../theme/sizes';
import { Card } from '../../components/Card';

interface NotificationSettings {
  pushEnabled: boolean;
  dailyHoroscope: boolean;
  newPredictions: boolean;
  healthReminders: boolean;
  incomeAlerts: boolean;
  marketingEmails: boolean;
  newFeatures: boolean;
  quietHoursEnabled: boolean;
  quietHoursFrom: string;
  quietHoursTo: string;
}

const NotificationsScreen = ({ navigation }: any) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    dailyHoroscope: true,
    newPredictions: true,
    healthReminders: false,
    incomeAlerts: true,
    marketingEmails: false,
    newFeatures: true,
    quietHoursEnabled: false,
    quietHoursFrom: '22:00',
    quietHoursTo: '08:00',
  });

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    // TODO: Save to backend
  };

  const SettingRow = ({
    icon,
    label,
    description,
    value,
    onToggle,
    disabled = false,
  }: {
    icon: string;
    label: string;
    description?: string;
    value: boolean;
    onToggle: (val: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color={disabled ? colors.grayMedium : colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[typography.body, disabled && { color: colors.textTertiary }]}>{label}</Text>
        {description && (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.grayLight, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.grayMedium}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Push Notifications Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>Push Notifications</Text>
          <Card>
            <SettingRow
              icon="notifications"
              label="Enable Push Notifications"
              description="Receive alerts on your device"
              value={settings.pushEnabled}
              onToggle={(val) => updateSetting('pushEnabled', val)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="sunny"
              label="Daily Horoscope"
              description="Get your daily horoscope every morning"
              value={settings.dailyHoroscope}
              onToggle={(val) => updateSetting('dailyHoroscope', val)}
              disabled={!settings.pushEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="analytics"
              label="New Predictions"
              description="Alerts when new predictions are ready"
              value={settings.newPredictions}
              onToggle={(val) => updateSetting('newPredictions', val)}
              disabled={!settings.pushEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="heart"
              label="Health Reminders"
              description="Daily health check-in reminders"
              value={settings.healthReminders}
              onToggle={(val) => updateSetting('healthReminders', val)}
              disabled={!settings.pushEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="cash"
              label="Income Alerts"
              description="Important income forecast updates"
              value={settings.incomeAlerts}
              onToggle={(val) => updateSetting('incomeAlerts', val)}
              disabled={!settings.pushEnabled}
            />
          </Card>
        </View>

        {/* Email Preferences Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>Email Preferences</Text>
          <Card>
            <SettingRow
              icon="megaphone"
              label="Marketing Emails"
              description="Updates about new features and offers"
              value={settings.marketingEmails}
              onToggle={(val) => updateSetting('marketingEmails', val)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="sparkles"
              label="New Features"
              description="Be the first to know about new features"
              value={settings.newFeatures}
              onToggle={(val) => updateSetting('newFeatures', val)}
            />
          </Card>
        </View>

        {/* Quiet Hours Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>Quiet Hours</Text>
          <Card>
            <SettingRow
              icon="moon"
              label="Enable Quiet Hours"
              description="Pause notifications during specified times"
              value={settings.quietHoursEnabled}
              onToggle={(val) => updateSetting('quietHoursEnabled', val)}
            />
            {settings.quietHoursEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.quietHoursRow}>
                  <View style={styles.timeSelector}>
                    <Text style={typography.caption}>From</Text>
                    <TouchableOpacity style={styles.timeButton}>
                      <Text style={[typography.body, { color: colors.primary }]}>
                        {settings.quietHoursFrom}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                  <View style={styles.timeSelector}>
                    <Text style={typography.caption}>To</Text>
                    <TouchableOpacity style={styles.timeButton}>
                      <Text style={[typography.body, { color: colors.primary }]}>
                        {settings.quietHoursTo}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </Card>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  quietHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  timeSelector: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeButton: {
    backgroundColor: colors.bgSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});

export default NotificationsScreen;
