"""
Main FastAPI application entry point
Initializes all services, routes, and middleware
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from datetime import datetime

from src.config.settings import Settings
from src.utils.logger import setup_logger
from src.utils.database import Database
from src.utils.cache import CacheManager

# Import routes
from src.api.routes import astrology, forecast, health, relationships, embeddings

# Setup logger
logger = setup_logger(__name__)
settings = Settings()

# Global instances
db: Database = None
cache: CacheManager = None
model_registry = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events
    Manages database connections, cache, and resource cleanup
    """
    # Startup
    logger.info("Starting ML Engine...")
    
    global db, cache
    
    try:
        # Initialize database connection
        db = Database(settings.DATABASE_URL)
        await db.connect()
        logger.info("Database connected")
        
        # Initialize cache
        cache = CacheManager(settings.REDIS_URL)
        await cache.connect()
        logger.info("Redis cache connected")
        
        # Initialize Model Registry
        try:
            from src.utils.model_registry import ModelRegistry
            global model_registry
            model_registry = ModelRegistry(db)
            await model_registry.register_model()
            
            # Expose via app state
            app.state.model_registry = model_registry
            logger.info("Model Registry initialized")
        except Exception as e:
            logger.error(f"Failed to register model: {e}")
            # Continue startup - app can still serve predictions without saving
        
        # Expose db via app state
        app.state.db = db
        
        logger.info("ML Engine ready to serve requests")
    
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down ML Engine...")
    
    try:
        if cache:
            await cache.disconnect()
        if db:
            await db.disconnect()
        logger.info("Cleanup completed")
    
    except Exception as e:
        logger.error(f"Shutdown error: {e}")

# Create FastAPI app
app = FastAPI(
    title="Prediction App ML Engine",
    description="ML & Astrology prediction service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Custom middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = datetime.now()
    
    response = await call_next(request)
    
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - Time: {process_time:.3f}s"
    )
    
    return response

@app.get("/", tags=["General"])
async def root():
    """Root endpoint to verify service is running"""
    return {
        "message": "Hybrid Prediction ML Engine is running",
        "docs_url": "/docs",
        "health_url": "/health"
    }

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    Returns status of all services
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": await db.health_check(),
            "cache": await cache.health_check()
        }
    }

# Include route modules
app.include_router(astrology.router)
app.include_router(forecast.router)
app.include_router(health.router)
app.include_router(relationships.router)
app.include_router(embeddings.router)

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_id": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )