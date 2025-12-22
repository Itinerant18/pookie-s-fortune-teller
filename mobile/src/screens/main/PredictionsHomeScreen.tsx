import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/Button';

const PredictionsHomeScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={{ marginBottom: 20 }}>Predictions Home Screen</Text>
    <Button title="Income Forecast" onPress={() => navigation.navigate('IncomeForecast')} />
    <View style={{ height: 10 }} />
    <Button title="Health" onPress={() => navigation.navigate('Health')} />
    <View style={{ height: 10 }} />
    <Button title="Relationships" onPress={() => navigation.navigate('Relationships')} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PredictionsHomeScreen;
