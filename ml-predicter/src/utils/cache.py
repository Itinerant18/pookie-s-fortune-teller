import redis.asyncio as redis
import json
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self, url: str):
        self.url = url
        self.redis = None

    async def connect(self):
        try:
            self.redis = redis.from_url(self.url, encoding="utf-8", decode_responses=True)
            await self.redis.ping()
            logger.info("Redis cache connected")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            self.redis = None

    async def disconnect(self):
        if self.redis:
            await self.redis.close()
            logger.info("Redis disconnected")

    async def health_check(self):
        if not self.redis:
            return "disconnected"
        try:
            await self.redis.ping()
            return "connected"
        except Exception:
            return "error"

    def cache_prediction(self, ttl_seconds=86400):
        """Decorator to cache predictions using the instance redis client"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                if not self.redis:
                    return await func(*args, **kwargs)

                # Create cache key
                # Note: args[0] is typically 'self' for class methods, need to be careful
                # Ideally, this should be used on standalone functions or we need a way to handle 'self'
                # For simplicity, we just stringify args and kwargs.
                cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
                
                try:
                    # Check cache
                    cached = await self.redis.get(cache_key)
                    if cached:
                        return json.loads(cached)
                except Exception as e:
                    logger.warning(f"Cache get failed: {e}")

                # Call function
                result = await func(*args, **kwargs)
                
                try:
                    # Cache result
                    await self.redis.setex(
                        cache_key,
                        ttl_seconds,
                        json.dumps(result, default=str)
                    )
                except Exception as e:
                    logger.warning(f"Cache set failed: {e}")
                
                return result
            
            return wrapper
        return decorator
