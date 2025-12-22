// mobile/src/components/Input.tsx

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { sizes } from '../theme/sizes';
import { typography } from '../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: any; // Avoiding strict type for icon name to prevent build errors
  rightIcon?: any;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  type?: 'text' | 'email' | 'password' | 'phone' | 'number';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getInputKeyboardType = () => {
    const keyboardTypes = {
      text: 'default',
      email: 'email-address',
      password: 'default',
      phone: 'phone-pad',
      number: 'decimal-pad',
    };
    return keyboardTypes[type] || 'default';
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[typography.label, styles.label]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={sizes.iconMedium}
            color={colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, typography.body]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={type === 'password' && !isPasswordVisible}
          keyboardType={getInputKeyboardType() as any}
          {...props}
        />

        {type === 'password' && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={sizes.iconMedium}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && type !== 'password' && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={rightIcon}
              size={sizes.iconMedium}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[typography.caption, styles.error]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.input.height,
    backgroundColor: colors.bgSecondary,
    borderRadius: sizes.radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputContainerError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  rightIcon: {
    marginLeft: spacing.md,
    padding: spacing.sm,
  },
  error: {
    color: colors.error,
    marginTop: spacing.xs,
  },
});
