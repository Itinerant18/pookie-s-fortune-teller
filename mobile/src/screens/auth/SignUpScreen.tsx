// mobile/src/screens/auth/SignUpScreen.tsx

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { supabase } from '../../services/supabase';

const SignUpScreen = ({ navigation, route }: any) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Params passed from CompleteProfileScreen (Onboarding flow)
  const { 
      birthDate, location, coords, gender, displayName 
  } = route.params || {};

  // Pre-fill name if available from previous screen
  React.useEffect(() => {
      if (displayName) {
          const parts = displayName.trim().split(' ');
          setFormData(prev => ({
              ...prev,
              firstName: parts[0] || '',
              lastName: parts.slice(1).join(' ') || ''
          }));
      }
  }, [displayName]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("Signing up with details:", { email: formData.email, birthDate, location });

      // 1. Create Auth User
      const { data: { user }, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            // If deferred onboarding, we can store these in metadata too, 
            // but explicit table update is better for large data
          },
        },
      });

      if (error) throw error;

      if (user) {
          // 2. If we have onboarding data, update the profile immediately
          if (birthDate && location) {
              const updates = {
                  id: user.id,
                  username: `${formData.firstName} ${formData.lastName}`,
                  full_name: `${formData.firstName} ${formData.lastName}`,
                  first_name: formData.firstName,
                  last_name: formData.lastName,
                  gender: gender || 'Other',
                  birth_date: birthDate,
                  birth_place: location,
                  birth_lat: coords?.lat ? parseFloat(coords.lat) : null,
                  birth_lon: coords?.lon ? parseFloat(coords.lon) : null,
                  onboarding_completed: true,
                  updated_at: new Date(),
              };

              console.log("Creating full profile with:", updates);

              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert(updates);
              
              if (profileError) {
                  console.error("Profile creation error:", profileError);
                  // Don't block signup success, but maybe warn
              }
          }
          
          // Navigation handled automatically by RootNavigator auth state change
          // But we can show a success message if email confirmation is needed
           Alert.alert("Success", "Account created! Please check your email to confirm.");
      }

    } catch (error: any) {
      console.error(error);
      setErrors({ auth: error.message || 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={colors.white} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[typography.h1, styles.headerTitle]}>
                Create Account
              </Text>
              <Text style={[typography.body, styles.headerSubtitle]}>
                {birthDate ? "Save your details to continue" : "Join us to unlock predictions"}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {errors.auth && (
                <View style={styles.errorAlert}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <Text style={[typography.caption, { color: colors.error }]}>
                    {errors.auth}
                  </Text>
                </View>
              )}

              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    onChangeText={(val) => handleInputChange('firstName', val)}
                    error={errors.firstName}
                  />
                </View>
                <View style={styles.nameField}>
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChangeText={(val) => handleInputChange('lastName', val)}
                    error={errors.lastName}
                  />
                </View>
              </View>

              <Input
                label="Email"
                placeholder="your@email.com"
                type="email"
                value={formData.email}
                onChangeText={(val) => handleInputChange('email', val)}
                error={errors.email}
                leftIcon="mail"
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                value={formData.password}
                onChangeText={(val) => handleInputChange('password', val)}
                error={errors.password}
                leftIcon="lock-closed"
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Confirm Password"
                placeholder="••••••••"
                type="password"
                value={formData.confirmPassword}
                onChangeText={(val) => handleInputChange('confirmPassword', val)}
                error={errors.confirmPassword}
                leftIcon="lock-closed"
                containerStyle={styles.inputContainer}
              />

              {/* Terms */}
              <TouchableOpacity
                style={styles.termsCheckbox}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreeTerms && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
                <Text style={[typography.body, styles.termsText]}>
                  I agree to{' '}
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text style={[typography.caption, styles.termsError]}>
                  {errors.terms}
                </Text>
              )}

              {/* Sign Up Button */}
              <Button
                title="Create Account"
                onPress={handleSignUp}
                loading={loading}
                size="lg"
                fullWidth
                style={styles.signupButton}
              />

              {/* Login Link */}
              <View style={styles.loginLink}>
                <Text style={[typography.body, { color: colors.white }]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={[typography.body, styles.loginLinkText]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginVertical: spacing.xl,
  },
  headerTitle: {
    color: colors.white,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    color: colors.white,
    opacity: 0.9,
  },
  form: {
    marginVertical: spacing.lg,
  },
  errorAlert: {
    flexDirection: 'row',
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  nameField: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.white,
  },
  termsText: {
    color: colors.white,
    flex: 1,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsError: {
    color: colors.error,
    marginBottom: spacing.lg,
  },
  signupButton: {
    marginVertical: spacing.xl,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginLinkText: {
    color: colors.white,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
