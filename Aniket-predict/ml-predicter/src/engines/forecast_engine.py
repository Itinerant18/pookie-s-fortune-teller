"""
Time-series forecasting engine for income and financial predictions
Uses ARIMA, SARIMA, and Prophet models
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class IncomeForecastEngine:
    """
    Forecast income using time-series models
    Supports multiple forecasting algorithms
    """
    
    def __init__(self):
        self.model = None
        self.scaler = None
        logger.info("Income Forecast Engine initialized")
    
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
    
    def detect_seasonality(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Detect seasonality pattern in time series
        """
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
        """
        Forecast using ARIMA model
        Auto-selects best order parameters
        """
        try:
            from statsmodels.tsa.arima.model import ARIMA
            from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
            
            values = data["value"].values
            
            # Auto ARIMA parameter selection
            # Try multiple (p,d,q) combinations
            best_aic = float("inf")
            best_order = (1, 1, 1)
            
            for p in range(3):
                for d in range(2):
                    for q in range(3):
                        try:
                            model = ARIMA(values, order=(p, d, q))
                            fitted = model.fit()
                            if fitted.aic < best_aic:
                                best_aic = fitted.aic
                                best_order = (p, d, q)
                        except:
                            pass
            
            logger.info(f"Best ARIMA order: {best_order}")
            
            # Fit final model
            model = ARIMA(values, order=best_order)
            fitted_model = model.fit()
            
            # Forecast
            forecast_result = fitted_model.get_forecast(steps=periods)
            forecast_df = forecast_result.summary_frame()
            
            return {
                "model": "ARIMA",
                "order": best_order,
                "forecast": forecast_df["mean"].tolist(),
                "ci_lower": forecast_df["mean_ci_lower"].tolist(),
                "ci_upper": forecast_df["mean_ci_upper"].tolist(),
                "aic": float(fitted_model.aic),
                "rmse": float(np.sqrt(fitted_model.mse))
            }
        
        except Exception as e:
            logger.error(f"ARIMA forecasting failed: {e}")
            return None
    
    def forecast_sarima(self, data: pd.DataFrame, periods: int = 6) -> Dict[str, Any]:
        """
        Forecast using SARIMA model
        For seasonal data
        """
        try:
            from statsmodels.tsa.statespace.sarimax import SARIMAX
            
            values = data["value"].values
            
            # Detect seasonality
            seasonality = self.detect_seasonality(data)
            season_period = seasonality["season_period"]
            
            if not seasonality["has_seasonality"]:
                logger.warning("No strong seasonality detected, using ARIMA")
                return self.forecast_arima(data, periods)
            
            # SARIMA with seasonal component
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
                "order": (1, 1, 1),
                "seasonal_order": (1, 1, 0, season_period),
                "forecast": forecast_df["mean"].tolist(),
                "ci_lower": forecast_df["mean_ci_lower"].tolist(),
                "ci_upper": forecast_df["mean_ci_upper"].tolist(),
                "aic": float(fitted_model.aic),
                "rmse": float(np.sqrt(fitted_model.mse))
            }
        
        except Exception as e:
            logger.error(f"SARIMA forecasting failed: {e}")
            return None
    
    def forecast_exponential_smoothing(self, data: pd.DataFrame, periods: int = 6) -> Dict[str, Any]:
        """
        Forecast using Exponential Smoothing
        Good for stable trends
        """
        try:
            from statsmodels.tsa.holtwinters import ExponentialSmoothing
            
            values = data["value"].values
            
            # Detect seasonality
            seasonality = self.detect_seasonality(data)
            season_period = seasonality["season_period"]
            
            model_type = "add" if seasonality["has_seasonality"] else "mul"
            
            model = ExponentialSmoothing(
                values,
                seasonal_periods=season_period if seasonality["has_seasonality"] else None,
                trend="add",
                seasonal=model_type if seasonality["has_seasonality"] else None,
                initialization_method="estimated"
            )
            
            fitted_model = model.fit(optimized=True)
            
            # Forecast
            forecast = fitted_model.forecast(steps=periods)
            
            return {
                "model": "Exponential Smoothing",
                "trend": "additive",
                "seasonal": model_type,
                "forecast": forecast.tolist(),
                "rmse": float(np.sqrt(np.mean((values - fitted_model.fittedvalues)**2)))
            }
        
        except Exception as e:
            logger.error(f"Exponential Smoothing failed: {e}")
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
        
        exp_result = self.forecast_exponential_smoothing(data, periods)
        if exp_result:
            forecasts["exp_smoothing"] = exp_result
        
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
        
        return {
            "model": "Ensemble",
            "sub_models": list(forecasts.keys()),
            "forecast": ensemble_forecast.tolist(),
            "ci_lower": ci_lower.tolist(),
            "ci_upper": ci_upper.tolist(),
            "trend": self._calculate_trend(ensemble_forecast),
            "volatility": float(np.std(ensemble_forecast))
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
    
    def generate_recommendations(self, forecast: Dict[str, Any]) -> List[str]:
        """
        Generate recommendations based on forecast
        """
        recommendations = []
        
        values = forecast["forecast"]
        trend = forecast.get("trend", "stable")
        
        if trend == "upward":
            recommendations.append("Income trend is positive - consider investing surplus")
            recommendations.append("Plan for future expenses - upward trend suggests stability")
        
        elif trend == "downward":
            recommendations.append("Income trend is declining - build emergency fund")
            recommendations.append("Review expenses and cut non-essential spending")
        
        # Volatility-based recommendations
        volatility = forecast.get("volatility", 0)
        if volatility > np.mean(values) * 0.3:
            recommendations.append("High income volatility - maintain larger emergency fund")
        
        return recommendations
