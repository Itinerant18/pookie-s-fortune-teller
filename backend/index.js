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

// Auth Middleware
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

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hybrid Prediction API is running' });
});

// Example: Get user predictions
app.get('/api/predictions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Example: Create prediction (stub for ML integration)
app.post('/api/predictions/generate', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, timeframe } = req.body;
    
    // Call ML Engine
    const mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8000';
    let predictionData = {};

    try {
      // Example: Call forecast (simulated mapping based on category)
      // In a real app, you'd map category to specific ML endpoints
      if (category === 'career' || category === 'finance') {
         const response = await axios.post(`${mlEngineUrl}/forecast/income`, {
             timeseries: [], // You would fetch user metrics here
             periods_ahead: 6,
             confidence: 0.95
         });
         predictionData.behavior = response.data;
      }
      
      // For astrology
      // const astroResponse = await axios.post(`${mlEngineUrl}/astrology/birth-chart`, ...);
      
    } catch (mlError) {
      console.error('ML Engine Error:', mlError.message);
      // Fallback or error handling
    }
    
    // Construct final prediction object
    const prediction = {
      user_id: userId,
      category,
      timeframe,
      prediction_type: 'hybrid',
      period_start: new Date(),
      period_end: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // +6 months
      combined_prediction: {
        recommendation: "Hybrid recommendation generated via ML Engine & Backend",
        confidence: 0.85,
        details: predictionData
      }
    };

    const { data, error } = await supabase
      .from('predictions')
      .insert(prediction)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
