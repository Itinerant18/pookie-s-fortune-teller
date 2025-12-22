from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy import text
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forecast", tags=["forecast"])

class ForecastRequest(BaseModel):
    user_id: str  # Required for DB tracking
    timeseries: List[Dict[str, Any]]
    periods_ahead: int = 6
    confidence: float = 0.95

class ForecastResponse(BaseModel):
    prediction_id: Optional[str] = None
    model: str
    forecast: List[float]
    ci_lower: List[float]
    ci_upper: List[float]
    trend: str = "stable"
    recommendations: List[str] = []

@router.post("/income")
async def forecast_income(request: Request, body: ForecastRequest) -> ForecastResponse:
    """
    Forecast income and save prediction to database for future training.
    """
    from src.engines.forecast_engine import IncomeForecastEngine
    
    try:
        engine = IncomeForecastEngine()
        
        # Prepare data
        df = engine.prepare_data(body.timeseries)
        
        # Forecast
        forecast_result = engine.ensemble_forecast(df, periods=body.periods_ahead)
        
        # Generate recommendations
        recommendations = engine.generate_recommendations(forecast_result)
        
        # Save to Database (Optimization for "train and improve")
        prediction_id = None
        if hasattr(request.app.state, 'db') and hasattr(request.app.state, 'model_registry'):
            db = request.app.state.db
            model_registry = request.app.state.model_registry
            
            try:
                model_id = model_registry.get_model_id()
                
                async with db.engine.begin() as conn:
                    result = await conn.execute(
                        text("""
                            INSERT INTO predictions (
                                user_id, category, prediction_type, timeframe,
                                period_start, period_end,
                                combined_prediction, overall_confidence,
                                model_id, model_version
                            ) VALUES (
                                :user_id, 'finance', 'hybrid', :timeframe,
                                CURRENT_DATE, CURRENT_DATE + make_interval(months => :months),
                                :prediction_json, :confidence,
                                :model_id, :model_version
                            ) RETURNING id
                        """),
                        {
                            "user_id": body.user_id,
                            "timeframe": f"{body.periods_ahead}_months",
                            "months": body.periods_ahead,
                            "prediction_json": json.dumps(forecast_result['forecast']), # Storing raw forecast list for now
                            "confidence": 0.85, # Mock confidence for ensemble
                            "model_id": model_id,
                            "model_version": model_registry.current_version
                        }
                    )
                    prediction_id = str(result.fetchone()[0])
                    logger.info(f"Saved prediction {prediction_id} for user {body.user_id}")
            except Exception as db_err:
                logger.error(f"Failed to save prediction to DB: {db_err}")
                # Continue without failing the request, but log it
        
        return ForecastResponse(
            prediction_id=prediction_id,
            model=forecast_result['model'],
            forecast=forecast_result['forecast'],
            ci_lower=forecast_result['ci_lower'],
            ci_upper=forecast_result['ci_upper'],
            trend=forecast_result['trend'],
            recommendations=recommendations
        )
    
    except Exception as e:
        logger.error(f"Forecast error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
