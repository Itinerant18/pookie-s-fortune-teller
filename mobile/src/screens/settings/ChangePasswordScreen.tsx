// mobile/src/screens/settings/ChangePasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { sizes } from '../../theme/sizes';
import { supabase } from '../../services/supabase';

const ChangePasswordScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your password has been changed successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    field,
    showPassword,
    error,
  }: {
    label: string;
    value: string;
    field: keyof typeof formData;
    showPassword: boolean;
    error?: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() =>
            setShowPasswords({
              ...showPasswords,
              [field === 'currentPassword'
                ? 'current'
                : field === 'newPassword'
                ? 'new'
                : 'confirm']: !showPassword,
            })
          }
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
          <Text style={[typography.h3, styles.headerTitle]}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info Card */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color={colors.info} />
            <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>
              Choose a strong password with at least 6 characters, including numbers and symbols.
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <PasswordInput
            label="Current Password"
            value={formData.currentPassword}
            field="currentPassword"
            showPassword={showPasswords.current}
            error={errors.currentPassword}
          />

          <PasswordInput
            label="New Password"
            value={formData.newPassword}
            field="newPassword"
            showPassword={showPasswords.new}
            error={errors.newPassword}
          />

          <PasswordInput
            label="Confirm New Password"
            value={formData.confirmPassword}
            field="confirmPassword"
            showPassword={showPasswords.confirm}
            error={errors.confirmPassword}
          />
        </View>

        {/* Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.changeButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
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
  infoSection: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.infoLight,
    padding: spacing.lg,
    borderRadius: sizes.radius.md,
  },
  form: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: sizes.radius.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg,
    fontSize: 16,
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  buttonSection: {
    padding: spacing.lg,
  },
  changeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: sizes.radius.lg,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  changeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
