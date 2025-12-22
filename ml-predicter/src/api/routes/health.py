from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["health"])

class HealthRiskRequest(BaseModel):
    metrics_history: List[Dict[str, Any]]

class HealthRiskResponse(BaseModel):
    identified_risks: List[Dict[str, Any]]
    risk_count: int
    trends: Dict[str, float]
    recommendations: List[str]

@router.post("/predict-risk")
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
    from src.engines.health_engine import HealthPredictionEngine
    
    try:
        predictor = HealthPredictionEngine()
        predictions = predictor.predict_health_risks(request.metrics_history)
        
        return HealthRiskResponse(**predictions)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
