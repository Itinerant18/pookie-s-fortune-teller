// mobile/src/screens/onboarding/CompleteProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import { supabase } from '../../services/supabase';

const CompleteProfileScreen = ({ navigation, route }: any) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Extract params passed from BirthChartScreen
  const { birthDate, location, coords } = route.params || {};

  useEffect(() => {
      console.log("CompleteProfile received params:", { birthDate, location, coords });
  }, [route.params]);

  const handleComplete = async () => {
    if (!name || !gender) {
        Alert.alert("Missing Info", "Please enter your name and gender.");
        return;
    }

    // Instead of saving, we pass all data to the SignUp screen to create the account
    console.log("VERSION 2: Forwarding data to SignUp:", { 
        ...route.params, 
        displayName: name, 
        gender 
    });

    navigation.navigate('SignUp', {
        ...route.params, // birthDate, location, coords
        displayName: name,
        gender: gender
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
         {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        <Text style={styles.title}>
          Almost Done!
        </Text>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Alex"
                placeholderTextColor="#666666" 
                value={name}
                onChangeText={setName}
            />
        </View>

        <View style={styles.inputGroup}>
             <Text style={styles.label}>Gender</Text>
             <View style={styles.genderRow}>
                 {['Male', 'Female', 'Other'].map((opt) => (
                     <TouchableOpacity
                        key={opt}
                        style={[
                            styles.genderOption,
                            gender === opt && styles.genderOptionSelected
                        ]}
                        onPress={() => setGender(opt)}
                     >
                         <Text style={[
                             styles.genderText,
                             gender === opt && styles.genderTextSelected
                         ]}>{opt}</Text>
                     </TouchableOpacity>
                 ))}
             </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (!name || !gender) && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading || !name || !gender}
        >
          {loading ? (
              <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
                Create Account
            </Text>
          )}
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
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A85047', // Secondary Color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  inputGroup: {
      marginBottom: 20,
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: '#333333',
  },
  input: {
      borderWidth: 1,
      borderColor: '#CCCCCC',
      borderRadius: 8,
      backgroundColor: '#FAFAFA',
      padding: 15,
      fontSize: 16,
      color: '#000000', // Force Black
  },
  genderRow: {
      flexDirection: 'row',
      gap: 10,
  },
  genderOption: {
      flex: 1,
      padding: 15,
      borderWidth: 1,
      borderColor: '#CCCCCC',
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: '#FAFAFA',
  },
  genderOptionSelected: {
      borderColor: '#208095', // Primary
      backgroundColor: '#208095', // Use Solid Color for High Contrast
  },
  genderText: {
      color: '#333333',
      fontSize: 16,
  },
  genderTextSelected: {
      color: '#FFFFFF', // White text on Teal bg
      fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#208095', // Primary
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
      backgroundColor: '#CCCCCC',
      opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CompleteProfileScreen;
