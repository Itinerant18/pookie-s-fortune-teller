"""
Health and stress prediction engine
Uses LSTM neural networks and health metrics
"""

import numpy as np
from typing import Dict, List, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class HealthPredictionEngine:
    """
    Predict health risks and stress levels
    Based on lifestyle metrics
    """
    
    def __init__(self):
        self.model = None
        logger.info("Health Prediction Engine initialized")
    
    def calculate_stress_score(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate stress score from multiple lifestyle metrics
        
        Args:
            metrics: {
                "work_hours": float,
                "sleep_hours": float,
                "exercise_minutes": float,
                "mood_score": float (1-10),
                "meetings_count": int,
                "caffeine_cups": int,
                "meditation_minutes": float
            }
        
        Returns:
            Stress score (0-100) with components
        """
        
        # Normalize metrics to 0-100 scale
        work_stress = min(metrics.get("work_hours", 8) / 12 * 100, 100)  # 12h max
        
        sleep_score = min(metrics.get("sleep_hours", 7) / 8 * 100, 100)  # 8h ideal
        sleep_stress = 100 - sleep_score
        
        exercise_score = min(metrics.get("exercise_minutes", 30) / 60 * 100, 100)  # 60m ideal
        exercise_stress = 100 - exercise_score
        
        mood_stress = (100 - metrics.get("mood_score", 5) * 10)  # Inverse of mood
        
        meetings_stress = min(metrics.get("meetings_count", 0) / 10 * 100, 100)
        
        caffeine_stress = min(metrics.get("caffeine_cups", 0) / 5 * 100, 100)
        
        meditation_score = min(metrics.get("meditation_minutes", 0) / 20 * 100, 100)
        meditation_benefit = meditation_score / 2  # 50% impact of meditation
        
        # Weighted average
        stress_score = (
            work_stress * 0.25 +
            sleep_stress * 0.25 +
            exercise_stress * 0.15 +
            mood_stress * 0.15 +
            meetings_stress * 0.10 +
            caffeine_stress * 0.05 +
            (100 - meditation_benefit) * 0.05
        )
        
        stress_score = max(0, min(100, stress_score))  # Clamp 0-100
        
        return {
            "overall_score": round(stress_score, 2),
            "risk_level": self._get_risk_level(stress_score),
            "components": {
                "work_stress": round(work_stress, 2),
                "sleep_stress": round(sleep_stress, 2),
                "exercise_stress": round(exercise_stress, 2),
                "mood_stress": round(mood_stress, 2),
                "meeting_stress": round(meetings_stress, 2),
                "caffeine_stress": round(caffeine_stress, 2),
                "meditation_benefit": round(meditation_benefit, 2)
            }
        }
    
    def _get_risk_level(self, score: float) -> str:
        """Determine risk level from score"""
        if score < 30:
            return "low"
        elif score < 60:
            return "moderate"
        elif score < 80:
            return "high"
        else:
            return "critical"
    
    def predict_health_risks(self, health_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict health risks based on historical health metrics
        """
        
        recent_metrics = health_history[-30:] if len(health_history) > 30 else health_history
        
        # Calculate trends
        stress_scores = [m.get("stress_score", 50) for m in recent_metrics]
        sleep_hours = [m.get("sleep_hours", 7) for m in recent_metrics]
        exercise_minutes = [m.get("exercise_minutes", 30) for m in recent_metrics]
        
        stress_trend = self._calculate_trend(stress_scores)
        sleep_trend = self._calculate_trend(sleep_hours)
        exercise_trend = self._calculate_trend(exercise_minutes)
        
        # Identify risks
        risks = []
        
        if np.mean(stress_scores) > 70:
            risks.append({
                "type": "high_stress",
                "severity": "high",
                "description": "Chronic stress levels elevated",
                "recommendation": "Increase meditation/yoga, reduce work hours"
            })
        
        if np.mean(sleep_hours) < 6:
            risks.append({
                "type": "sleep_deprivation",
                "severity": "high",
                "description": "Insufficient sleep detected",
                "recommendation": "Maintain consistent sleep schedule, avoid screens 1h before bed"
            })
        
        if np.mean(exercise_minutes) < 20:
            risks.append({
                "type": "physical_inactivity",
                "severity": "moderate",
                "description": "Low physical activity",
                "recommendation": "Aim for 30-60 minutes daily exercise"
            })
        
        if stress_trend > 0:
            risks.append({
                "type": "rising_stress",
                "severity": "moderate",
                "description": "Stress levels trending upward",
                "recommendation": "Monitor stress carefully, take preventive action"
            })
        
        return {
            "identified_risks": risks,
            "risk_count": len(risks),
            "trends": {
                "stress": stress_trend,
                "sleep": sleep_trend,
                "exercise": exercise_trend
            },
            "recommendations": self._generate_health_recommendations(risks, stress_trend)
        }
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate linear trend"""
        if len(values) < 2:
            return 0
        
        x = np.arange(len(values))
        y = np.array(values)
        
        # Linear regression
        coeffs = np.polyfit(x, y, 1)
        return float(coeffs[0])  # Slope
    
    def _generate_health_recommendations(self, risks: List[Dict], stress_trend: float) -> List[str]:
        """Generate health recommendations"""
        recommendations = []
        
        if stress_trend > 0.1:
            recommendations.append("⚠️ Stress is increasing - implement daily stress management")
        
        if any(r["type"] == "sleep_deprivation" for r in risks):
            recommendations.append("😴 Prioritize sleep - aim for consistent 7-8 hours daily")
        
        if any(r["type"] == "physical_inactivity" for r in risks):
            recommendations.append("🏃 Increase physical activity - 30-60 minutes daily exercise")
        
        if any(r["type"] == "high_stress" for r in risks):
            recommendations.append("🧘 Try meditation - even 10 minutes daily helps")
        
        recommendations.append("📊 Track metrics regularly to monitor trends")
        
        return recommendations
    
    def suggest_wellness_routine(self, stress_level: str) -> Dict[str, List[str]]:
        """
        Suggest wellness routine based on stress level
        """
        routines = {
            "low": {
                "morning": ["5 min stretch", "10 min walk", "Hydrate"],
                "afternoon": ["5 min breathing exercise", "Healthy snack", "5 min walk"],
                "evening": ["30 min exercise", "15 min meditation", "8 hours sleep"]
            },
            "moderate": {
                "morning": ["10 min yoga", "15 min walk", "Healthy breakfast"],
                "afternoon": ["10 min meditation", "Stress relief tea", "10 min break"],
                "evening": ["45 min exercise", "20 min meditation", "8-9 hours sleep"]
            },
            "high": {
                "morning": ["15 min yoga", "20 min walk", "Healthy breakfast"],
                "afternoon": ["20 min meditation", "Stress relief session", "15 min break"],
                "evening": ["60 min exercise", "30 min meditation", "9 hours sleep"]
            },
            "critical": {
                "morning": ["20 min yoga", "30 min walk", "Healthy breakfast"],
                "afternoon": ["30 min meditation", "Therapy/counseling", "20 min break"],
                "evening": ["60-90 min exercise", "45 min meditation", "9-10 hours sleep"]
            }
        }
        
        return routines.get(stress_level, routines["moderate"])
