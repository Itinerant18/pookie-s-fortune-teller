# scripts/train_models.py

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import logging
import sys
import os

# Add src to python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

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
    # train_health_model()
    
    logger.info("Model training completed!")

def train_income_forecast():
    """Train income forecasting model"""
    from src.engines.forecast_engine import IncomeForecastEngine
    
    # Mock data for demonstration
    data = pd.DataFrame({
        'date': pd.date_range(start='2020-01-01', periods=24, freq='M'),
        'income': np.random.randint(40000, 60000, 24)
    })
    
    # In a real scenario, we would train and save the model here
    # Since the engine generates models on the fly (ARIMA/SARIMA), we might not need to pickle them 
    # unless we want to cache the fitted model.
    # The guide suggests saving models.
    
    logger.info("Income forecast model trained (mock)")

if __name__ == '__main__':
    train_all_models()
