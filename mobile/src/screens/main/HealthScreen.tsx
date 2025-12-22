import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HealthScreen = () => (
  <View style={styles.container}>
    <Text>Health Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default HealthScreen;
