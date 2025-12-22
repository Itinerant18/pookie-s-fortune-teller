import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setPredictions, setLoading, setError } from '../store/predictionsSlice';
import { supabase } from '../services/supabase'; // Or your api service if different

export const usePredictions = () => {
  const dispatch = useDispatch();
  const { all, loading, error, filters } = useSelector((state: RootState) => state.predictions);

  const fetchPredictions = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      // Mock data for now, replace with actual API call
      // const { data, error } = await supabase.from('predictions').select('*');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = [
          { id: 1, title: 'Income Rise', period: 'Next 3 months', confidence: 85, description: 'High chance of promotion or bonus.', tags: ['Income', 'Career'], value: 85 },
          { id: 2, title: 'Health Alert', period: 'Active', confidence: 65, description: 'Pay attention to digestion.', tags: ['Health'], value: 65 },
          { id: 3, title: 'New Connection', period: 'Next 2 weeks', confidence: 75, description: 'A helpful connection will appear.', tags: ['Relationship'], value: 75 },
      ];

      dispatch(setPredictions(mockData));
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  }, [dispatch]);

  return {
    predictions: all,
    loading,
    error,
    fetchPredictions,
    filters // Export if needed
  };
};
