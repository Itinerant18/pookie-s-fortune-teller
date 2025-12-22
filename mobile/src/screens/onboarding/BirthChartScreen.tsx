// mobile/src/screens/onboarding/BirthChartScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { sizes } from '../../theme/sizes';

interface CityResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

const BirthChartOnboardingScreen = ({ navigation }: any) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Location Picker State
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState<{lat: string, lon: string} | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search
  useEffect(() => {
     const delayDebounceFn = setTimeout(() => {
        if (searchQuery.length > 2) {
            searchCities(searchQuery);
        } else {
            setSearchResults([]);
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchCities = async (query: string) => {
      setIsSearching(true);
      try {
          const response = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=en&limit=5`
          );
          const data = await response.json();
          setSearchResults(data);
      } catch (error) {
          console.error("Error searching cities", error);
      } finally {
          setIsSearching(false);
      }
  };

  const handleSelectCity = (city: CityResult) => {
      setLocationName(city.display_name);
      setLocationCoords({ lat: city.lat, lon: city.lon });
      setShowLocationModal(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleContinue = () => {
      console.log("Continue pressed. Data:", { date, locationName });
      if (!locationName) {
          Alert.alert("Missing Information", "Please select a birthplace.");
          return;
      }
      try {
        navigation.navigate('CompleteProfile', { 
            birthDate: date.toISOString(), 
            location: locationName,
            coords: locationCoords
        });
      } catch (err) {
          console.error("Navigation error:", err);
          Alert.alert("Error", "Could not navigate to next screen.");
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Birth Details</Text>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          {Platform.OS === 'web' ? (
             <View style={styles.webInputWrapper}>
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    style={{ width: '100%', opacity: 1 }}
                />
             </View>
          ) : (
            <>
                <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#000" />
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}
            </>
          )}
        </View>

        {/* Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time of Birth</Text>
          {Platform.OS === 'web' ? (
              <View style={styles.webInputWrapper}>
                <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                    style={{ width: '100%' }}
                />
              </View>
          ) : (
            <>
                <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowTimePicker(true)}
                >
                    <Text style={styles.inputText}>
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Ionicons name="time-outline" size={20} color="#000" />
                </TouchableOpacity>

                {showTimePicker && (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onTimeChange}
                    />
                )}
            </>
          )}
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Location</Text>
          <TouchableOpacity 
             style={styles.inputWrapper}
             onPress={() => setShowLocationModal(true)}
          >
            <Text style={styles.inputText} numberOfLines={1}>
                {locationName || 'Tap to search city...'}
            </Text>
             <Ionicons name="location-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Location</Text>
                <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search City..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                />
            </View>

            <FlatList
                data={searchResults}
                keyExtractor={(item) => item.place_id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.resultItem}
                        onPress={() => handleSelectCity(item)}
                    >
                        <Text style={styles.resultText}>{item.display_name}</Text>
                    </TouchableOpacity>
                )}
             />
          </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      backgroundColor: '#f9f9f9',
      padding: 15,
  },
  webInputWrapper: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      padding: 10,
  },
  inputText: {
      fontSize: 16,
      color: '#000',
      flex: 1,
  },
  button: {
    backgroundColor: '#208095',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal
  modalContainer: {
      flex: 1,
      backgroundColor: '#fff',
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
  },
  searchContainer: {
      padding: 15,
      backgroundColor: '#f5f5f5',
  },
  searchInput: {
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
      color: '#000',
      borderWidth: 1,
      borderColor: '#ddd',
  },
  resultItem: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  },
  resultText: {
      fontSize: 16,
      color: '#333',
  },
});

export default BirthChartOnboardingScreen;
