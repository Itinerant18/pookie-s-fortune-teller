import logging
from typing import Dict, Any, Optional
from sqlalchemy import text
from src.utils.database import Database

logger = logging.getLogger(__name__)

class ModelRegistry:
    def __init__(self, db: Database):
        self.db = db
        self.current_model_id = None
        # Hardcoded version for now - in production this might come from a config or build file
        self.current_version = "1.0.0" 
        self.model_name = "income_forecast_ensemble"

    async def register_model(self) -> Optional[str]:
        """
        Register the current model version in the database if it doesn't exist.
        Returns the model_id.
        """
        try:
            if not self.db.engine:
                logger.warning("Database not connected, cannot register model")
                return None

            async with self.db.engine.begin() as conn:
                # Check if model exists
                result = await conn.execute(
                    text("SELECT id FROM model_registry WHERE name = :name AND version = :version"),
                    {"name": self.model_name, "version": self.current_version}
                )
                existing_model = result.fetchone()

                if existing_model:
                    self.current_model_id = str(existing_model[0])
                    logger.info(f"Using existing model version: {self.model_name} v{self.current_version} ({self.current_model_id})")
                else:
                    # Register new model
                    # In a real scenario, parameters and features_config would be dynamic
                    result = await conn.execute(
                        text("""
                            INSERT INTO model_registry (name, version, type, status, parameters, features_config)
                            VALUES (:name, :version, 'ensemble', 'production', 
                                    '{"models": ["arima", "sarima", "exponential_smoothing"]}', 
                                    '{"inputs": ["date", "value"]}')
                            RETURNING id
                        """),
                        {"name": self.model_name, "version": self.current_version}
                    )
                    self.current_model_id = str(result.fetchone()[0])
                    logger.info(f"Registered new model version: {self.model_name} v{self.current_version} ({self.current_model_id})")
            
            return self.current_model_id

        except Exception as e:
            logger.error(f"Failed to register model: {e}")
            return None

    def get_model_id(self) -> Optional[str]:
        return self.current_model_id
