import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
