// mobile/src/screens/auth/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { supabase } from '../../services/supabase';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrors({ auth: error.message });
    } catch (error) {
      setErrors({ auth: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']} // Deep Space Gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <View style={styles.iconCircle}>
                <Ionicons name="planet" size={50} color="#4ECDC4" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Glass Card */}
          <View style={styles.card}>
            
            {errors.auth && (
              <View style={styles.errorBox}>
                 <Text style={styles.errorText}>{errors.auth}</Text>
              </View>
            )}

            {/* Inputs - Solid White for max visibility */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput 
                        style={styles.input}
                        placeholder="name@example.com"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput 
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
                {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
            </View>

             <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{alignSelf: 'flex-end', marginBottom: 20}}>
                <Text style={{color: '#4ECDC4', fontWeight: 'bold'}}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.loginBtnText}>SIGN IN</Text>}
            </TouchableOpacity>

          </View>

          <View style={styles.footer}>
              <Text style={{color: '#FFF'}}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={{color: '#4ECDC4', fontWeight: 'bold'}}>Sign Up</Text>
              </TouchableOpacity>
          </View>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 25, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  iconCircle: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#CCC' },
  card: {
      backgroundColor: 'rgba(255,255,255,0.1)', // Glassy
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  inputGroup: { marginBottom: 15 },
  label: { color: '#E0E0E0', marginBottom: 8, fontSize: 14, fontWeight: '600', marginLeft: 5 },
  inputWrapper: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#FFFFFF', // OPAQUE WHITE
      borderRadius: 12,
      height: 55,
      paddingHorizontal: 15,
      // Shadow for pop
      shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#000000', fontSize: 16, height: '100%' }, // BLACK TEXT
  fieldError: { color: '#FF6B6B', fontSize: 12, marginTop: 4, marginLeft: 5 },
  errorBox: { backgroundColor: '#FF6B6B20', padding: 10, borderRadius: 8, marginBottom: 15 },
  errorText: { color: '#FF6B6B' },
  loginBtn: {
      backgroundColor: '#4ECDC4', // Bright Teal
      height: 55, borderRadius: 12,
      justifyContent: 'center', alignItems: 'center',
      marginTop: 10,
      shadowColor: "#4ECDC4", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  loginBtnText: { color: '#000000', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }, // Black text on Teal
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
});

export default LoginScreen;
