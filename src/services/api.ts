// API service for predictions - works with mock data or real backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ML_ENGINE_URL = import.meta.env.VITE_ML_ENGINE_URL || 'http://localhost:8000';

// Categories matching your ML engine
export const PREDICTION_CATEGORIES = {
  career: { label: 'Career', icon: '💼', description: 'Professional growth & opportunities' },
  finance: { label: 'Finance', icon: '💰', description: 'Income & wealth predictions' },
  health: { label: 'Health', icon: '❤️', description: 'Wellness & vitality insights' },
  relationship: { label: 'Relationships', icon: '💕', description: 'Love & connections' },
} as const;

export const TIMEFRAMES = {
  '1_month': { label: '1 Month', days: 30 },
  '3_months': { label: '3 Months', days: 90 },
  '6_months': { label: '6 Months', days: 180 },
  '12_months': { label: '1 Year', days: 365 },
} as const;

export type PredictionCategory = keyof typeof PREDICTION_CATEGORIES;
export type Timeframe = keyof typeof TIMEFRAMES;

export interface Prediction {
  id: string;
  category: PredictionCategory;
  timeframe: Timeframe;
  prediction_type: 'astrology' | 'behavior' | 'hybrid';
  period_start: string;
  period_end: string;
  astrology_prediction?: Record<string, any>;
  behavior_prediction?: Record<string, any>;
  combined_prediction: {
    recommendation: string;
    confidence: number;
    details?: Record<string, any>;
  };
  overall_confidence: number;
  created_at: string;
}

export interface BirthChart {
  id: string;
  birth_date: string;
  birth_time?: string;
  birth_location_name?: string;
  birth_location_lat?: number;
  birth_location_lng?: number;
  planets?: Record<string, any>;
  houses?: Record<string, any>;
  current_dasha?: Record<string, any>;
  yogas?: string[];
  doshas?: Record<string, any>[];
}

// Helper to get auth headers from localStorage
function getAuthHeaders(): HeadersInit {
  const stored = localStorage.getItem('pookie_auth_user');
  const user = stored ? JSON.parse(stored) : null;
  return {
    'Content-Type': 'application/json',
    ...(user?.id && { 'X-User-Id': user.id }),
  };
}

// Backend API calls (Node.js backend)
export const predictionService = {
  async generate(category: PredictionCategory, timeframe: Timeframe): Promise<Prediction> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/predictions/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ category, timeframe }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate prediction');
    }
    
    const data = await response.json();
    return data.data;
  },

  async getAll(): Promise<Prediction[]> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/predictions`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch predictions');
    }
    
    const data = await response.json();
    return data.data;
  },

  async getById(id: string): Promise<Prediction> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/predictions/${id}`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch prediction');
    }
    
    const data = await response.json();
    return data.data;
  },
};

// ML Engine API calls (Python FastAPI)
export const mlService = {
  async getIncomeForecast(timeseries: { date: string; value: number }[], periodsAhead: number = 6) {
    const response = await fetch(`${ML_ENGINE_URL}/forecast/income`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeseries,
        periods_ahead: periodsAhead,
        confidence: 0.95,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get income forecast');
    }
    
    return response.json();
  },

  async getBirthChart(birthDatetime: string, latitude: number, longitude: number) {
    const response = await fetch(`${ML_ENGINE_URL}/astrology/birth-chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birth_datetime: birthDatetime,
        latitude,
        longitude,
        timezone_offset: 5.5, // IST default
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to calculate birth chart');
    }
    
    return response.json();
  },

  async getHealthRisk(metricsHistory: Record<string, any>[]) {
    const response = await fetch(`${ML_ENGINE_URL}/health/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics_history: metricsHistory }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to predict health risk');
    }
    
    return response.json();
  },

  async getRelationshipCompatibility(chart1: Record<string, any>, chart2: Record<string, any>) {
    const response = await fetch(`${ML_ENGINE_URL}/relationships/compatibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chart1, chart2 }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to calculate compatibility');
    }
    
    return response.json();
  },

  async healthCheck() {
    const response = await fetch(`${ML_ENGINE_URL}/health`);
    return response.json();
  },
};

// Mock data generator for when backend is not available
export function generateMockPrediction(category: PredictionCategory, timeframe: Timeframe): Prediction {
  const now = new Date();
  const endDate = new Date(now.getTime() + TIMEFRAMES[timeframe].days * 24 * 60 * 60 * 1000);
  
  const predictions: Record<PredictionCategory, string[]> = {
    career: [
      "A significant career opportunity awaits. Your planetary alignments suggest professional growth.",
      "Focus on skill development this period. Saturn's influence brings discipline.",
      "Leadership roles may emerge. Jupiter favors your professional house.",
    ],
    finance: [
      "Financial stability is indicated. Consider investments during Venus transit.",
      "Multiple income streams may develop. Mercury supports financial communications.",
      "Unexpected gains possible. The 2nd house shows positive transits.",
    ],
    health: [
      "Focus on mental wellness. Moon's position suggests emotional care needed.",
      "Physical vitality improves. Mars energizes your health sector.",
      "Balance is key. Your current Dasha supports holistic healing.",
    ],
    relationship: [
      "Deepening connections ahead. Venus blesses your 7th house.",
      "Communication improves in relationships. Mercury aids understanding.",
      "New meaningful connections possible. Jupiter expands your social circle.",
    ],
  };

  const randomPrediction = predictions[category][Math.floor(Math.random() * predictions[category].length)];
  
  return {
    id: crypto.randomUUID(),
    category,
    timeframe,
    prediction_type: 'hybrid',
    period_start: now.toISOString(),
    period_end: endDate.toISOString(),
    combined_prediction: {
      recommendation: randomPrediction,
      confidence: 0.75 + Math.random() * 0.20,
      details: {
        astrology: { influence: 'positive', transit: 'favorable' },
        behavior: { trend: 'upward', stability: 'moderate' },
      },
    },
    overall_confidence: 0.75 + Math.random() * 0.20,
    created_at: now.toISOString(),
  };
}
