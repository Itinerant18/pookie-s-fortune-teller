"""
ml-predicter/src/engines/forecast_engine.py

Updated time-series forecasting engine that loads pre-trained models
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
import logging
import joblib
from pathlib import Path

logger = logging.getLogger(__name__)

class IncomeForecastEngine:
    """
    Forecast income using pre-trained time-series models
    Supports ARIMA, SARIMA, and ensemble predictions
    """
    
    def __init__(self, model_dir: str = "./models"):
        self.model_dir = Path(model_dir)
        self.models = {}
        self.scalers = {}
        self._load_models()
        logger.info("Income Forecast Engine initialized")
    
    def _load_models(self):
        """Load pre-trained models from disk"""
        try:
            # Load ARIMA model
            arima_path = self.model_dir / "income_arima.pkl"
            if arima_path.exists():
                self.models['arima'] = joblib.load(arima_path)
                logger.info("✓ ARIMA model loaded")
            
            # Load SARIMA model
            sarima_path = self.model_dir / "income_sarima.pkl"
            if sarima_path.exists():
                self.models['sarima'] = joblib.load(sarima_path)
                logger.info("✓ SARIMA model loaded")
            
            # Load Random Forest model
            rf_path = self.model_dir / "income_rf.pkl"
            scaler_path = self.model_dir / "income_scaler.pkl"
            
            if rf_path.exists() and scaler_path.exists():
                self.models['rf'] = joblib.load(rf_path)
                self.scalers['rf'] = joblib.load(scaler_path)
                logger.info("✓ Random Forest model loaded")
            
            # Load Demographic Classifier
            demo_model_path = self.model_dir / "income_demographic_classifier.pkl"
            demo_scaler_path = self.model_dir / "income_demographic_scaler.pkl"
            demo_features_path = self.model_dir / "income_demographic_features.pkl"
            
            if demo_model_path.exists() and demo_scaler_path.exists() and demo_features_path.exists():
                self.models['demographic'] = joblib.load(demo_model_path)
                self.scalers['demographic'] = joblib.load(demo_scaler_path)
                self.features_metadata = joblib.load(demo_features_path)
                logger.info("✓ Demographic Classifier loaded")
            
            if not self.models:
                logger.warning("No pre-trained models found. Using on-the-fly training.")
        
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            logger.warning("Will fall back to on-the-fly training")
    
    def prepare_data(self, timeseries: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Convert API input to pandas DataFrame
        
        Args:
            timeseries: List of {"date": str, "value": float} dicts
        
        Returns:
            Prepared DataFrame with date index and value column
        """
        df = pd.DataFrame(timeseries)
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")
        df.set_index("date", inplace=True)
        
        # Check for missing values
        if df["value"].isnull().any():
            logger.warning("Missing values detected, performing forward fill")
            df["value"].fillna(method="ffill", inplace=True)
        
        return df
    
    def forecast_with_pretrained(
        self, 
        data: pd.DataFrame, 
        model_name: str, 
        periods: int = 6
    ) -> Optional[Dict[str, Any]]:
        """
        Generate forecast using pre-trained model
        
        Args:
            data: Historical time series data
            model_name: Name of model to use ('arima', 'sarima', 'rf')
            periods: Number of periods to forecast
        
        Returns:
            Forecast results dict or None if model not available
        """
        if model_name not in self.models:
            logger.warning(f"Pre-trained {model_name} model not found")
            return None
        
        try:
            model = self.models[model_name]
            
            if model_name in ['arima', 'sarima']:
                # Use statsmodels forecast method
                forecast_result = model.get_forecast(steps=periods)
                forecast_df = forecast_result.summary_frame()
                
                return {
                    "model": model_name.upper(),
                    "forecast": forecast_df["mean"].tolist(),
                    "ci_lower": forecast_df["mean_ci_lower"].tolist(),
                    "ci_upper": forecast_df["mean_ci_upper"].tolist(),
                    "using_pretrained": True
                }
            
            elif model_name == 'rf':
                # Random Forest requires feature engineering
                scaler = self.scalers['rf']
                
                # Generate future dates
                last_date = data.index[-1]
                future_dates = pd.date_range(
                    start=last_date + pd.Timedelta(days=1),
                    periods=periods,
                    freq='D'
                )
                
                # Create features
                features = []
                for date in future_dates:
                    features.append([
                        date.dayofweek,
                        date.month,
                        date.quarter
                    ])
                
                X_future = np.array(features)
                X_future_scaled = scaler.transform(X_future)
                
                # Predict
                predictions = model.predict(X_future_scaled)
                
                # Estimate confidence intervals (RF doesn't provide them natively)
                # Use prediction std as proxy
                std = np.std(predictions) * 0.5
                
                return {
                    "model": "Random Forest",
                    "forecast": predictions.tolist(),
                    "ci_lower": (predictions - 1.96 * std).tolist(),
                    "ci_upper": (predictions + 1.96 * std).tolist(),
                    "using_pretrained": True
                }
        
        except Exception as e:
            logger.error(f"Error forecasting with {model_name}: {e}")
            return None
    
    def detect_seasonality(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Detect seasonality pattern in time series"""
        from scipy import signal
        
        values = data["value"].values
        
        # Calculate autocorrelation
        acf = np.correlate(values - values.mean(), values - values.mean(), mode="full")
        acf = acf[len(acf)//2:]
        acf = acf / acf[0]
        
        # Find dominant frequencies using FFT
        fft = np.abs(np.fft.fft(values))
        freqs = np.fft.fftfreq(len(values))
        
        # Peak frequency indicates seasonality
        peak_freq = freqs[np.argmax(fft)]
        season_period = int(1 / abs(peak_freq)) if peak_freq != 0 else 12
        
        return {
            "has_seasonality": season_period < len(values) / 2,
            "season_period": season_period,
            "strength": float(np.max(acf[1:min(13, len(acf))])) if len(acf) > 1 else 0
        }
    
    def forecast_arima(self, data: pd.DataFrame, periods: int = 6) -> Dict[str, Any]:
        """Forecast using ARIMA model (pre-trained or on-the-fly)"""
        
        # Try pre-trained model first
        result = self.forecast_with_pretrained(data, 'arima', periods)
        if result:
            return result
        
        # Fall back to on-the-fly training
        logger.info("Training ARIMA on-the-fly...")
        
        try:
            from statsmodels.tsa.arima.model import ARIMA
            
            values = data["value"].values
            
            # Simple ARIMA (1,1,1) for speed
            model = ARIMA(values, order=(1, 1, 1))
            fitted_model = model.fit()
            
            # Forecast
            forecast_result = fitted_model.get_forecast(steps=periods)
            forecast_df = forecast_result.summary_frame()
            
            return {
                "model": "ARIMA",
                "order": (1, 1, 1),
                "forecast": forecast_df["mean"].tolist(),
                "ci_lower": forecast_df["mean_ci_lower"].tolist(),
                "ci_upper": forecast_df["mean_ci_upper"].tolist(),
                "using_pretrained": False
            }
        
        except Exception as e:
            logger.error(f"ARIMA forecasting failed: {e}")
            return None
    
    def forecast_sarima(self, data: pd.DataFrame, periods: int = 6) -> Dict[str, Any]:
        """Forecast using SARIMA model"""
        
        # Try pre-trained model first
        result = self.forecast_with_pretrained(data, 'sarima', periods)
        if result:
            return result
        
        # Fall back to on-the-fly training
        logger.info("Training SARIMA on-the-fly...")
        
        try:
            from statsmodels.tsa.statespace.sarimax import SARIMAX
            
            values = data["value"].values
            seasonality = self.detect_seasonality(data)
            season_period = seasonality["season_period"]
            
            model = SARIMAX(
                values,
                order=(1, 1, 1),
                seasonal_order=(1, 1, 0, season_period),
                enforce_stationarity=False,
                enforce_invertibility=False
            )
            
            fitted_model = model.fit(disp=False)
            
            # Forecast
            forecast_result = fitted_model.get_forecast(steps=periods)
            forecast_df = forecast_result.summary_frame()
            
            return {
                "model": "SARIMA",
                "forecast": forecast_df["mean"].tolist(),
                "ci_lower": forecast_df["mean_ci_lower"].tolist(),
                "ci_upper": forecast_df["mean_ci_upper"].tolist(),
                "using_pretrained": False
            }
        
        except Exception as e:
            logger.error(f"SARIMA forecasting failed: {e}")
            return None
    
    def ensemble_forecast(self, data: pd.DataFrame, periods: int = 6) -> Dict[str, Any]:
        """
        Combine multiple forecasts using ensemble method
        Weighted average of best performing models
        """
        forecasts = {}
        
        # Generate forecasts from different models
        arima_result = self.forecast_arima(data, periods)
        if arima_result:
            forecasts["arima"] = arima_result
        
        sarima_result = self.forecast_sarima(data, periods)
        if sarima_result:
            forecasts["sarima"] = sarima_result
        
        # Try RF if available
        rf_result = self.forecast_with_pretrained(data, 'rf', periods)
        if rf_result:
            forecasts["rf"] = rf_result
        
        if not forecasts:
            raise ValueError("All forecasting methods failed")
        
        # Ensemble: Simple average
        ensemble_forecast = np.mean(
            [f["forecast"] for f in forecasts.values()],
            axis=0
        )
        
        # Calculate ensemble confidence intervals
        all_forecasts = np.array([f["forecast"] for f in forecasts.values()])
        ci_lower = np.percentile(all_forecasts, 2.5, axis=0)
        ci_upper = np.percentile(all_forecasts, 97.5, axis=0)
        
        # Check if any pre-trained models were used
        using_pretrained = any(f.get("using_pretrained", False) for f in forecasts.values())
        
        return {
            "model": "Ensemble",
            "sub_models": list(forecasts.keys()),
            "forecast": ensemble_forecast.tolist(),
            "ci_lower": ci_lower.tolist(),
            "ci_upper": ci_upper.tolist(),
            "trend": self._calculate_trend(ensemble_forecast),
            "volatility": float(np.std(ensemble_forecast)),
            "using_pretrained": using_pretrained
        }
    
    def _calculate_trend(self, forecast: np.ndarray) -> str:
        """Determine trend direction"""
        if len(forecast) < 2:
            return "stable"
        
        slope = (forecast[-1] - forecast[0]) / len(forecast)
        
        if slope > 0.05 * np.mean(forecast):
            return "upward"
        elif slope < -0.05 * np.mean(forecast):
            return "downward"
        else:
            return "stable"
    
    def predict_income_demographic(self, user_profile: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Predict income bracket based on user demographics
        
        Args:
            user_profile: {
                'age': int, 'workclass': str, 'education': str, 
                'occupation': str, 'hours_per_week': int, etc.
            }
        """
        if 'demographic' not in self.models:
            return None
            
        try:
            model = self.models['demographic']
            scaler = self.scalers['demographic']
            feature_names = self.features_metadata
            
            # Prepare input DataFrame with dummy variables
            # 1. Start with numerical features
            input_data = {
                'age': [user_profile.get('age', 30)],
                'capital_gain': [user_profile.get('capital_gain', 0)],
                'capital_loss': [user_profile.get('capital_loss', 0)],
                'hours_per_week': [user_profile.get('hours_per_week', 40)]
            }
            
            # 2. Add categorical features (one-hot encoded)
            # We need to match the feature names from training
            for feat in feature_names:
                if feat in input_data:
                    continue
                
                # Check if this feature matches the user's category
                # Format is usually 'category_value'
                matched = False
                for cat_key, cat_val in user_profile.items():
                    if f"{cat_key}_{cat_val}" == feat:
                        input_data[feat] = [1]
                        matched = True
                        break
                
                if not matched:
                    input_data[feat] = [0]
            
            # Convert to DF and ensure order matches
            input_df = pd.DataFrame(input_data)
            input_df = input_df[feature_names]
            
            # Scale and predict
            X_scaled = scaler.transform(input_df)
            prediction = model.predict(X_scaled)[0]
            probability = model.predict_proba(X_scaled)[0][1]
            
            return {
                "income_bracket": ">50K" if prediction == 1 else "<=50K",
                "high_income_probability": float(probability),
                "insight": "High growth potential" if probability > 0.7 else "Stable income profile"
            }
            
        except Exception as e:
            logger.error(f"Demographic prediction failed: {e}")
            return None

    def generate_recommendations(self, forecast: Dict[str, Any], demographic_avg: Optional[Dict] = None) -> List[str]:
        """Generate recommendations based on forecast"""
        recommendations = []
        
        values = forecast["forecast"]
        trend = forecast.get("trend", "stable")
        
        if trend == "upward":
            recommendations.append("📈 Income trend is positive - consider investing surplus")
        
        # Add demographic-based insights
        if demographic_avg:
            prob = demographic_avg.get("high_income_probability", 0)
            if prob > 0.8:
                recommendations.append("✨ Your profile matches high-earning benchmarks - maximize career growth")
            elif prob < 0.3:
                recommendations.append("🎓 Consider skill upgrades to move into a higher income bracket")
        
        elif trend == "downward":
            recommendations.append("📉 Income trend is declining - build emergency fund")
            recommendations.append("💸 Review expenses and cut non-essential spending")
        
        # Volatility-based recommendations
        volatility = forecast.get("volatility", 0)
        if volatility > np.mean(values) * 0.3:
            recommendations.append("⚠️ High income volatility - maintain larger emergency fund")
        
        # Model confidence
        if forecast.get("using_pretrained", False):
            recommendations.append("✓ Predictions based on trained models (higher confidence)")
        
        return recommendations