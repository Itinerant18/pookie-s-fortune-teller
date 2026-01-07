import { useState, useEffect, useCallback } from 'react';
import { 
  predictionService, 
  Prediction, 
  PredictionCategory, 
  Timeframe,
  generateMockPrediction 
} from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all predictions
  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await predictionService.getAll();
      setPredictions(data);
    } catch (err) {
      // Fallback to empty array if backend not available
      console.warn('Backend not available, using local state');
      setError('Could not fetch predictions from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate a new prediction
  const generatePrediction = useCallback(async (
    category: PredictionCategory, 
    timeframe: Timeframe
  ): Promise<Prediction | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prediction = await predictionService.generate(category, timeframe);
      setPredictions(prev => [prediction, ...prev]);
      toast({
        title: "Prediction Generated",
        description: "Your cosmic insights have been revealed!",
      });
      return prediction;
    } catch (err) {
      // Use mock data if backend not available
      console.warn('Backend not available, generating mock prediction');
      const mockPrediction = generateMockPrediction(category, timeframe);
      setPredictions(prev => [mockPrediction, ...prev]);
      toast({
        title: "Prediction Generated",
        description: "Your cosmic insights have been revealed! (Demo Mode)",
      });
      return mockPrediction;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Get prediction by ID
  const getPredictionById = useCallback(async (id: string): Promise<Prediction | null> => {
    // First check local state
    const local = predictions.find(p => p.id === id);
    if (local) return local;
    
    try {
      return await predictionService.getById(id);
    } catch (err) {
      console.warn('Could not fetch prediction from server');
      return null;
    }
  }, [predictions]);

  // Load predictions on mount
  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return {
    predictions,
    isLoading,
    error,
    generatePrediction,
    getPredictionById,
    refreshPredictions: fetchPredictions,
  };
}
