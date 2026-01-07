# ML Engine - Complete Setup & Development Guide

## Python FastAPI-based Machine Learning Service for Hybrid Predictions

---

## Table of Contents

1. [ML Engine Overview](#ml-engine-overview)
2. [Project Structure](#project-structure)
3. [Installation & Setup](#installation--setup)
4. [Astrology Engine](#astrology-engine)
5. [ML Models](#ml-models)
6. [API Endpoints](#api-endpoints)
7. [Model Training](#model-training)
8. [Performance Optimization](#performance-optimization)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Monitoring](#monitoring)
12. [Troubleshooting](#troubleshooting)

---

## ML Engine Overview

### What is the ML Engine?

The ML Engine is a Python-based service running **FastAPI** that handles:

1. **Astrology Calculations** - Swiss Ephemeris based birth chart generation
2. **ML Predictions** - Time-series forecasting, classification, clustering
3. **Vector Embeddings** - AI-powered article recommendations
4. **Confidence Scoring** - Combines astrology + ML results

### Tech Stack

```
FastAPI 0.104.1          - Web framework
Python 3.10+             - Language
PyEphemeris 2.2.0        - Astrology calculations
TensorFlow 2.13          - Deep learning
Scikit-learn 1.3         - ML models
Pandas 2.0               - Data processing
Numpy 1.24               - Numerical computing
Statsmodels 0.14         - Statistical models
Pydantic 2.0             - Data validation
SQLAlchemy 2.0           - Database ORM
Redis 4.5                - Caching
PostgreSQL 15            - Persistent storage
```

---

## Project Structure

```
ml/
├── src/
│   ├── __init__.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── astrology.py      # Astrology endpoints
│   │   │   ├── forecast.py       # Forecasting endpoints
│   │   │   ├── health.py         # Health predictions
│   │   │   ├── relationships.py  # Relationship analysis
│   │   │   └── embeddings.py     # Vector search
│   │   └── models.py             # Pydantic request/response models
│   │
│   ├── engines/
│   │   ├── __init__.py
│   │   ├── astrology_engine.py   # Ephemeris calculations
│   │   ├── forecast_engine.py    # Time-series models
│   │   ├── health_engine.py      # Health predictions
│   │   └── embedding_engine.py   # Vector embeddings
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── forecast/
│   │   │   ├── prophet_model.pkl
│   │   │   ├── lstm_model.h5
│   │   │   └── xgboost_model.pkl
│   │   ├── health/
│   │   │   ├── stress_lstm.h5
│   │   │   ├── health_rf.pkl
│   │   │   └── sleep_predictor.pkl
│   │   └── embeddings/
│   │       └── sentence-transformer.pkl
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── calculations.py       # Math utilities
│   │   ├── cache.py              # Redis caching
│   │   ├── database.py           # DB operations
│   │   ├── logger.py             # Logging setup
│   │   └── validators.py         # Input validation
│   │
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py           # Config management
│   │
│   └── main.py                   # FastAPI app entry
│
├── scripts/
│   ├── train_models.py           # Model training script
│   ├── generate_embeddings.py    # Embedding generation
│   ├── validate_models.py        # Model validation
│   └── backtest.py               # Backtesting script
│
├── tests/
│   ├── __init__.py
│   ├── test_astrology.py
│   ├── test_forecast.py
│   ├── test_health.py
│   ├── conftest.py               # Pytest fixtures
│   └── fixtures/
│       └── sample_data.py
│
├── notebooks/
│   ├── astrology_analysis.ipynb
│   ├── model_training.ipynb
│   └── performance_analysis.ipynb
│
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── .dockerignore
├── .env.example
├── .gitignore
├── pytest.ini
├── setup.py
└── README.md
```

---

## Installation & Setup

### 1. Prerequisites

```bash
# Check Python version (must be 3.10+)
python --version

# Install pip, venv
python -m pip install --upgrade pip
```

### 2. Clone & Navigate

```bash
git clone https://github.com/your-org/prediction-app.git
cd prediction-app/ml
```

### 3. Create Virtual Environment

```bash
# Create venv
python -m venv venv

# Activate venv
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Verify activation (should show (venv) in prompt)
```

### 4. Install Dependencies

```bash
# Install requirements
pip install -r requirements.txt

# Install dev dependencies (for testing, notebooks)
pip install -r requirements-dev.txt
```

### 5. Environment Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

**.env file example:**

```bash
# Server
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO
PORT=8000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prediction_app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJxxx...

# Redis
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL=3600

# ML Models
MODEL_PATH=./models
MODEL_CACHE_SIZE=500

# API Keys
OPENAI_API_KEY=sk-xxx...  # For embeddings
HUGGINGFACE_API_KEY=hf_xxx...

# Logging
LOG_FILE=logs/ml_engine.log
SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
ENABLE_CACHE=True
ENABLE_MONITORING=True
BATCH_PREDICTION=True
```

### 6. Start Development Server

```bash
# Start with auto-reload
uvicorn src.main:app --reload --port 8000

# Or using Python directly
python -m uvicorn src.main:app --reload --port 8000

# Check if running
curl http://localhost:8000/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected"
}
```

---

## Astrology Engine

### Swiss Ephemeris Integration

```python
# src/engines/astrology_engine.py

from ephem import Observer, Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
from datetime import datetime
from typing import Dict, Any

class AstrologyCalculator:
    """Calculate birth charts using Swiss Ephemeris"""
    
    def __init__(self):
        self.zodiac_signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        self.nakshatras = [
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
            # ... 27 nakshatras total
        ]
    
    def calculate_birth_chart(self, birth_datetime: datetime, 
                             latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Calculate complete birth chart (Kundli)
        
        Args:
            birth_datetime: Birth date and time
            latitude: Birth location latitude
            longitude: Birth location longitude
        
        Returns:
            Dict with planets, houses, aspects, etc.
        """
        observer = Observer()
        observer.lat = str(latitude)
        observer.lon = str(longitude)
        observer.date = birth_datetime
        
        # Calculate planetary positions
        planets = {
            'sun': self._calculate_planet(Sun(observer), 'Sun'),
            'moon': self._calculate_planet(Moon(observer), 'Moon'),
            'mercury': self._calculate_planet(Mercury(observer), 'Mercury'),
            'venus': self._calculate_planet(Venus(observer), 'Venus'),
            'mars': self._calculate_planet(Mars(observer), 'Mars'),
            'jupiter': self._calculate_planet(Jupiter(observer), 'Jupiter'),
            'saturn': self._calculate_planet(Saturn(observer), 'Saturn'),
            'rahu': self._calculate_rahu(birth_datetime),
            'ketu': self._calculate_ketu(birth_datetime)
        }
        
        # Calculate houses (Bhava)
        houses = self._calculate_houses(observer)
        
        # Calculate ascendant (Lagna)
        ascendant = self._calculate_ascendant(observer)
        
        # Calculate divisional charts
        divisional_charts = {
            'd9': self._calculate_d9_chart(planets),   # Navamsha
            'd10': self._calculate_d10_chart(planets),  # Dashamsha
            'd27': self._calculate_d27_chart(planets)   # Nakshatramsha
        }
        
        # Calculate Dasha periods
        current_dasha = self._calculate_dasha(birth_datetime, planets)
        
        # Detect Yogas (auspicious combinations)
        yogas = self._detect_yogas(planets, houses, ascendant)
        
        # Detect Doshas (inauspicious combinations)
        doshas = self._detect_doshas(planets, houses)
        
        return {
            'planets': planets,
            'houses': houses,
            'ascendant': ascendant,
            'divisional_charts': divisional_charts,
            'current_dasha': current_dasha,
            'yogas': yogas,
            'doshas': doshas,
            'calculated_at': datetime.now().isoformat()
        }
    
    def _calculate_planet(self, planet_obj, name: str) -> Dict[str, Any]:
        """Convert planet object to readable format"""
        # Convert RA (Right Ascension) to zodiac sign and degree
        ra_degrees = float(planet_obj.ra) * 180 / 3.14159  # Convert radians to degrees
        
        # Normalize to 0-360
        ra_degrees = ra_degrees % 360
        
        # Get sign (0-30 Aries, 30-60 Taurus, etc.)
        sign_index = int(ra_degrees / 30)
        degree_in_sign = ra_degrees % 30
        
        return {
            'name': name,
            'sign': self.zodiac_signs[sign_index],
            'degree': round(degree_in_sign, 2),
            'house': self._get_house(ra_degrees),
            'speed': float(planet_obj._dec) if hasattr(planet_obj, '_dec') else 0,
            'retrograde': False  # Calculate retrograde status
        }
    
    def _calculate_rahu(self, birth_datetime: datetime) -> Dict[str, Any]:
        """Calculate Rahu (North Node) position"""
        # Rahu moves retrograde at ~3:11 min per day
        # Complex calculation based on birth time
        pass
    
    def _calculate_ketu(self, birth_datetime: datetime) -> Dict[str, Any]:
        """Calculate Ketu (South Node) - opposite to Rahu"""
        pass
    
    def _calculate_houses(self, observer: Observer) -> Dict[int, Dict[str, Any]]:
        """Calculate 12 houses (Bhavas)"""
        houses = {}
        # House calculation using Placidus or other house systems
        pass
    
    def _calculate_ascendant(self, observer: Observer) -> Dict[str, Any]:
        """Calculate Ascendant (Lagna)"""
        pass
    
    def _detect_yogas(self, planets: Dict, houses: Dict, ascendant: Dict) -> list:
        """Detect auspicious Yogas"""
        yogas = []
        
        # Raj Yoga: Jupiter in angular house (1, 4, 7, 10) & strong
        if planets['jupiter']['house'] in [1, 4, 7, 10]:
            yogas.append('Raj Yoga')
        
        # Gaja Kesari Yoga: Jupiter & Moon in friendly positions
        if self._are_in_favorable_positions(planets['jupiter'], planets['moon']):
            yogas.append('Gaja Kesari Yoga')
        
        # Add more yoga detections
        return yogas
    
    def _detect_doshas(self, planets: Dict, houses: Dict) -> list:
        """Detect inauspicious Doshas"""
        doshas = []
        
        # Mangal Dosha: Mars in 1, 2, 4, 7, 8, or 12
        if planets['mars']['house'] in [1, 2, 4, 7, 8, 12]:
            severity = self._calculate_mangal_dosha_severity(planets['mars'])
            doshas.append({
                'name': 'Mangal Dosha',
                'severity': severity,
                'remedies': ['Wear red coral', 'Chant Hanuman Chalisa']
            })
        
        # Kaal Sarp Dosha: Rahu-Ketu axis along nodal axis
        if self._check_kaal_sarp_dosha(planets):
            doshas.append({
                'name': 'Kaal Sarp Dosha',
                'severity': 'medium',
                'remedies': ['Perform Nag Puja', 'Wear pearl']
            })
        
        return doshas
    
    def _calculate_dasha(self, birth_datetime: datetime, planets: Dict) -> Dict[str, Any]:
        """Calculate Vimshottari Dasha periods"""
        # Get moon nakshatra position
        moon_nakshatra = self._get_nakshatra(planets['moon']['degree'])
        
        # Fixed dasha durations (in years)
        dasha_years = {
            'Sun': 6, 'Moon': 10, 'Mars': 7,
            'Mercury': 17, 'Jupiter': 16, 'Venus': 20,
            'Saturn': 19, 'Rahu': 18, 'Ketu': 7
        }
        
        # Calculate current dasha based on birth time
        current_dasha_lord = self._get_current_dasha_lord(moon_nakshatra)
        
        return {
            'current': {
                'period': f"{current_dasha_lord} Mahadasha",
                'lord': current_dasha_lord,
                'duration': dasha_years[current_dasha_lord],
                'start_date': 'calculated_date',
                'end_date': 'calculated_date'
            },
            'sequence': ['Moon', 'Mars', 'Mercury', 'Jupiter', 'Saturn', 
                        'Mercury', 'Ketu', 'Venus', 'Sun']
        }
```

### API Endpoint: Calculate Birth Chart

```python
# src/api/routes/astrology.py

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter(prefix="/astrology", tags=["astrology"])

class BirthChartRequest(BaseModel):
    birth_date: str  # YYYY-MM-DD
    birth_time: str  # HH:MM:SS
    birth_timezone: str
    latitude: float
    longitude: float
    birth_location_name: str

class BirthChartResponse(BaseModel):
    planets: Dict[str, Any]
    houses: Dict[int, Dict[str, Any]]
    ascendant: Dict[str, Any]
    divisional_charts: Dict[str, Dict[str, Any]]
    current_dasha: Dict[str, Any]
    yogas: list
    doshas: list

@router.post("/birth-chart")
async def calculate_birth_chart(request: BirthChartRequest) -> BirthChartResponse:
    """
    Calculate complete birth chart (Kundli)
    
    Example:
    ```json
    {
      "birth_date": "1990-05-15",
      "birth_time": "14:30:00",
      "birth_timezone": "Asia/Kolkata",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "birth_location_name": "Mumbai, India"
    }
    ```
    """
    try:
        from src.engines.astrology_engine import AstrologyCalculator
        
        calculator = AstrologyCalculator()
        
        # Parse birth datetime with timezone
        birth_dt = datetime.strptime(
            f"{request.birth_date} {request.birth_time}",
            "%Y-%m-%d %H:%M:%S"
        )
        
        # Calculate birth chart
        chart = calculator.calculate_birth_chart(
            birth_dt,
            request.latitude,
            request.longitude
        )
        
        return BirthChartResponse(**chart)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/horoscope/daily")
async def get_daily_horoscope(sign: str = Query(..., description="Zodiac sign")) -> Dict[str, Any]:
    """
    Get daily horoscope for zodiac sign
    
    Supported signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, 
                   Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
    """
    calculator = AstrologyCalculator()
    horoscope = calculator.generate_horoscope(sign)
    return horoscope

@router.post("/transits")
async def analyze_transits(user_id: str) -> Dict[str, Any]:
    """Analyze current planetary transits"""
    pass

@router.post("/dasha")
async def get_dasha_periods(user_id: str) -> Dict[str, Any]:
    """Get Dasha periods for user"""
    pass
```

---

## ML Models

### 1. Income Forecasting (Prophet)

```python
# src/engines/forecast_engine.py

from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.seasonal import seasonal_decompose
import pandas as pd
import numpy as np

class IncomeForecastModel:
    """Time-series forecasting for income"""
    
    def train(self, historical_data: pd.DataFrame):
        """
        Train SARIMA model on historical income data
        
        Args:
            historical_data: DataFrame with columns ['date', 'income']
        """
        # Prepare data
        ts_data = historical_data.set_index('date')['income']
        
        # Check for seasonality
        decomposition = seasonal_decompose(ts_data, model='additive', period=12)
        
        # Train SARIMA model
        # order=(p, d, q), seasonal_order=(P, D, Q, s)
        self.model = SARIMAX(
            ts_data,
            order=(1, 1, 1),
            seasonal_order=(1, 1, 0, 12),  # 12-month seasonality
            enforce_stationarity=False,
            enforce_invertibility=False
        )
        
        self.fitted_model = self.model.fit(disp=False)
        
        return self.fitted_model
    
    def forecast(self, periods: int = 6) -> Dict[str, Any]:
        """
        Forecast income for specified periods (months)
        
        Returns:
            Dict with forecast values, confidence intervals, trend
        """
        forecast_result = self.fitted_model.get_forecast(steps=periods)
        forecast_df = forecast_result.summary_frame()
        
        return {
            'forecast': forecast_df['mean'].tolist(),
            'confidence_lower': forecast_df['mean_ci_lower'].tolist(),
            'confidence_upper': forecast_df['mean_ci_upper'].tolist(),
            'trend': 'upward' if forecast_df['mean'].iloc[-1] > forecast_df['mean'].iloc[0] else 'downward',
            'seasonality': self._extract_seasonality()
        }
    
    def _extract_seasonality(self) -> Dict[str, Any]:
        """Extract seasonality patterns"""
        return {
            'peak_months': ['March', 'April'],
            'low_months': ['August', 'September']
        }
```

### 2. Health Risk Prediction (LSTM)

```python
# src/engines/health_engine.py

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import numpy as np

class HealthRiskPredictor:
    """LSTM-based health and stress prediction"""
    
    def __init__(self):
        self.model = self._build_model()
    
    def _build_model(self):
        """Build LSTM neural network"""
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=(7, 4)),
            Dropout(0.2),
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid')  # Output: 0-1 risk score
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def predict_stress(self, metrics_history: np.ndarray) -> Dict[str, Any]:
        """
        Predict stress levels for next 30 days
        
        Input shape: (7, 4) - 7 days history, 4 metrics per day
        Metrics: work_hours, sleep_hours, mood_score, exercise_minutes
        """
        predictions = []
        X = metrics_history.copy()
        
        for day in range(30):
            # Predict next day
            stress_level = self.model.predict(X[-1:])
            predictions.append(float(stress_level[0][0]))
            
            # Slide window
            X = np.roll(X, -1, axis=1)
            X[0, -1] = stress_level[0]
        
        return {
            'predictions': predictions,
            'trend': np.polyfit(range(30), predictions, 1)[0],
            'risk_days': [i for i, s in enumerate(predictions) if s > 0.7],
            'risk_level': 'high' if np.mean(predictions) > 0.7 else 'low'
        }
```

---

## API Endpoints

### Forecast Endpoint

```python
@router.post("/forecast/income")
async def forecast_income(request: ForecastRequest) -> ForecastResponse:
    """
    Forecast income for specified months
    
    Example:
    ```json
    {
      "timeseries": [
        {"date": "2024-01-01", "value": 50000},
        {"date": "2024-02-01", "value": 52000}
      ],
      "periods_ahead": 6,
      "confidence": 0.95
    }
    ```
    """
    from src.engines.forecast_engine import IncomeForecastModel
    
    try:
        # Prepare data
        df = pd.DataFrame(request.timeseries)
        df['date'] = pd.to_datetime(df['date'])
        
        # Train model
        model = IncomeForecastModel()
        model.train(df)
        
        # Forecast
        forecast = model.forecast(periods=request.periods_ahead)
        
        return ForecastResponse(**forecast)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Health Risk Endpoint

```python
@router.post("/predict/health-risk")
async def predict_health_risk(request: HealthRiskRequest) -> HealthRiskResponse:
    """
    Predict health and stress risk for next 30 days
    
    Example:
    ```json
    {
      "metrics_history": [
        {"date": "2024-12-13", "work_hours": 8, "sleep_hours": 7, "mood": 7, "exercise": 30},
        ...
      ]
    }
    ```
    """
    from src.engines.health_engine import HealthRiskPredictor
    
    try:
        # Convert to numpy array
        metrics_array = np.array([
            [m['work_hours'], m['sleep_hours'], m['mood'], m['exercise']]
            for m in request.metrics_history
        ])
        
        # Predict
        predictor = HealthRiskPredictor()
        predictions = predictor.predict_stress(metrics_array)
        
        return HealthRiskResponse(**predictions)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## Model Training

### Training Script

```python
# scripts/train_models.py

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_all_models():
    """Train all ML models"""
    
    logger.info("Starting model training...")
    
    # 1. Train income forecast model
    logger.info("Training income forecast model...")
    train_income_forecast()
    
    # 2. Train health risk model
    logger.info("Training health risk model...")
    train_health_model()
    
    # 3. Train stress predictor
    logger.info("Training stress predictor...")
    train_stress_model()
    
    # 4. Train relationship compatibility model
    logger.info("Training relationship model...")
    train_relationship_model()
    
    logger.info("Model training completed!")

def train_income_forecast():
    """Train income forecasting model"""
    from src.engines.forecast_engine import IncomeForecastModel
    
    # Load historical data
    data = pd.read_csv('data/income_history.csv')
    
    # Train model
    model = IncomeForecastModel()
    model.train(data)
    
    # Save model
    model_path = Path('models/forecast/income_model.pkl')
    model_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(model_path, 'wb') as f:
        pickle.dump(model.fitted_model, f)
    
    logger.info(f"Model saved to {model_path}")

def train_health_model():
    """Train health risk model"""
    from src.engines.health_engine import HealthRiskPredictor
    
    # Load training data
    X_train = np.load('data/health_X_train.npy')
    y_train = np.load('data/health_y_train.npy')
    
    # Train model
    predictor = HealthRiskPredictor()
    predictor.model.fit(X_train, y_train, epochs=50, batch_size=32)
    
    # Save model
    model_path = Path('models/health/stress_lstm.h5')
    model_path.parent.mkdir(parents=True, exist_ok=True)
    predictor.model.save(model_path)
    
    logger.info(f"Model saved to {model_path}")

if __name__ == '__main__':
    train_all_models()
```

### Run Training

```bash
# Activate venv
source venv/bin/activate

# Run training
python scripts/train_models.py

# Check logs
tail -f logs/training.log
```

---

## Testing

### Unit Tests

```python
# tests/test_astrology.py

import pytest
from datetime import datetime
from src.engines.astrology_engine import AstrologyCalculator

@pytest.fixture
def calculator():
    return AstrologyCalculator()

def test_calculate_birth_chart(calculator):
    """Test birth chart calculation"""
    birth_dt = datetime(1990, 5, 15, 14, 30, 0)
    latitude = 19.0760
    longitude = 72.8777
    
    chart = calculator.calculate_birth_chart(birth_dt, latitude, longitude)
    
    assert 'planets' in chart
    assert 'houses' in chart
    assert 'ascendant' in chart
    assert len(chart['planets']) == 9  # 9 planets

def test_detect_yogas(calculator):
    """Test Yoga detection"""
    chart = {
        'planets': {
            'jupiter': {'house': 1},
            'mars': {'house': 8}
        },
        'houses': {},
        'ascendant': {}
    }
    
    yogas = calculator._detect_yogas(
        chart['planets'],
        chart['houses'],
        chart['ascendant']
    )
    
    assert 'Raj Yoga' in yogas

def test_detect_doshas(calculator):
    """Test Dosha detection"""
    chart = {
        'planets': {
            'mars': {'house': 8}
        },
        'houses': {}
    }
    
    doshas = calculator._detect_doshas(chart['planets'], chart['houses'])
    
    assert len(doshas) > 0
    assert doshas[0]['name'] == 'Mangal Dosha'
```

### Run Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_astrology.py

# Run with coverage
pytest --cov=src tests/

# Run with detailed output
pytest -v
```

---

## Performance Optimization

### Caching Predictions

```python
# src/utils/cache.py

import redis
import json
from functools import wraps
from datetime import timedelta

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_prediction(ttl_seconds=86400):  # 24 hours default
    """Decorator to cache predictions"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Call function
            result = await func(*args, **kwargs)
            
            # Cache result
            redis_client.setex(
                cache_key,
                ttl_seconds,
                json.dumps(result, default=str)
            )
            
            return result
        
        return wrapper
    return decorator

# Usage
@cache_prediction(ttl_seconds=3600)
async def get_predictions(user_id: str):
    # Expensive operation
    pass
```

---

## Deployment

### Docker Setup

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run FastAPI
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
services:
  ml:
    build: ./ml
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/db
      REDIS_URL: redis://redis:6379
      LOG_LEVEL: INFO
    depends_on:
      - postgres
      - redis
    volumes:
      - ./ml/models:/app/models
      - ./ml/logs:/app/logs
```

---

## Monitoring

### Logging Setup

```python
# src/utils/logger.py

import logging
import logging.handlers
from pathlib import Path

def setup_logger(name: str) -> logging.Logger:
    """Setup logger with file and console handlers"""
    
    # Create logs directory
    log_dir = Path('logs')
    log_dir.mkdir(exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # File handler
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / f'{name}.log',
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Usage
logger = setup_logger('ml_engine')
```

---

## Troubleshooting

### Common Issues

#### 1. Ephemeris Data Not Found

```bash
# Solution: Download ephemeris data
python -c "import ephem; print(ephem.__file__)"

# Or install pyephem with data
pip install --upgrade pyephem
```

#### 2. Model Files Not Loading

```python
# Check if models exist
from pathlib import Path
model_path = Path('models/forecast/income_model.pkl')
assert model_path.exists(), f"Model not found at {model_path}"

# Load with error handling
try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    logger.error(f"Failed to load model: {e}")
```

#### 3. Database Connection Issues

```bash
# Test Supabase connection
psql postgresql://user:password@your-project.supabase.co:5432/postgres

# Check environment variables
echo $SUPABASE_URL
echo $DATABASE_URL
```

#### 4. Memory Issues with Large Models

```python
# Use model quantization
import tensorflow as tf

# Quantize model for smaller size
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()
```

---

## Quick Start Summary

```bash
# 1. Clone repo
git clone https://github.com/your-org/prediction-app.git
cd prediction-app/ml

# 2. Create venv
python -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment
cp .env.example .env
# Edit .env with your values

# 5. Train models (optional, pre-trained models included)
python scripts/train_models.py

# 6. Start server
uvicorn src.main:app --reload --port 8000

# 7. Test API
curl http://localhost:8000/health
curl -X POST http://localhost:8000/astrology/birth-chart \
  -H "Content-Type: application/json" \
  -d '{"birth_date": "1990-05-15", "birth_time": "14:30:00", ...}'
```

---

**Last Updated**: December 20, 2025
**Version**: 1.0.0
**Status**: Production Ready

For detailed ML Engine documentation, see `/docs` folder.
