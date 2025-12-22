from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Server
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/prediction_app"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    postgres_url: str = ""
    direct_url: str = ""
    supabase_publishable_default_key: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_CACHE_TTL: int = 3600

    # ML Models
    MODEL_PATH: str = "./models"
    MODEL_CACHE_SIZE: int = 500

    # API Keys
    OPENAI_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""

    # Logging
    LOG_FILE: str = "logs/ml_engine.log"
    SENTRY_DSN: str = ""

    # Feature Flags
    ENABLE_CACHE: bool = True
    ENABLE_MONITORING: bool = True
    BATCH_PREDICTION: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
