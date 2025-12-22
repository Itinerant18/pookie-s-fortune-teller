import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text } from 'react-native';
import { predictionService } from '../../services/api'; // Changed from supabase to predictionService
import { HybridPredictionCard } from '../../components/prediction/HybridPredictionCard';

export const HomeScreen = ({ session }: { session: any }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPredictions();
    
    // Real-time subscription
    const channel = supabase
      .channel('home-predictions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictions',
          filter: `user_id=eq.${session.user.id}`
        },
        () => fetchPredictions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPredictions();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {session.user.email?.split('@')[0]}</Text>
        <Text style={styles.subtitle}>Here are your hybrid insights</Text>
      </View>

      {predictions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No predictions generated yet.</Text>
        </View>
      ) : (
        predictions.map((pred) => (
          <HybridPredictionCard
            key={pred.id}
            category={pred.category}
            astrology={pred.astrology_prediction}
            behavior={pred.behavior_prediction}
            combined={pred.combined_prediction}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});
