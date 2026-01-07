// mobile/src/screens/main/ProfileScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { sizes } from '../../theme/sizes';
import { Card } from '../../components/Card';

const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      title: 'Change Password',
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      title: 'Privacy & Security',
      icon: 'shield-checkmark-outline',
      onPress: () => {},
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header / User Info */}
        <View style={styles.header}>
            <View style={styles.avatarContainer}>
                 <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </Text>
                 </View>
                 <TouchableOpacity style={styles.editAvatarBadge}>
                     <Ionicons name="camera" size={14} color={colors.white} />
                 </TouchableOpacity>
            </View>
            <Text style={[typography.h3, styles.userName]}>
                {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={[typography.body, styles.userEmail]}>
                {user?.email}
            </Text>
            
            <TouchableOpacity style={styles.editProfileButton}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
        </View>

        {/* Subscription Card placeholder */}
        <View style={styles.section}>
            <Card variant="filled" style={styles.premiumCard}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View>
                        <Text style={[typography.h4, {color: colors.white}]}>Premium Plan</Text>
                        <Text style={[typography.caption, {color: 'rgba(255,255,255,0.8)'}]}>Valid until Dec 2025</Text>
                    </View>
                    <Ionicons name="star" size={24} color="#FFD700" />
                </View>
            </Card>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
            <Card>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.menuItem,
                            index !== menuItems.length - 1 && styles.menuItemBorder
                        ]}
                        onPress={item.onPress}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                            </View>
                            <Text style={typography.body}>{item.title}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.grayMedium} />
                    </TouchableOpacity>
                ))}
            </Card>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
                <Text style={[typography.buttonLarge, {color: colors.error}]}>Sign Out</Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
            <Text style={[typography.caption, {color: colors.textTertiary}]}>App Version 1.0.0</Text>
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
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bgPrimary,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.white,
  },
  avatarText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: colors.primaryDark,
  },
  editAvatarBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.white,
  },
  userName: {
      color: colors.textPrimary,
      marginBottom: spacing.xs,
  },
  userEmail: {
      color: colors.textSecondary,
      marginBottom: spacing.lg,
  },
  editProfileButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: sizes.radius.full,
      borderWidth: 1,
      borderColor: colors.borderMedium,
  },
  editProfileText: {
      color: colors.textPrimary,
      fontWeight: '600',
      fontSize: 14,
  },
  section: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
  },
  premiumCard: {
      backgroundColor: colors.primary,
      borderRadius: sizes.radius.lg,
  },
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.lg,
  },
  menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
  },
  menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
  },
  iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.bgSecondary,
      justifyContent: 'center',
      alignItems: 'center',
  },
  signOutButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.lg,
      backgroundColor: colors.errorLight,
      borderRadius: sizes.radius.lg,
  },
  footer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
  },
});

export default ProfileScreen;
