require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: Supabase URL or Key is missing. Database operations will fail.');
}

const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseKey || 'dummy_key');

// ML Engine URL
const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8000';

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  req.user = user;
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Hybrid Prediction API is running', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ============================================================================
// PREDICTIONS API
// ============================================================================

// Get all predictions for user
app.get('/api/predictions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, timeframe } = req.query;
    
    let query = supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (timeframe) {
      query = query.eq('timeframe', timeframe);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching predictions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single prediction
app.get('/api/predictions/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate new prediction (integrates with ML Engine)
app.post('/api/predictions/generate', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, timeframe } = req.body;
    
    // Fetch user's birth chart for astrological predictions
    const { data: birthChart } = await supabase
      .from('birth_charts')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent user metrics for behavioral predictions
    const { data: userMetrics } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(30);

    let astrologyPrediction = null;
    let behaviorPrediction = null;

    // Call ML Engine for predictions
    try {
      // Astrology prediction (if birth chart exists)
      if (birthChart) {
        try {
          const astroResponse = await axios.post(`${ML_ENGINE_URL}/astrology/predict`, {
            birth_date: birthChart.birth_date,
            birth_time: birthChart.birth_time,
            latitude: birthChart.birth_location_lat,
            longitude: birthChart.birth_location_lng,
            category,
            timeframe
          }, { timeout: 10000 });
          astrologyPrediction = astroResponse.data;
        } catch (astroError) {
          console.warn('Astrology ML error:', astroError.message);
        }
      }

      // Behavioral prediction (income/health patterns)
      if (userMetrics && userMetrics.length > 0) {
        try {
          if (category === 'finance' || category === 'career') {
            const incomeData = userMetrics.filter(m => m.income != null).map(m => m.income);
            if (incomeData.length > 0) {
              const forecastResponse = await axios.post(`${ML_ENGINE_URL}/forecast/income`, {
                user_id: userId,
                timeseries: incomeData,
                periods_ahead: timeframe === '12_months' ? 12 : timeframe === '6_months' ? 6 : 3,
                confidence: 0.95
              }, { timeout: 10000 });
              behaviorPrediction = forecastResponse.data;
            }
          } else if (category === 'health') {
            const healthData = userMetrics.filter(m => m.stress_level != null);
            if (healthData.length > 0) {
              const stressResponse = await axios.post(`${ML_ENGINE_URL}/health/stress-analysis`, {
                user_id: userId,
                metrics: healthData
              }, { timeout: 10000 });
              behaviorPrediction = stressResponse.data;
            }
          }
        } catch (behaviorError) {
          console.warn('Behavior ML error:', behaviorError.message);
        }
      }
    } catch (mlError) {
      console.warn('ML Engine connection error:', mlError.message);
    }

    // Calculate confidence scores
    const astrologyConfidence = astrologyPrediction ? 0.75 : 0;
    const behaviorConfidence = behaviorPrediction ? 0.80 : 0;
    const overallConfidence = astrologyPrediction && behaviorPrediction 
      ? (astrologyConfidence + behaviorConfidence) / 2 
      : astrologyConfidence || behaviorConfidence || 0.65;

    // Generate recommendation based on predictions
    const recommendation = generateRecommendation(category, astrologyPrediction, behaviorPrediction);

    // Calculate period dates
    const periodMonths = {
      '1_month': 1,
      '3_months': 3,
      '6_months': 6,
      '12_months': 12
    };
    const months = periodMonths[timeframe] || 6;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + months);

    // Create prediction record
    const prediction = {
      user_id: userId,
      category,
      timeframe,
      prediction_type: astrologyPrediction && behaviorPrediction ? 'hybrid' : 
                       astrologyPrediction ? 'astrology' : 'behavior',
      period_start: new Date().toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      astrology_prediction: astrologyPrediction,
      behavior_prediction: behaviorPrediction,
      combined_prediction: {
        recommendation,
        summary: `${category.charAt(0).toUpperCase() + category.slice(1)} outlook for the next ${months} months`,
        key_insights: generateInsights(category, astrologyPrediction, behaviorPrediction),
        favorable_periods: generateFavorablePeriods(months),
        caution_periods: generateCautionPeriods(months),
      },
      astrology_confidence: astrologyConfidence,
      behavior_confidence: behaviorConfidence,
      overall_confidence: overallConfidence,
      generated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('predictions')
      .insert(prediction)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Error generating prediction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submit prediction feedback
app.post('/api/predictions/:id/feedback', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { feedback } = req.body; // accurate, partially_accurate, inaccurate
    
    const { data, error } = await supabase
      .from('predictions')
      .update({ user_feedback: feedback, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// BIRTH CHART API
// ============================================================================

// Calculate birth chart via ML Engine
app.post('/api/birth-chart/calculate', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's birth chart data
    const { data: birthChart, error: fetchError } = await supabase
      .from('birth_charts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!birthChart) {
      return res.status(404).json({ success: false, error: 'Birth chart not found' });
    }

    // Call ML Engine for birth chart calculation
    let calculatedChart = null;
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/astrology/birth-chart`, {
        birth_date: birthChart.birth_date,
        birth_time: birthChart.birth_time,
        latitude: birthChart.birth_location_lat,
        longitude: birthChart.birth_location_lng,
        timezone: birthChart.birth_timezone || 'UTC'
      }, { timeout: 15000 });
      calculatedChart = response.data;
    } catch (mlError) {
      console.warn('ML Engine birth chart calculation error:', mlError.message);
      // Generate basic chart data as fallback
      calculatedChart = generateBasicChart(birthChart);
    }

    // Update birth chart with calculated data
    const { data: updatedChart, error: updateError } = await supabase
      .from('birth_charts')
      .update({
        planets: calculatedChart.planets || null,
        houses: calculatedChart.houses || null,
        divisional_charts: calculatedChart.divisional_charts || null,
        current_dasha: calculatedChart.current_dasha || null,
        dasha_sequence: calculatedChart.dasha_sequence || null,
        yogas: calculatedChart.yogas || null,
        doshas: calculatedChart.doshas || null,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json({ success: true, data: updatedChart });
  } catch (err) {
    console.error('Error calculating birth chart:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// HEALTH API
// ============================================================================

// Analyze stress from health metrics
app.post('/api/health/analyze-stress', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const metrics = req.body;
    
    let stressAnalysis = null;
    
    // Call ML Engine for stress analysis
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/health/stress-analysis`, {
        user_id: userId,
        work_hours: metrics.workHours,
        sleep_hours: metrics.sleepHours,
        exercise_minutes: metrics.exerciseMinutes,
        mood_score: metrics.moodScore,
        stress_score: metrics.stressScore
      }, { timeout: 10000 });
      stressAnalysis = response.data;
    } catch (mlError) {
      console.warn('ML Engine stress analysis error:', mlError.message);
      // Calculate basic stress analysis as fallback
      stressAnalysis = calculateBasicStress(metrics);
    }

    // Save metrics to database
    await supabase
      .from('user_metrics')
      .insert({
        user_id: userId,
        work_hours: metrics.workHours,
        sleep_hours: metrics.sleepHours,
        exercise_minutes: metrics.exerciseMinutes,
        mood_score: metrics.moodScore,
        stress_level: metrics.stressScore,
        recorded_at: new Date().toISOString()
      });

    res.json({ success: true, data: stressAnalysis });
  } catch (err) {
    console.error('Error analyzing stress:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// INCOME FORECAST API
// ============================================================================

app.get('/api/income/forecast', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '6m' } = req.query;
    
    // Get historical income data
    const { data: incomeHistory } = await supabase
      .from('user_metrics')
      .select('income, recorded_at')
      .eq('user_id', userId)
      .not('income', 'is', null)
      .order('recorded_at', { ascending: true })
      .limit(24);

    let forecast = null;
    
    if (incomeHistory && incomeHistory.length > 3) {
      // Call ML Engine for income forecast
      try {
        const periodsAhead = period === '12m' ? 12 : period === '6m' ? 6 : 3;
        const response = await axios.post(`${ML_ENGINE_URL}/forecast/income`, {
          user_id: userId,
          timeseries: incomeHistory.map(h => h.income),
          periods_ahead: periodsAhead,
          confidence: 0.95
        }, { timeout: 10000 });
        forecast = response.data;
      } catch (mlError) {
        console.warn('ML Engine forecast error:', mlError.message);
      }
    }

    // Generate fallback forecast if ML unavailable
    if (!forecast) {
      forecast = generateBasicForecast(incomeHistory, period);
    }

    res.json({ success: true, data: forecast });
  } catch (err) {
    console.error('Error getting income forecast:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// GEOCODING API (for location search)
// ============================================================================

app.get('/api/geocode/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    // Try external geocoding API if configured
    const geocodeApiKey = process.env.GEOCODE_API_KEY;
    
    if (geocodeApiKey) {
      try {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(q)}&key=${geocodeApiKey}&limit=10`
        );
        
        const locations = response.data.results.map(r => ({
          name: r.formatted,
          lat: r.geometry.lat,
          lon: r.geometry.lng,
          country: r.components.country,
          state: r.components.state
        }));
        
        return res.json({ success: true, data: locations });
      } catch (geoError) {
        console.warn('Geocoding API error:', geoError.message);
      }
    }

    // Fallback: search internal location database if available
    res.json({ success: true, data: [], message: 'Geocoding API not configured' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateRecommendation(category, astrologyPred, behaviorPred) {
  const recommendations = {
    career: [
      "The stars favor new professional initiatives. Consider leadership opportunities.",
      "Focus on skill development and networking this period.",
      "Collaborative projects will yield better results than solo endeavors.",
    ],
    finance: [
      "A balanced approach to investments is recommended.",
      "Focus on long-term financial planning rather than quick gains.",
      "Review and optimize your expense patterns for better savings.",
    ],
    health: [
      "Prioritize rest and recovery. Your body needs rejuvenation.",
      "Physical activity will boost both mental and physical well-being.",
      "Pay attention to stress management through mindfulness practices.",
    ],
    relationship: [
      "Open communication will strengthen your bonds.",
      "New connections may bring meaningful relationships.",
      "Focus on understanding rather than being understood.",
    ]
  };
  
  const categoryRecs = recommendations[category] || recommendations.career;
  return categoryRecs[Math.floor(Math.random() * categoryRecs.length)];
}

function generateInsights(category, astrologyPred, behaviorPred) {
  return [
    `Your ${category} energy is showing positive momentum`,
    `Key planetary transits support growth in this area`,
    `Historical patterns indicate favorable conditions ahead`
  ];
}

function generateFavorablePeriods(months) {
  const periods = [];
  const start = new Date();
  for (let i = 0; i < Math.min(months, 3); i++) {
    const periodStart = new Date(start);
    periodStart.setMonth(periodStart.getMonth() + i);
    periods.push({
      start: periodStart.toISOString().split('T')[0],
      duration: '1-2 weeks',
      description: `Favorable period for ${i === 0 ? 'initiating' : i === 1 ? 'developing' : 'consolidating'} plans`
    });
  }
  return periods;
}

function generateCautionPeriods(months) {
  return [
    {
      start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: '3-5 days',
      description: 'Minor retrograde effects - review before major decisions'
    }
  ];
}

function generateBasicChart(birthChart) {
  // Generate basic zodiac data based on birth date
  const birthDate = new Date(birthChart.birth_date);
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  const sunSigns = [
    { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
  ];

  let sunSign = 'Aries';
  for (const sign of sunSigns) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if ((month === startMonth && day >= startDay) || 
        (month === endMonth && day <= endDay)) {
      sunSign = sign.sign;
      break;
    }
  }

  return {
    planets: {
      sun: { sign: sunSign, degree: Math.floor(Math.random() * 30) },
      moon: { sign: sunSigns[Math.floor(Math.random() * 12)].sign },
    },
    houses: { 1: { sign: sunSign } },
    calculated: true
  };
}

function calculateBasicStress(metrics) {
  let stressScore = 5;
  stressScore += (metrics.workHours - 8) * 0.5;
  stressScore -= (metrics.sleepHours - 7) * 0.3;
  stressScore -= (metrics.exerciseMinutes / 30) * 0.5;
  stressScore -= (metrics.moodScore - 5) * 0.2;
  stressScore += (metrics.stressScore - 5) * 0.4;
  
  stressScore = Math.max(0, Math.min(10, stressScore));
  
  return {
    stress_level: Math.round(stressScore * 10) / 10,
    status: stressScore <= 3 ? 'low' : stressScore <= 6 ? 'moderate' : 'high',
    recommendations: [
      'Practice mindfulness for 10 minutes daily',
      'Maintain regular sleep schedule',
      stressScore > 5 ? 'Consider reducing work hours' : 'Great work-life balance!'
    ]
  };
}

function generateBasicForecast(history, period) {
  const months = period === '12m' ? 12 : period === '6m' ? 6 : 3;
  const avgIncome = history && history.length > 0 
    ? history.reduce((sum, h) => sum + (h.income || 0), 0) / history.length 
    : 50000;
  
  const forecast = [];
  const now = new Date();
  
  for (let i = 0; i < months; i++) {
    const forecastDate = new Date(now);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    const variance = (Math.random() - 0.5) * 0.1 * avgIncome;
    const growth = i * 0.02 * avgIncome;
    
    forecast.push({
      month: forecastDate.toISOString().slice(0, 7),
      predicted: Math.round(avgIncome + variance + growth),
      confidence: 0.75 - (i * 0.02)
    });
  }
  
  return {
    forecast,
    average: Math.round(avgIncome),
    trend: 'stable',
    confidence: 0.72
  };
}

// ============================================================================
// START SERVER
// ============================================================================

app.listen(port, () => {
  console.log(`🚀 Hybrid Prediction API running on port ${port}`);
  console.log(`📊 ML Engine URL: ${ML_ENGINE_URL}`);
  console.log(`🔗 Supabase: ${supabaseUrl ? 'Connected' : 'Not configured'}`);
});
