// mobile/src/navigation/RootNavigator.tsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { setUser, setLoading } from '../store/authSlice'; // Import actions
import { supabase } from '../services/supabase'; // Import supabase
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { durations } from '../theme/animations'; // Import animations

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Onboarding Screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import BirthChartOnboardingScreen from '../screens/onboarding/BirthChartScreen';
import CompleteProfileScreen from '../screens/onboarding/CompleteProfileScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// App Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import BirthChartScreen from '../screens/main/BirthChartScreen';
import PredictionsHomeScreen from '../screens/main/PredictionsHomeScreen';
import IncomeForecastScreen from '../screens/main/IncomeForecastScreen';
import HealthScreen from '../screens/main/HealthScreen';
import RelationshipsScreen from '../screens/main/RelationshipsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: durations.navigation, // Use animation constant
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="BirthChart" component={BirthChartOnboardingScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}

function PredictionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary },
        animationDuration: durations.navigation,
      }}
    >
      <Stack.Screen
        name="PredictionsHome"
        component={PredictionsHomeScreen}
        options={{ title: 'Predictions' }}
      />
      <Stack.Screen
        name="IncomeForecast"
        component={IncomeForecastScreen}
        options={{ title: 'Income Forecast' }}
      />
      <Stack.Screen
        name="Health"
        component={HealthScreen}
        options={{ title: 'Health Insights' }}
      />
      <Stack.Screen
        name="Relationships"
        component={RelationshipsScreen}
        options={{ title: 'Relationships' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: any = {
            Dashboard: focused ? 'home' : 'home-outline',
            BirthChart: focused ? 'pie-chart' : 'pie-chart-outline',
            Predictions: focused ? 'analytics' : 'analytics-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return (
            <Ionicons
              name={icons[route.name] || 'help-circle'}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: colors.textPrimary,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="BirthChart"
        component={BirthChartScreen}
        options={{ title: 'Birth Chart' }}
      />
      <Tab.Screen
        name="Predictions"
        component={PredictionsStack}
        options={{ title: 'Predictions', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null));
      dispatch(setLoading(false)); // Should be set to false after check
    });

    // Auth Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null));
      dispatch(setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <BottomTabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
