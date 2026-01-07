"""
ml-predicter/scripts/train_models.py

Complete model training pipeline for the ML Engine
Trains and saves models for future predictions
"""

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import joblib
import logging
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List
import json

# Add src to python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.config.settings import settings
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    """Central model training orchestrator"""
    
    def __init__(self, model_dir: str = "./models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True, parents=True)
        self.trained_models = {}
        
    def train_all(self):
        """Train all models in the pipeline"""
        logger.info("=" * 60)
        logger.info("STARTING MODEL TRAINING PIPELINE")
        logger.info("=" * 60)
        
        # 1. Income Forecasting Models
        logger.info("\n[1/3] Training Income Forecasting Models...")
        self.train_income_models()
        
        # 2. Health Risk Models
        logger.info("\n[2/3] Training Health Risk Models...")
        self.train_health_models()
        
        # 3. General Prediction Models
        logger.info("\n[3/3] Training General Prediction Models...")
        self.train_general_models()
        
        # Save metadata
        self.save_model_metadata()
        
        logger.info("\n" + "=" * 60)
        logger.info("MODEL TRAINING COMPLETED SUCCESSFULLY")
        logger.info("=" * 60)
        logger.info(f"Models saved to: {self.model_dir.absolute()}")
        
    def train_income_models(self):
        """Train income forecasting models"""
        logger.info("Training ARIMA/SARIMA models for income forecasting...")
        
        # Generate synthetic training data
        train_data = self._generate_income_training_data()
        
        # Train ARIMA
        try:
            arima_model = self._train_arima(train_data)
            self._save_model(arima_model, "income_arima")
            logger.info("✓ ARIMA model trained and saved")
        except Exception as e:
            logger.error(f"✗ ARIMA training failed: {e}")
        
        # Train SARIMA
        try:
            sarima_model = self._train_sarima(train_data)
            self._save_model(sarima_model, "income_sarima")
            logger.info("✓ SARIMA model trained and saved")
        except Exception as e:
            logger.error(f"✗ SARIMA training failed: {e}")
        
        # Train Random Forest for income prediction
        try:
            rf_model, scaler = self._train_rf_income(train_data)
            self._save_model(rf_model, "income_rf")
            self._save_model(scaler, "income_scaler")
            logger.info("✓ Random Forest income model trained and saved")
        except Exception as e:
            logger.error(f"✗ Random Forest training failed: {e}")
    
    def _generate_income_training_data(self, n_samples: int = 500) -> pd.DataFrame:
        """Generate synthetic income data for training"""
        np.random.seed(42)
        
        dates = pd.date_range(start='2020-01-01', periods=n_samples, freq='D')
        
        # Synthetic income with trend and seasonality
        trend = np.linspace(40000, 60000, n_samples)
        seasonal = 5000 * np.sin(2 * np.pi * np.arange(n_samples) / 365)
        noise = np.random.normal(0, 2000, n_samples)
        
        income = trend + seasonal + noise
        
        df = pd.DataFrame({
            'date': dates,
            'income': income,
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'quarter': dates.quarter
        })
        
        return df
    
    def _train_arima(self, data: pd.DataFrame) -> Any:
        """Train ARIMA model"""
        values = data['income'].values
        
        # Auto ARIMA parameter selection
        best_aic = float("inf")
        best_model = None
        best_order = (1, 1, 1)
        
        for p in range(3):
            for d in range(2):
                for q in range(3):
                    try:
                        model = ARIMA(values, order=(p, d, q))
                        fitted = model.fit()
                        if fitted.aic < best_aic:
                            best_aic = fitted.aic
                            best_model = fitted
                            best_order = (p, d, q)
                    except:
                        continue
        
        logger.info(f"  Best ARIMA order: {best_order} (AIC: {best_aic:.2f})")
        return best_model
    
    def _train_sarima(self, data: pd.DataFrame) -> Any:
        """Train SARIMA model"""
        values = data['income'].values
        
        # SARIMA with yearly seasonality
        model = SARIMAX(
            values,
            order=(1, 1, 1),
            seasonal_order=(1, 1, 0, 12),
            enforce_stationarity=False,
            enforce_invertibility=False
        )
        
        fitted_model = model.fit(disp=False)
        logger.info(f"  SARIMA AIC: {fitted_model.aic:.2f}")
        
        return fitted_model
    
    def _train_rf_income(self, data: pd.DataFrame) -> tuple:
        """Train Random Forest for income prediction"""
        # Feature engineering
        X = data[['day_of_week', 'month', 'quarter']].values
        y = data['income'].values
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_scaled, y)
        
        # Calculate training metrics
        train_score = model.score(X_scaled, y)
        logger.info(f"  Random Forest R² Score: {train_score:.4f}")
        
        return model, scaler
    
    def train_health_models(self):
        """Train health risk prediction models"""
        logger.info("Training health risk classification models...")
        
        # Generate synthetic health data
        health_data = self._generate_health_training_data()
        
        # Train stress level classifier
        try:
            stress_model, stress_scaler = self._train_stress_classifier(health_data)
            self._save_model(stress_model, "health_stress_classifier")
            self._save_model(stress_scaler, "health_stress_scaler")
            logger.info("✓ Stress classifier trained and saved")
        except Exception as e:
            logger.error(f"✗ Stress classifier training failed: {e}")
        
        # Train health risk predictor
        try:
            risk_model, risk_scaler = self._train_risk_predictor(health_data)
            self._save_model(risk_model, "health_risk_predictor")
            self._save_model(risk_scaler, "health_risk_scaler")
            logger.info("✓ Health risk predictor trained and saved")
        except Exception as e:
            logger.error(f"✗ Health risk predictor training failed: {e}")
    
    def _generate_health_training_data(self, n_samples: int = 1000) -> pd.DataFrame:
        """Generate synthetic health metrics"""
        np.random.seed(42)
        
        data = {
            'work_hours': np.random.normal(8, 2, n_samples).clip(4, 14),
            'sleep_hours': np.random.normal(7, 1.5, n_samples).clip(4, 10),
            'exercise_minutes': np.random.normal(30, 20, n_samples).clip(0, 120),
            'mood_score': np.random.normal(6, 2, n_samples).clip(1, 10),
            'caffeine_cups': np.random.poisson(2, n_samples).clip(0, 8),
            'meetings_count': np.random.poisson(4, n_samples).clip(0, 15)
        }
        
        df = pd.DataFrame(data)
        
        # Calculate stress score (target)
        df['stress_score'] = (
            df['work_hours'] * 5 +
            (10 - df['sleep_hours']) * 8 +
            (60 - df['exercise_minutes']) * 0.5 +
            (10 - df['mood_score']) * 6 +
            df['caffeine_cups'] * 3 +
            df['meetings_count'] * 2
        ).clip(0, 100)
        
        # Create risk categories
        df['risk_level'] = pd.cut(
            df['stress_score'],
            bins=[0, 30, 60, 80, 100],
            labels=[0, 1, 2, 3]  # low, moderate, high, critical
        ).astype(int)
        
        return df
    
    def _train_stress_classifier(self, data: pd.DataFrame) -> tuple:
        """Train stress level classifier"""
        features = ['work_hours', 'sleep_hours', 'exercise_minutes', 
                   'mood_score', 'caffeine_cups', 'meetings_count']
        
        X = data[features].values
        y = data['risk_level'].values
        
        # Scale
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # Train
        model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate
        train_acc = model.score(X_train, y_train)
        test_acc = model.score(X_test, y_test)
        
        logger.info(f"  Train Accuracy: {train_acc:.4f}")
        logger.info(f"  Test Accuracy: {test_acc:.4f}")
        
        return model, scaler
    
    def _train_risk_predictor(self, data: pd.DataFrame) -> tuple:
        """Train health risk regression predictor"""
        features = ['work_hours', 'sleep_hours', 'exercise_minutes', 
                   'mood_score', 'caffeine_cups', 'meetings_count']
        
        X = data[features].values
        y = data['stress_score'].values
        
        # Scale
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_scaled, y)
        
        score = model.score(X_scaled, y)
        logger.info(f"  Risk Predictor R² Score: {score:.4f}")
        
        return model, scaler
    
    def train_general_models(self):
        """Train general-purpose prediction models"""
        logger.info("Training general prediction models...")
        
        # Placeholder for future models
        logger.info("✓ General models pipeline ready")
    
    def _save_model(self, model: Any, name: str):
        """Save model to disk"""
        filepath = self.model_dir / f"{name}.pkl"
        
        try:
            joblib.dump(model, filepath)
            
            # Track in registry 
            self.trained_models[name] = {
                'filepath': str(filepath),
                'timestamp': datetime.now().isoformat(),
                'size_bytes': filepath.stat().st_size
            }
        except Exception as e:
            logger.error(f"Failed to save {name}: {e}")
    
    def save_model_metadata(self):
        """Save metadata about all trained models"""
        metadata = {
            'training_date': datetime.now().isoformat(),
            'models': self.trained_models,
            'config': {
                'model_dir': str(self.model_dir),
                'total_models': len(self.trained_models)
            }
        }
        
        metadata_path = self.model_dir / 'metadata.json'
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"\n✓ Metadata saved to {metadata_path}")


def main():
    """Main training pipeline"""
    trainer = ModelTrainer(model_dir=settings.MODEL_PATH)
    trainer.train_all()
    
    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Update forecast_engine.py to load pre-trained models")
    print("2. Update health_engine.py to load pre-trained models")
    print("3. Test predictions with: pytest tests/")
    print("4. Deploy models to production")
    print("=" * 60)


if __name__ == '__main__':
    main()