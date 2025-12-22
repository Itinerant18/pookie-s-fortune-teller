from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Dict, Any, List
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
    houses: Dict[int, str]
    ascendant: str
    moon_nakshatra: str
    current_dasha: str
    current_dasha_lord: str
    yogas: List[str]
    doshas: List[Dict[str, Any]]
    calculated_at: datetime

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
        
        # Convert dataclass to dict
        return BirthChartResponse(**chart.__dict__)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/horoscope/daily")
async def get_daily_horoscope(sign: str = Query(..., description="Zodiac sign")) -> Dict[str, Any]:
    """
    Get daily horoscope for zodiac sign
    
    Supported signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, 
                   Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
    """
    try:
        from src.engines.astrology_engine import AstrologyCalculator
        calculator = AstrologyCalculator()
        horoscope = calculator.get_daily_horoscope(sign)
        return horoscope
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/transits")
async def analyze_transits(user_id: str) -> Dict[str, Any]:
    """Analyze current planetary transits"""
    return {"message": "Transits analysis not implemented yet"}

@router.post("/dasha")
async def get_dasha_periods(user_id: str) -> Dict[str, Any]:
    """Get Dasha periods for user"""
    return {"message": "Dasha periods not implemented yet"}
