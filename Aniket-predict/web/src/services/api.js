/**
 * API Service - Integrates with Node.js Backend and ML Engine
 * All API calls go through the backend which handles ML Engine communication
 */

import { supabase } from '../lib/supabase';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get the current auth token for API requests
 */
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

/**
 * Make authenticated API request to backend
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
};

// ============================================================================
// PREDICTIONS API
// ============================================================================

export const predictionsApi = {
  /**
   * Get all predictions for the authenticated user
   */
  getAll: async (filters = {}) => {
    const { category, timeframe } = filters;
    let endpoint = '/api/predictions';
    const params = new URLSearchParams();
    
    if (category && category !== 'all') params.append('category', category);
    if (timeframe) params.append('timeframe', timeframe);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return apiRequest(endpoint);
  },

  /**
   * Get a single prediction by ID
   */
  getById: async (predictionId) => {
    return apiRequest(`/api/predictions/${predictionId}`);
  },

  /**
   * Generate a new prediction (calls ML Engine through backend)
   */
  generate: async ({ category, timeframe }) => {
    return apiRequest('/api/predictions/generate', {
      method: 'POST',
      body: JSON.stringify({ category, timeframe }),
    });
  },

  /**
   * Submit feedback for a prediction
   */
  submitFeedback: async (predictionId, feedback) => {
    return apiRequest(`/api/predictions/${predictionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  },
};

// ============================================================================
// BIRTH CHART API
// ============================================================================

export const birthChartApi = {
  /**
   * Get birth chart for authenticated user
   */
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('birth_charts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  },

  /**
   * Create or update birth chart
   */
  save: async (birthChartData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const chartData = {
      user_id: user.id,
      birth_date: birthChartData.birthDate,
      birth_time: birthChartData.birthTime,
      birth_location_name: birthChartData.birthPlace,
      birth_location_lat: birthChartData.birthLat,
      birth_location_lng: birthChartData.birthLon,
      birth_time_accuracy: birthChartData.birthTimeAccuracy || 'exact',
    };

    // Check if chart exists
    const { data: existing } = await supabase
      .from('birth_charts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existing) {
      // Update existing chart
      result = await supabase
        .from('birth_charts')
        .update({ ...chartData, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Insert new chart
      result = await supabase
        .from('birth_charts')
        .insert(chartData)
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  },

  /**
   * Calculate birth chart via ML Engine (through backend)
   */
  calculate: async () => {
    return apiRequest('/api/birth-chart/calculate', {
      method: 'POST',
    });
  },
};

// ============================================================================
// USER PROFILE API
// ============================================================================

export const profileApi = {
  /**
   * Get user profile
   */
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  },

  /**
   * Create or update user profile
   */
  update: async (profileData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    // Check if profile exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('user_profiles')
        .insert({ id: user.id, ...updateData })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  },

  /**
   * Complete onboarding
   */
  completeOnboarding: async ({ fullName, gender, birthChartData }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Start transaction-like operation
    try {
      // 1. Save birth chart
      await birthChartApi.save(birthChartData);

      // 2. Update profile with name and gender
      const names = fullName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          gender,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // 3. Call backend to calculate birth chart via ML
      try {
        await birthChartApi.calculate();
      } catch (mlError) {
        console.warn('ML calculation pending:', mlError.message);
        // Non-blocking - we still complete onboarding
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

// ============================================================================
// HEALTH METRICS API
// ============================================================================

export const healthApi = {
  /**
   * Get user health metrics history
   */
  getMetrics: async (limit = 30) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  },

  /**
   * Save health metrics
   */
  saveMetrics: async (metrics) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const metricData = {
      user_id: user.id,
      ...metrics,
      recorded_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_metrics')
      .insert(metricData)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  /**
   * Get stress analysis from ML Engine (through backend)
   */
  analyzeStress: async (metrics) => {
    return apiRequest('/api/health/analyze-stress', {
      method: 'POST',
      body: JSON.stringify(metrics),
    });
  },
};

// ============================================================================
// INCOME FORECAST API
// ============================================================================

export const incomeApi = {
  /**
   * Get income forecast from ML Engine
   */
  getForecast: async (period = '6m') => {
    return apiRequest(`/api/income/forecast?period=${period}`);
  },

  /**
   * Get income history
   */
  getHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_metrics')
      .select('income, recorded_at')
      .eq('user_id', user.id)
      .not('income', 'is', null)
      .order('recorded_at', { ascending: false })
      .limit(12);

    if (error) throw error;
    return { success: true, data };
  },
};

// ============================================================================
// GEOCODING API (for location search)
// ============================================================================

export const geocodingApi = {
  /**
   * Search for locations - calls backend geocoding endpoint
   * Falls back to mock data if backend is unavailable
   */
  search: async (query) => {
    try {
      const response = await apiRequest(`/api/geocode/search?q=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      console.warn('Geocoding API unavailable, using mock data');
      // Return mock data as fallback
      return { success: true, data: [] };
    }
  },
};

// Export all APIs
export default {
  predictions: predictionsApi,
  birthChart: birthChartApi,
  profile: profileApi,
  health: healthApi,
  income: incomeApi,
  geocoding: geocodingApi,
};
