import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const predictionService = {
  generate: async (category: string, timeframe: string) => {
    const response = await api.post('/predictions/generate', { category, timeframe });
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/predictions');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/predictions/${id}`);
    return response.data;
  }
};

export default api;
